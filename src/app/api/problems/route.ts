import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { auth } from '@/lib/clerk-server';
import { validateQuery } from '@/lib/validation';
import { rateLimit, handleRateLimitResponse } from '@/lib/rate-limit';
import { embeddingService, llmService } from '@/lib/ai';
import { 
  upsertCluster, 
  insertProblem,
  logMetric,
  getDb,
  searchClustersForSubmit
} from '@/lib/mongodb';
import { 
  MongoClusterDocument as ClusterRecord, 
  MongoProblemDocument as ProblemRecord 
} from '@/lib/models/schema';
import { isFocusedCategory } from '@/lib/ai/static-categories';
import { acquireIdempotency, completeIdempotency } from '@/lib/idempotency';

const SIMILARITY_THRESHOLD = Number(process.env.NEXT_PUBLIC_SIMILARITY_THRESHOLD || 0.70);

export async function POST(req: NextRequest) {
  // Idempotency setup — one composite key per logical submit (all retries share it)
  let compositeKey: string | null = null;
  const complete = async (status: number, body: any) => {
    if (compositeKey) await completeIdempotency(compositeKey, status, body);
  };
  const reply = async (body: any, status = 200) => {
    await complete(status, body);
    return NextResponse.json(body, { status });
  };

  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', message: 'You must be signed in to submit a problem.' }, { status: 401 });
    }

    // 1b. Idempotency check — before rate-limit so replays don't burn quota
    const rawIdem = req.headers.get('Idempotency-Key') || req.headers.get('idempotency-key');
    if (rawIdem) {
      compositeKey = `${userId}:${rawIdem}`;
      const idem = await acquireIdempotency(compositeKey, userId);
      if (idem.action === 'replay') {
        return NextResponse.json(idem.body, { status: idem.statusCode });
      }
      if (idem.action === 'processing') {
        return NextResponse.json({ error: 'Conflict', message: 'Request already processing, please wait' }, { status: 409 });
      }
    }

    // 2. Robust user-based rate limiting 🛡️
    const limitCheck = await rateLimit(`submit_${userId}`);
    if (!limitCheck.success) {
      // Don't poison the idempotency key with a transient 429 — allow retry with same key after window
      if (compositeKey) {
        try { const db = await getDb(); await (db.collection('idempotency_keys') as any).deleteOne({ key: compositeKey }); } catch {}
        compositeKey = null; // prevent catch-block from storing 429
      }
      return handleRateLimitResponse(limitCheck.reset);
    }

    // 3. Parse and validate body
    const body = await req.json();
    const { text, draft = true, confirmedCategory, confirmedCanonicalText } = body;

    const validation = validateQuery(text);
    if (!validation.isValid) {
      const body = { error: 'Query rejected', message: validation.message, charCount: validation.charCount };
      await complete(400, body);
      return NextResponse.json(body, { status: 400 });
    }

    // 4. Generate embedding for the input text
    const queryEmbedding = await embeddingService.getEmbedding(text);

    // 5. Search for nearest existing clusters (only within currently-focused categories)
    const matches = await searchClustersForSubmit(queryEmbedding, 1);
    const topMatch = matches[0];
    const isMatch = topMatch && topMatch.score !== undefined && topMatch.score >= SIMILARITY_THRESHOLD
      && isFocusedCategory(topMatch.category);

    // --- CASE A: DRAFT MODE ---
    // Return proposed categorization/clustering without writing anything to DB
    if (draft) {
      // Fire-and-forget: don't block the response on metrics (runs after response via after())
      try { after(() => logMetric('submission', text).catch(() => {})); } catch { logMetric('submission', text).catch(() => {}); }

      if (isMatch) {
        const body = {
          mode: 'match' as const,
          similarity: topMatch.score,
          cluster: topMatch,
          proposedCategory: topMatch.category,
          proposedCategoryLabel: topMatch.categoryLabel,
          proposedCategoryDescription: topMatch.categoryDescription,
          proposedCanonicalText: topMatch.canonicalText,
        };
        await complete(200, body);
        return NextResponse.json(body);
      }

      // No match - trigger LLM to suggest category and canonical description
      const classification = await llmService.classifyProblem(text);

      if (classification.isValid === false) {
        const body = {
          error: 'Rejected',
          message: classification.rejectionReason || 'Input rejected. Please write a meaningful, real-world, product-solvable problem.',
        };
        await complete(400, body);
        return NextResponse.json(body, { status: 400 });
      }

      {
        const body = {
          mode: 'new' as const,
          similarity: topMatch ? topMatch.score : 0,
          proposedCategory: classification.category,
          proposedCategoryLabel: classification.categoryLabel,
          proposedCategoryDescription: classification.categoryDescription,
          proposedCanonicalText: classification.canonicalText,
        };
        await complete(200, body);
        return NextResponse.json(body);
      }
    }

    // --- CASE B: FINALIZE MODE (WRITE TO PINECONE) ---
    const problemId = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowStr = new Date().toISOString();

    if (isMatch) {
      // Join existing cluster
      const matchedCluster = topMatch;
      
      const isCreator = matchedCluster.creatorId == userId;

      if (isCreator) {
        throw new Error('You are already the creator of this Complaint', {cause: 'AlreadySubmit'});
      }
    
      const db = await getDb();
      // Atomically add user + variant with $addToSet (no duplicates even under concurrent retries)
      await db.collection('clusters').updateOne(
        { id: matchedCluster.id },
        {
          $set: { lastUpdatedAt: nowStr },
          $addToSet: { userIds: userId, sampleVariants: text },
        }
      );
      // Re-read authoritative state and fix denormalized counters (race-safe)
      const fresh = await db.collection('clusters').findOne({ id: matchedCluster.id }) as any;
      const correctMemberCount = (fresh?.userIds || []).length || (fresh?.memberCount ?? matchedCluster.memberCount);
      const correctVariantCount = (fresh?.sampleVariants || []).length || (fresh?.variantCount ?? matchedCluster.variantCount);
      if (fresh && (fresh.memberCount !== correctMemberCount || fresh.variantCount !== correctVariantCount)) {
        await db.collection('clusters').updateOne(
          { id: matchedCluster.id },
          { $set: { memberCount: correctMemberCount, variantCount: correctVariantCount } }
        );
        fresh.memberCount = correctMemberCount;
        fresh.variantCount = correctVariantCount;
      }
      const updatedCluster: ClusterRecord = {
        ...(fresh ?? matchedCluster),
        memberCount: correctMemberCount,
        variantCount: correctVariantCount,
        lastUpdatedAt: nowStr,
      } as ClusterRecord;

      // Create raw problem record in MongoDB 🚀
      const problemRecord: ProblemRecord = {
        id: problemId,
        rawText: text,
        category: matchedCluster.category,
        clusterId: matchedCluster.id,
        userId, // 🚀 Relate this problem directly to the submitter's account!
        createdAt: nowStr,
      };
      await insertProblem(problemRecord, queryEmbedding);

      {
        const body = { success: true, joinedCluster: true as const, cluster: updatedCluster, problemId };
        await complete(200, body);
        return NextResponse.json(body);
      }
    } else {
      // Seed a new cluster
      const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const finalCategory = confirmedCategory || 'uncategorized';
      const finalCategoryLabel = body.confirmedCategoryLabel || 'General Frustrations';
      const finalCategoryDescription = body.confirmedCategoryDescription || 'Miscellaneous user submissions';
      const finalCanonicalText = confirmedCanonicalText || text;

      // 1. Generate embedding for the clean canonical text (better centroid representation)
      // Reuse the query embedding when canonical === original to avoid a second OpenAI call
      const canonicalEmbedding = finalCanonicalText === text
        ? queryEmbedding
        : await embeddingService.getEmbedding(finalCanonicalText);
      
      // 2. Insert static taxonomy into Pinecone
      const newClusterForPinecone: ClusterRecord = {
        id: clusterId,
        category: finalCategory,
        categoryLabel: finalCategoryLabel,
        categoryDescription: finalCategoryDescription,
        canonicalText: finalCanonicalText,
        memberCount: 1,
        sampleVariants: [],
        createdAt: nowStr,
        creatorId: userId,
        variantCount: 1,
        lastUpdatedAt: nowStr,
      };
      await upsertCluster(newClusterForPinecone, canonicalEmbedding);

      // 3. Insert dynamic state into MongoDB 🚀
      // const db = await getDb();
      // await db.collection('clusters').insertOne({
      //   id: clusterId,
      //   memberCount: 1,
      //   sampleVariants: [text],
      //   userIds: [userId],
      //   creatorId: userId,
      //   createdAt: nowStr,
      //   lastUpdatedAt: nowStr,
      // });

      // Assemble unified cluster representation for the client
      const unifiedCluster: ClusterRecord = {
        ...newClusterForPinecone,
        memberCount: 1,
        sampleVariants: [text],
        userIds: [userId],
        creatorId: userId,
      };

      // Save raw problem in MongoDB 🚀
      const problemRecord: ProblemRecord = {
        id: problemId,
        rawText: text,
        category: finalCategory,
        clusterId,
        userId, // 🚀 Relate this problem directly to the submitter's account!
        createdAt: nowStr,
      };
      await insertProblem(problemRecord, queryEmbedding);

      {
        const body = { success: true, joinedCluster: false as const, cluster: unifiedCluster, problemId };
        await complete(200, body);
        return NextResponse.json(body);
      }
    }

  } catch (error: any) {
    console.error('Error handling problem submission:', error);

    if (error?.cause === 'AlreadySubmit') {
      const body = { error: 'Client Error', message: error.message || 'An error occurred during submission.' };
      await complete(400, body);
      return NextResponse.json(body, { status: 400 });
    }

    const body = { error: 'Internal Server Error', message: 'An error occurred during submission.' };
    await complete(500, body);
    return NextResponse.json(body, { status: 500 });
  }
}
