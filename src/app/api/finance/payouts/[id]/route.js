import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { markPayoutFailed, markPayoutPaid } from '@/server/services/payouts';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'], body: schemas.payoutAction, idempotent: true }, async ({ body, viewer, params }) =>
  withStatus(200, body.action === 'paid' ? await markPayoutPaid(viewer, params.id, body.externalRef) : await markPayoutFailed(viewer, params.id, body.reason)));
