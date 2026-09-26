import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { completeTwoFactor, resendTwoFactor } from '@/server/services/identity';

// Finishes a sign-in that needs the texted code.
export const POST = route({ auth: 'required', allowPendingMfa: true, body: schemas.code, limit: [{ policy: 'otp.verify', by: 'user' }] }, async ({ body, viewer, session, ip }) => {
  await completeTwoFactor({ userId: viewer.id, sessionId: session.id, code: body.code, ipAddress: ip });
  return withStatus(200, { verified: true });
});

export const PUT = route({ auth: 'required', allowPendingMfa: true, limit: [{ policy: 'otp.send', by: 'user' }] }, async ({ viewer }) => {
  await resendTwoFactor(viewer.id);
  return { sent: true };
});
