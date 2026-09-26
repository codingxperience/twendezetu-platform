import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { actOnReport } from '@/server/services/moderation';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], body: schemas.adminReport }, async ({ body, viewer, params }) => withStatus(200, await actOnReport(viewer, params.id, body.action)));
