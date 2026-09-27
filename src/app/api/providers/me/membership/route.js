import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { renewMembership } from '@/server/services/providers';

export const POST = route({ auth: 'required', body: schemas.membership, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer }) =>
  withStatus(200, await renewMembership(viewer, body)));
