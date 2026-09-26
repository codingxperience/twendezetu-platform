import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { getEventPage, toEventCard } from '@/server/services/events';

export const GET = route({ auth: 'optional' }, async ({ params, viewer }) => {
  const page = await getEventPage(params.slug, viewer);
  if (!page) throw notFound('That event could not be found.');
  return { event: toEventCard(page.event), isOwner: page.isOwner };
});
