import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server';
import { headers, cookies } from 'next/headers';

export async function auth() {
  if (process.env.NEXT_PUBLIC_E2E_TESTING === 'true' || process.env.INTEGRATION_TESTING === 'true') {
    try {
      const h = await headers();
      const c = await cookies();
      const e2eUserId = h.get('x-e2e-user-id') || c.get('e2e_user_id')?.value;
      if (e2eUserId) {
        return {
          userId: e2eUserId,
          protect: () => {},
          has: () => true,
        };
      }
    } catch {
      // Outside a request scope (e.g. direct handler invocation in integration tests)
      // — fall back to the hardcoded real Clerk test user when INTEGRATION_TESTING is set.
      if (process.env.INTEGRATION_TESTING === 'true') {
        return {
          userId: 'user_3GrnnHQd2g7XpULXr77bN4gtR0G',
          protect: async () => {},
          has: () => true,
        };
      }
    }
  }
  return clerkAuth();
}

export async function currentUser() {
  if (process.env.NEXT_PUBLIC_E2E_TESTING === 'true' || process.env.INTEGRATION_TESTING === 'true') {
    const h = await headers();
    const c = await cookies();
    const e2eUserId = h.get('x-e2e-user-id') || c.get('e2e_user_id')?.value;
    const e2eUserEmail = h.get('x-e2e-user-email') || c.get('e2e_user_email')?.value || 'test@needboard.space';
    const e2eUserName = h.get('x-e2e-user-name') || c.get('e2e_user_name')?.value || 'Test User';
    const e2eUserRole = h.get('x-e2e-user-role') || c.get('e2e_user_role')?.value || 'user';

    if (e2eUserId) {
      return {
        id: e2eUserId,
        firstName: e2eUserName.split(' ')[0],
        lastName: e2eUserName.split(' ').slice(1).join(' '),
        fullName: e2eUserName,
        emailAddresses: [{ emailAddress: e2eUserEmail }],
        publicMetadata: { role: e2eUserRole },
      };
    }
  }
  return clerkCurrentUser();
}
