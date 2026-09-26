import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { setUserSuspended } from '@/server/services/moderation';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], body: schemas.adminUser }, async ({ body, viewer, params }) =>
  withStatus(200, await setUserSuspended(viewer, params.id, body.action === 'suspend', body.reason)));
