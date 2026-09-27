import { revalidateTag } from 'next/cache';
import { route, withStatus } from '@/server/http';
import { notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { cancelEvent, setEventStatus } from '@/server/services/events';
import { refundOrder } from '@/server/services/checkout';

export const POST = route({ auth: 'required', body: schemas.eventStatus }, async ({ body, viewer, params }) => {
  const event = await prisma.event.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!event) throw notFound();
  const result = body.action === 'cancel' ? await cancelEvent(viewer, event.id, body.reason, { refundOrder }) : await setEventStatus(viewer, event.id, body.action);
  revalidateTag('guide');
  return withStatus(200, result);
});
