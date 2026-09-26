import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { coverRemaining } from '@/server/services/splits';

export const POST = route({ auth: 'required', body: schemas.stepUp, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer, params }) =>
  withStatus(200, await coverRemaining(viewer, params.slug, body.code)));
