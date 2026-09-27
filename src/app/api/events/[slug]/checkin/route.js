import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { checkinEventFor, checkinStats, scanTicket } from '@/server/services/checkin';

export const GET = route({ auth: 'required' }, async ({ viewer, params }) => {
  const event = await checkinEventFor(viewer, params.slug);
  return { event: { slug: event.slug, title: event.title }, ...(await checkinStats(event.id, event.timezone)) };
});

export const POST = route({ auth: 'required', body: schemas.scan, limit: [{ policy: 'checkin.scan', by: 'user' }] }, async ({ body, viewer, params }) => {
  const outcome = await scanTicket(viewer, params.slug, body.code);
  const event = await checkinEventFor(viewer, params.slug);
  return withStatus(200, { outcome, ...(await checkinStats(event.id, event.timezone)) });
});
