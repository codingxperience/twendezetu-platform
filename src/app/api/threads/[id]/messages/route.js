import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { sendMessage } from '@/server/services/threads';

export const POST = route({ auth: 'required', body: schemas.message, limit: [{ policy: 'messages.send', by: 'user' }] }, async ({ body, viewer, params }) =>
  ({ message: await sendMessage(viewer, params.id, body) }));
