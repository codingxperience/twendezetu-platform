// Organizer analytics: pick one of your events and see how it is doing.

import { unauthorized } from '../errors.js';
import { eventAnalytics, organizerEvents } from '../services/analytics.js';
import { shortDate } from '../../shared/format.js';
import { me } from './common.js';

export async function organizerAnalyticsView(viewer, { event: slug } = {}) {
  if (!viewer) throw unauthorized();
  const [person, events] = await Promise.all([me(viewer), organizerEvents(viewer)]);
  const options = events.map((event) => ({ slug: event.slug, label: `${event.title} · ${shortDate(event.startsAt, event.timezone)}` }));
  if (!events.length && !slug) return { me: person, events: options, analytics: null };

  // Without a choice, open the next event coming up (the list starts there).
  const chosen = slug || events[0].slug;
  const analytics = await eventAnalytics(viewer, chosen);
  // eventAnalytics has already checked access; an event outside the short
  // list (far ahead, or staff looking at someone else's) joins the picker.
  if (!options.some((option) => option.slug === chosen)) options.unshift({ slug: chosen, label: `${analytics.event.title} · ${analytics.event.date}` });
  return { me: person, events: options, analytics };
}
