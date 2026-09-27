import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { sendPoints } from '@/server/services/wallet';

export const POST = route({ auth: 'required', body: schemas.transfer, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer }) => sendPoints(viewer, body));
