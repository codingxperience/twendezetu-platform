import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { eventCalendar } from '@/server/services/events';

export const GET = route({ auth: 'optional' }, async ({ params, viewer }) => {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });
  if (!event || (event.status !== 'PUBLISHED' && event.status !== 'CANCELLED') || event.hiddenAt) throw notFound();
  const rsvp = viewer ? await prisma.rsvp.findFirst({ where: { eventId: event.id, userId: viewer.id }, select: { reminderPlan: true } }) : null;
  return new Response(eventCalendar(event, rsvp?.reminderPlan === 'off' ? '' : rsvp?.reminderPlan || '1d'), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${event.slug}.ics"`,
      'cache-control': 'private, max-age=300',
    },
  });
});
