import { route, withStatus } from '@/server/http';
import { invalid } from '@/server/errors';
import { remindShare } from '@/server/services/splits';

export const POST = route({ auth: 'required' }, async ({ viewer, params }) => {
  const position = Number.parseInt(params.position, 10);
  if (!Number.isInteger(position) || position < 0 || position > 9) throw invalid('Unknown share.');
  return withStatus(200, await remindShare(viewer, params.slug, position));
});
