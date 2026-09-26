import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { payBooking } from '@/server/services/marketplace';

export const POST = route({ auth: 'required', body: schemas.pay, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer, params }) =>
  withStatus(200, await payBooking(viewer, params.id, body)));
