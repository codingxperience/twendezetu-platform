import { route, withStatus } from '@/server/http';
import { invalid } from '@/server/errors';
import { schemas } from '@/server/schemas';
import { payShare } from '@/server/services/splits';

export const POST = route({ auth: 'optional', body: schemas.payShare, idempotent: true, limit: [{ policy: 'money.move', by: 'ip' }] }, async ({ body, viewer, params }) => {
  const position = Number.parseInt(params.position, 10);
  if (!Number.isInteger(position) || position < 0 || position > 9) throw invalid('Unknown share.');
  return withStatus(200, await payShare({ slug: params.slug, position, viewer, name: body.name, email: body.email, channel: body.channel, code: body.code }));
});
