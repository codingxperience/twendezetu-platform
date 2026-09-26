import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { cashOut } from '@/server/services/wallet';

export const POST = route({ auth: 'required', body: schemas.cashOut, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer }) => cashOut(viewer, body));
