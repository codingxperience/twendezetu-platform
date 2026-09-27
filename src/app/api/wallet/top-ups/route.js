import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { startTopUp } from '@/server/services/wallet';

export const POST = route({ auth: 'required', body: schemas.topUp, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer }) => startTopUp(viewer, body.usd));
