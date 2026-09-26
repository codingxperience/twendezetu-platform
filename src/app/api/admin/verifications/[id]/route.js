import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { reviewApplication } from '@/server/services/verification';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], body: schemas.adminVerification }, async ({ body, viewer, params }) =>
  withStatus(200, await reviewApplication(viewer, params.id, body)));
