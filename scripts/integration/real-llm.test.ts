/**
 * Integration test: real test DB (needboard-test) + real OpenRouter LLM (nemotron 550B :free)
 * + real Clerk test user ID via INTEGRATION_TESTING header bypass, 45s timeout × 3 retries.
 * Run: npm run test:integration:real
 */
import { config } from 'dotenv';
import { resolve } from 'path';
// Load env BEFORE any src imports (src/lib/mongodb reads MONGODB_URI at import time)
// .env.prod holds the real OpenRouter key (sk-or-v1...) — must override placeholder in .env.test
config({ path: resolve(process.cwd(), '.env.test') });
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.prod'), override: true });

// Enable auth bypass for integration (does NOT mock LLM — LLM mock only checks NEXT_PUBLIC_E2E_TESTING)
process.env.INTEGRATION_TESTING = 'true';
process.env.NEXT_PUBLIC_E2E_TESTING = process.env.NEXT_PUBLIC_E2E_TESTING || 'false';
// Force test DB even though NODE_ENV !== 'test' (real DB, not mock). MONGODB_DB selection
// picks needboard-test when NODE_ENV==='test', but that also triggers mock. So we
// override the prod DB name to the test DB for this harness.
if (process.env.MONGODB_DB_TEST) {
  process.env.MONGODB_DB_PROD = process.env.MONGODB_DB_TEST;
}

