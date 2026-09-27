import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { askProvider } from '@/server/services/providers';

export const POST = route({ auth: 'required', body: schemas.question, limit: [{ policy: 'messages.send', by: 'user' }] }, async ({ body, viewer, params }) => askProvider(viewer, params.slug, body.question));
