/**
 * Mock Clerk auth to return a real Clerk test user ID, without needing a session JWT.
 * This lets us hit real DB + real LLM while using a real Clerk user identity.
 * Values are read from env (CLERK_TEST_USER_ID / CLERK_TEST_USER_EMAIL) so that
 * no hard-coded secrets are committed. Set them in .env.test (gitignored).
 * Must be imported BEFORE the route handler that imports `auth` from '@/lib/clerk-server'.
 */
export const REAL_CLERK_TEST_USER_ID = process.env.CLERK_TEST_USER_ID || '';
export const REAL_CLERK_TEST_USER_EMAIL = process.env.CLERK_TEST_USER_EMAIL || '';
if (!REAL_CLERK_TEST_USER_ID) {
  console.warn('[integration] CLERK_TEST_USER_ID not set — integration tests will fallback to mock user');
}

export async function installClerkMock(userId: string = REAL_CLERK_TEST_USER_ID) {
  // Patch the clerk-server module's `auth` export to return our test user.
  // We do it via dynamic import + monkey-patch so the live binding updates.
  const clerkServer: any = await import('@/lib/clerk-server');
  const originalAuth = clerkServer.auth;
  clerkServer.auth = async () => ({
    userId,
    protect: async () => {},
    has: () => true,
  });
  return () => {
    clerkServer.auth = originalAuth;
  };
}
