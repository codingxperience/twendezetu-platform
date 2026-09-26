import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { replyToReview } from '@/server/services/providers';

export const POST = route({ auth: 'required', body: schemas.reply }, async ({ body, viewer, params }) => withStatus(200, await replyToReview(viewer, params.id, body.text)));
