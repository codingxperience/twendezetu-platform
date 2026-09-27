import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { changePassword } from '@/server/services/identity';

export const POST = route({ auth: 'required', body: schemas.changePassword, limit: [{ policy: 'auth.password', by: 'user' }] }, async ({ body, viewer, session, ip }) =>
  withStatus(200, await changePassword(viewer, { currentPassword: body.currentPassword, newPassword: body.newPassword, sessionId: session.id, ipAddress: ip })));
