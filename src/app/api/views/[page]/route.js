import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { VIEWS } from '@/server/views';

export const GET = route({ auth: 'optional' }, async ({ params, viewer, query }) => {
  const load = VIEWS[params.page];
  if (!load) throw notFound();
  return load(viewer, query);
});
