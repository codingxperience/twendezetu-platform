import { clearSessionCookie, route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { deleteAccount } from '@/server/services/identity';

export const DELETE = route({ auth: 'required', body: schemas.password, limit: [{ policy: 'auth.password', by: 'user' }] }, async ({ body, viewer, ip }) => {
  await deleteAccount(viewer, { password: body.password, ipAddress: ip });
  await clearSessionCookie();
  return withStatus(200, { deleted: true });
});
