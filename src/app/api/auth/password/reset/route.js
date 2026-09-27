import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { resetPassword } from '@/server/services/identity';

export const POST = route({ auth: 'none', body: schemas.reset, limit: [{ policy: 'auth.password', by: 'ip' }] }, async ({ body, ip }) => {
  await resetPassword({ token: body.token, newPassword: body.password, ipAddress: ip });
  return withStatus(200, { reset: true });
});
