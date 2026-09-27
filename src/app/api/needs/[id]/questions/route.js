import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { askOnNeed } from '@/server/services/marketplace';

export const POST = route({ auth: 'required', body: schemas.question, limit: [{ policy: 'messages.send', by: 'user' }] }, async ({ body, viewer, params }) => askOnNeed(viewer, params.id, body.question));
