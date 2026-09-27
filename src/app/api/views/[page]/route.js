import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { VIEWS } from '@/server/views';

export const GET = route({ auth: 'optional' }, async ({ params, viewer, session, query }) => {
  const load = VIEWS[params.page];
  if (!load) throw notFound();
  // `session` is set last so a query parameter can never stand in for it.
  return load(viewer, { ...query, session });
});
