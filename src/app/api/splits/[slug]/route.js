import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { splitView } from '@/server/services/splits';

export const GET = route({ auth: 'optional' }, async ({ viewer, params }) => {
  const split = await splitView(params.slug, viewer);
  if (!split) throw notFound('That split link is not valid.');
  return { split };
});
