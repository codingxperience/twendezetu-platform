import { revalidateTag } from 'next/cache';
import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { getEventPage, toEventCard, updateEvent } from '@/server/services/events';

export const GET = route({ auth: 'optional' }, async ({ params, viewer }) => {
  const page = await getEventPage(params.slug, viewer);
  if (!page) throw notFound('That event could not be found.');
  return { event: toEventCard(page.event), isOwner: page.isOwner };
});

export const PATCH = route({ auth: 'required', body: schemas.updateEvent }, async ({ params, viewer, body }) => {
  const event = await prisma.event.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!event) throw notFound();
  const result = await updateEvent(viewer, event.id, body);
  revalidateTag('guide');
  return { event: result };
});