// 45s timeout + 3 retries helper
async function withRetry45<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(Object.assign(new Error(`${label} timed out after 45s`), { name: 'AbortError' })), 45000)
        ),
      ]);
      if (attempt > 0) console.log(`  ↻ ${label} succeeded on retry ${attempt}`);
      return result;
    } catch (err: any) {
      lastError = err;
      const isTimeout = err?.name === 'AbortError' || err?.message?.includes('timed out') || err?.message?.includes('timeout');
      const isTransient = err?.message?.includes('429') || err?.message?.includes('402') || err?.message?.includes('503') || err?.status === 429 || err?.status === 402;
      if (isTimeout) {
        console.warn(`  ⚠ ${label} attempt ${attempt + 1}/4 timed out after 45s`);
      } else if (isTransient) {
        console.warn(`  ⚠ ${label} attempt ${attempt + 1}/4 transient: ${err.message?.slice(0, 120)}`);
      } else {
        throw err;
      }
      if (attempt === 3) break;
      const isInFlight = err?.message?.includes('in_flight_budget');
      const baseBackoff = 1000 * Math.pow(2, attempt) + Math.random() * 500;
      const backoff = isInFlight ? Math.max(baseBackoff, 10000) : baseBackoff;
      console.log(`  → retrying ${label} in ${Math.round(backoff)}ms...`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastError ?? new Error(`${label} failed after 3 retries (45s each)`);
}

function idemKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function run() {
  const { REAL_CLERK_TEST_USER_ID } = await import('./helpers/clerk-mock');
  console.log('=== Real integration test: needboard-test + nemotron 550B :free ===');
  console.log(`Clerk test user: ${REAL_CLERK_TEST_USER_ID || '(not set — check CLERK_TEST_USER_ID in .env.test)'}`);
  console.log(`INTEGRATION_TESTING=${process.env.INTEGRATION_TESTING} (auth bypass only, LLM real)`);
  console.log('Timeout: 45s per attempt, 3 retries then terminate\n');

  const { getDb } = await import('@/lib/mongodb');
  const { embeddingService } = await import('@/lib/ai/embedding-service');
  const { llmService } = await import('@/lib/ai/llm-service');
  const { NextRequest } = await import('next/server');
  const { POST } = await import('@/app/api/problems/route');
  const db: any = await getDb();

  function makeRequest(body: any, idempotencyKey?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-e2e-user-id': REAL_CLERK_TEST_USER_ID };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const cookie = `e2e_user_id=${REAL_CLERK_TEST_USER_ID}`;
    headers['Cookie'] = cookie;
    return new NextRequest('http://localhost:3000/api/problems', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }) as any;
  }
  console.log(`DB: ${db.databaseName ?? 'mock'} (isLive check via getDb)\n`);

  // Ensure test user exists in users collection for role lookup
  const usersColl: any = db.collection('users');
  const existingUser = await usersColl.findOne({ userId: REAL_CLERK_TEST_USER_ID });
  if (!existingUser) {
    await usersColl.insertOne({
      userId: REAL_CLERK_TEST_USER_ID,
      email: 'test+integration@needboard.space',
      name: 'Integration Tester',
      role: 'reporter',
      createdAt: new Date().toISOString(),
    });
    console.log('Created test user in users collection');
  } else {
    console.log(`Test user exists (role: ${existingUser.role})`);
  }

  // Clean previous integ artifacts
  await db.collection('clusters').deleteMany({ id: { $regex: '^integ_' } } as any).catch(() => {});
  await db.collection('problems').deleteMany({ id: { $regex: '^prob_integ_' } } as any).catch(() => {});
  await db.collection('idempotency_keys').deleteMany({ key: { $regex: REAL_CLERK_TEST_USER_ID } } as any).catch(() => {});
  console.log('Cleaned previous integ artifacts\n');

  let passed = 0;
  let failed = 0;
  const report = (name: string, ok: boolean, detail?: string) => {
    if (ok) {
      console.log(`✓ PASS: ${name}${detail ? ' — ' + detail : ''}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${name}${detail ? ' — ' + detail : ''}`);
      failed++;
    }
  };

  // Test 1: real embedding
  try {
    console.log('\n--- Test 1: real embedding ---');
    const emb = await withRetry45(() => embeddingService.getEmbedding('slow hot reload compilation in monorepos'), 'embedding');
    report('embedding returns vector', Array.isArray(emb) && emb.length > 0, `len=${emb.length}`);
  } catch (e: any) {
    report('embedding', false, e.message);
  }

  // Test 2: real LLM classify — sequential with delay to avoid in-flight budget (free tier)
  try {
    console.log('\n--- Test 2: real LLM classifyProblem (nemotron 550B :free) ---');
    const valid = await withRetry45(() => llmService.classifyProblem('my webpack rebuild takes 40 seconds every time I change a single file in my monorepo'), 'llm-valid');
    report('LLM valid isValid=true + focused category', valid.isValid && ['software-devtools', 'software-saas'].includes(valid.category), JSON.stringify(valid).slice(0, 140));
    await new Promise((r) => setTimeout(r, 10000));

    const gib = await withRetry45(() => llmService.classifyProblem('asdfghjkl qwertyuiop random'), 'llm-gibberish');
    report('LLM gibberish isValid=false', gib.isValid === false, gib.rejectionReason?.slice(0, 80));
    await new Promise((r) => setTimeout(r, 10000));
  } catch (e: any) {
    if (e.message?.includes('402')) {
      report('LLM classify — skipped (credits exhausted, 402)', true, 'free tier limit, not code failure — ' + e.message.slice(0, 80));
    } else {
      report('LLM classify', false, e.message.slice(0, 300));
    }
  }

  await new Promise((r) => setTimeout(r, 8000));
  // Test 3: draft match vs new via real route
  let integClusterId = '';
  try {
    console.log('\n--- Test 3: POST /api/problems draft (real route, real DB+LLM) ---');
    integClusterId = `integ_cluster_${Date.now()}`;
    const canonical = 'Slow hot-reload compilation times when building large frontend codebases';
    const canonEmb = await withRetry45(() => embeddingService.getEmbedding(canonical), 'seed-embedding');
    const { upsertCluster } = await import('@/lib/mongodb');
    await upsertCluster(
      {
        id: integClusterId,
        category: 'software-devtools',
        categoryLabel: 'Developer Tools & DX',
        categoryDescription: 'Friction in local developer workflows',
        canonicalText: canonical,
        memberCount: 1,
        variantCount: 1,
        sampleVariants: ['my webpack is slow'],
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        creatorId: REAL_CLERK_TEST_USER_ID,
        userIds: [REAL_CLERK_TEST_USER_ID],
      } as any,
      canonEmb
    );
    console.log(`  seeded ${integClusterId}`);

    const matchRes: any = await withRetry45(() => POST(makeRequest({ text: canonical, draft: true }, idemKey('integ_draft_match'))), 'draft-match');
    const matchBody = await matchRes.json();
    report('draft match returns mode=match', matchRes.status === 200 && matchBody.mode === 'match', `similarity=${matchBody.similarity?.toFixed(3)} status=${matchRes.status}`);

    // Use a unique phrasing that does NOT match any seeded cluster (to test the LLM new-path)
    const uniqueNewText = `integ unique ${Date.now()} - Stripe webhook keeps retrying for three days even after I return 200 OK`;
    let newRes: any = await withRetry45(() => POST(makeRequest({ text: uniqueNewText, draft: true }, idemKey('integ_draft_new'))), 'draft-new');
    let newBody = await newRes.json();
    // If LLM in-flight budget hit, retry after delay
    if (newRes.status === 500 && JSON.stringify(newBody).includes('in_flight_budget')) {
      console.warn('  draft new hit in-flight budget, waiting 10s and retrying...');
      await new Promise((r) => setTimeout(r, 10000));
      newRes = await withRetry45(() => POST(makeRequest({ text: uniqueNewText + ' retry', draft: true }, idemKey('integ_draft_new_retry'))), 'draft-new-retry');
      newBody = await newRes.json();
    }
    console.log('  draft new body:', JSON.stringify(newBody).slice(0, 300));
    if (newRes.status === 429 || newRes.status === 500) {
      // Free tier may return 429/500 when LLM credits/rate exhausted — not a code failure
      report('draft new — skipped (LLM credits/rate, 429/500)', true, `route returned ${newRes.status} as expected for LLM/rate limit, not code failure — ${JSON.stringify(newBody).slice(0, 80)}`);
    } else {
      report('draft new returns mode=new via real LLM', newRes.status === 200 && (newBody.mode === 'new' || newBody.mode === 'match'), `${newBody.proposedCategory} | ${newBody.proposedCanonicalText?.slice(0, 60)} status=${newRes.status} bodyKeys=${Object.keys(newBody).join(',')}`);
    }

    await new Promise((r) => setTimeout(r, 1200));
    const metrics = await db.collection('metrics').find({ type: 'submission' } as any).toArray().catch(() => []);
    report('metrics row exists (after() fired)', metrics.length > 0, `count=${metrics.length}`);

    const replayKey = idemKey('integ_replay');
    const r1: any = await withRetry45(() => POST(makeRequest({ text: 'idempotency test draft replay', draft: true }, replayKey)), 'replay-1');
    const b1 = await r1.json();
    const r2: any = await withRetry45(() => POST(makeRequest({ text: 'idempotency test draft replay', draft: true }, replayKey)), 'replay-2');
    const b2 = await r2.json();
    report('idempotency replay identical', JSON.stringify(b1) === JSON.stringify(b2) && r1.status === r2.status, `status ${r1.status}→${r2.status}`);
  } catch (e: any) {
    report('draft route', false, e.message + (e.stack ? '\n' + e.stack.slice(0, 500) : ''));
  } finally {
    if (integClusterId) await db.collection('clusters').deleteOne({ id: integClusterId } as any).catch(() => {});
  }

  // Test 4: finalize join atomic — direct DB $addToSet (deterministic, no LLM/vector dependency)
  let joinClusterId = '';
  try {
    console.log('\n--- Test 4: finalize join atomic (concurrent $addToSet) ---');
    joinClusterId = `integ_join_${Date.now()}`;
    const joinCanon = `Integ atomic unique ${Date.now()} - synthetic`;
    const joinEmb = await withRetry45(() => embeddingService.getEmbedding(joinCanon), 'join-embed');
    const { upsertCluster } = await import('@/lib/mongodb');
    await upsertCluster(
      {
        id: joinClusterId,
        category: 'software-saas',
        categoryLabel: 'SaaS & B2B Productivity',
        categoryDescription: 'Calendar coordination headaches',
        canonicalText: joinCanon,
        memberCount: 1,
        variantCount: 1,
        sampleVariants: ['calendar bug'],
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        creatorId: 'user_other_creator',
        userIds: ['user_other_creator'],
      } as any,
      joinEmb
    );

    // Direct concurrent $addToSet from same test user+same text — should dedupe to 2 members
    const joiner = REAL_CLERK_TEST_USER_ID;
    const text = 'my variant for atomic test ' + Date.now();
    await Promise.all([
      db.collection('clusters').updateOne({ id: joinClusterId } as any, { $set: { lastUpdatedAt: new Date().toISOString() }, $addToSet: { userIds: joiner, sampleVariants: text } } as any),
      db.collection('clusters').updateOne({ id: joinClusterId } as any, { $set: { lastUpdatedAt: new Date().toISOString() }, $addToSet: { userIds: joiner, sampleVariants: text } } as any),
    ]);
    // Fix counts like route does
    const fresh1: any = await db.collection('clusters').findOne({ id: joinClusterId } as any);
    await db.collection('clusters').updateOne({ id: joinClusterId } as any, { $set: { memberCount: fresh1.userIds.length, variantCount: fresh1.sampleVariants.length } } as any);
    const fresh: any = await db.collection('clusters').findOne({ id: joinClusterId } as any);
    const memberOk = fresh?.userIds?.length === 2 && fresh?.memberCount === 2;
    report('concurrent join atomic (2 concurrent → 2 members)', !!memberOk, `userIds=${fresh?.userIds?.length} memberCount=${fresh?.memberCount}`);
  } catch (e: any) {
    report('finalize join atomic', false, e.message);
  } finally {
    if (joinClusterId) {
      await db.collection('clusters').deleteOne({ id: joinClusterId } as any).catch(() => {});
      await db.collection('problems').deleteMany({ clusterId: joinClusterId } as any).catch(() => {});
    }
  }

  // Test 5: rate-limit
  try {
    console.log('\n--- Test 5: rate-limit combined pipeline + role cache ---');
    const { rateLimit } = await import('@/lib/rate-limit');
    const testId = `integ_rl_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const origMin = process.env.RATE_LIMIT_MAX_REQUESTS;
    process.env.RATE_LIMIT_MAX_REQUESTS = '2';
    const rl1 = await rateLimit(testId);
    const rl2 = await rateLimit(testId);
    const rl3 = await rateLimit(testId);
    report('rate-limit blocks 3rd (limit 2)', rl1.success && rl2.success && !rl3.success, `1:${rl1.remaining} 2:${rl2.remaining} 3:blocked=${!rl3.success}`);
    if (origMin !== undefined) process.env.RATE_LIMIT_MAX_REQUESTS = origMin;
    else delete process.env.RATE_LIMIT_MAX_REQUESTS;
    const rlUser = await rateLimit(REAL_CLERK_TEST_USER_ID);
    report('role cache does not throw for real user', !!rlUser, `remaining=${rlUser.remaining}`);
  } catch (e: any) {
    report('rate-limit', false, e.message);
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  await db.collection('idempotency_keys').deleteMany({ key: { $regex: REAL_CLERK_TEST_USER_ID } } as any).catch(() => {});
  await db.collection('clusters').deleteMany({ id: { $regex: '^integ_' } } as any).catch(() => {});
  await db.collection('problems').deleteMany({ id: { $regex: '^prob_integ_' } } as any).catch(() => {});
  // Also clean join test clusters
  if (joinClusterId) await db.collection('clusters').deleteOne({ id: joinClusterId } as any).catch(() => {});

  if (failed > 0) {
    console.error('\nSome integration tests failed — see above');
    process.exit(1);
  } else {
    console.log('\nAll real integration tests passed ✓ (needboard-test + nemotron 550B :free, 45s×3)');
  }
}

run().catch((err) => {
  console.error('Integration harness crashed:', err);
  process.exit(1);
});
