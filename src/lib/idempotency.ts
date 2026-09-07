import { getDb } from './mongodb';

const TTL_SECONDS = 24 * 60 * 60; // 24h
const STALE_MS = 60_000; // processing record older than 60s is considered stale (crash recovery)
const POLL_INTERVAL_MS = 500;
const POLL_MAX_MS = 25_000;

let indexesEnsured = false;

async function ensureIndexes() {
  if (indexesEnsured) return;
  try {
    const db = await getDb();
    const coll: any = db.collection('idempotency_keys');
    if (coll.createIndex) {
      await coll.createIndex({ key: 1 }, { unique: true }).catch(() => {});
      await coll.createIndex({ createdAt: 1 }, { expireAfterSeconds: TTL_SECONDS }).catch(() => {});
    }
  } catch {
    // mock DB or index already exists — ignore
  }
  indexesEnsured = true;
}

export type IdemAcquireResult =
  | { action: 'new' }
  | { action: 'replay'; statusCode: number; body: any }
  | { action: 'processing' };

/**
 * Try to acquire an idempotency key. Must be called right after auth, before any
 * expensive work. The composite key should be `${userId}:${idempotencyKey}` so
 * different users never collide.
 */
export async function acquireIdempotency(
  compositeKey: string,
  userId: string
): Promise<IdemAcquireResult> {
  await ensureIndexes();
  const db = await getDb();
  const coll = db.collection('idempotency_keys') as any;

  // Fast path: does a record already exist?
  const existing = await coll.findOne({ key: compositeKey });
  if (existing) {
    if (existing.status === 'done') {
      // Only replay to the same user (compositeKey already encodes userId, but double-check)
      if (existing.userId && existing.userId !== userId) {
        // Different user somehow reused same composite — treat as new (should not happen)
      } else {
        return { action: 'replay', statusCode: existing.statusCode ?? 200, body: existing.body };
      }
    }
    if (existing.status === 'processing') {
      const age = Date.now() - new Date(existing.createdAt).getTime();
      if (age > STALE_MS) {
        // Stale — reclaim it
        await coll.deleteOne({ key: compositeKey }).catch(() => {});
        // fall through to insert below
      } else {
        // Poll for completion — the original request may still be running
        const deadline = Date.now() + POLL_MAX_MS;
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          const cur = await coll.findOne({ key: compositeKey });
          if (cur?.status === 'done') {
            return { action: 'replay', statusCode: cur.statusCode ?? 200, body: cur.body };
          }
          if (!cur || cur.status !== 'processing') break;
        }
        // Still processing after poll window — tell caller to return 409
        const still = await coll.findOne({ key: compositeKey });
        if (still?.status === 'processing') {
          return { action: 'processing' };
        }
        if (still?.status === 'done') {
          return { action: 'replay', statusCode: still.statusCode ?? 200, body: still.body };
        }
      }
    }
  }

  // Try to claim the key
  try {
    await coll.insertOne({
      key: compositeKey,
      userId,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { action: 'new' };
  } catch (err: any) {
    // Duplicate key race — another request claimed it just now
    const dup = err?.code === 11000 || err?.message?.includes('duplicate') || err?.message?.includes('E11000');
    if (dup) {
      const cur = await coll.findOne({ key: compositeKey });
      if (cur?.status === 'done') {
        return { action: 'replay', statusCode: cur.statusCode ?? 200, body: cur.body };
      }
      return { action: 'processing' };
    }
    // Unexpected insert error — don't block the request
    console.warn('[Idempotency] insert failed, proceeding without dedupe:', err?.message);
    return { action: 'new' };
  }
}

export async function completeIdempotency(
  compositeKey: string,
  statusCode: number,
  body: any
): Promise<void> {
  try {
    const db = await getDb();
    const coll = db.collection('idempotency_keys') as any;
    await coll.updateOne(
      { key: compositeKey },
      { $set: { status: 'done', statusCode, body, updatedAt: new Date() } }
    );
  } catch (err) {
    console.warn('[Idempotency] complete failed for', compositeKey, err);
  }
}
