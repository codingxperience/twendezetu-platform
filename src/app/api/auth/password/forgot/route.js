import { after } from 'next/server';
import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { log } from '@/server/log';
import { deliverPasswordReset, guardPasswordResetRequest } from '@/server/services/identity';

// Answers at once, the same way for every address; the account lookup and
// the email run after the response so their timing reveals nothing.
export const POST = route({ auth: 'none', body: schemas.forgot, limit: [{ policy: 'auth.password', by: 'ip' }] }, async ({ body, ip }) => {
  const email = await guardPasswordResetRequest(body.email, ip);
  after(() => deliverPasswordReset(email, { ipAddress: ip }).catch((error) => log.error('password reset delivery crashed', { error: error.message })));
  return withStatus(200, { sent: true, message: 'If that email has an account, a reset link is on its way.' });
});
