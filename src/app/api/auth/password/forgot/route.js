import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { requestPasswordReset } from '@/server/services/identity';

export const POST = route({ auth: 'none', body: schemas.forgot, limit: [{ policy: 'auth.password', by: 'ip' }] }, async ({ body, ip }) => {
  await requestPasswordReset(body.email, ip);
  return withStatus(200, { sent: true, message: 'If that email has an account, a reset link is on its way.' });
});
