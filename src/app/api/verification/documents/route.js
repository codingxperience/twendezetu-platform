import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { attachDocument } from '@/server/services/verification';

export const POST = route({ auth: 'required', body: schemas.verificationDocument }, async ({ body, viewer }) => withStatus(200, await attachDocument(viewer, body.kind, body.fileId)));
