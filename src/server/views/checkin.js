// Door check-in: pick one of your events, then scan.

import { unauthorized } from '../errors.js';
import { checkinEventFor, checkinEvents, checkinStats } from '../services/checkin.js';
import { me } from './common.js';

export async function checkinView(viewer, { event: slug } = {}) {
  if (!viewer) throw unauthorized();
  const person = await me(viewer);
  if (!slug) {
    const events = await checkinEvents(viewer);
    return { me: person, event: null, events: events.map((event) => ({ ...event, href: `/checkin?event=${event.slug}` })) };
  }
  const event = await checkinEventFor(viewer, String(slug));
  return { me: person, event: { slug: event.slug, title: event.title }, events: [], ...(await checkinStats(event.id, event.timezone)) };
}
