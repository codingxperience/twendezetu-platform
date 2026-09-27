// One event: details, the viewer's RSVP, ticket availability and similar
// events. Serves both the standard event page and the bespoke flagship page.

import { prisma } from '../db.js';
import { config } from '../config.js';
import { getEventPage, similarEvents, toEventCard } from '../services/events.js';
import { rsvpByToken, viewerRsvp, REMINDER_PLANS } from '../services/rsvps.js';
import { EVENT_CATEGORIES, dayLabel, initials, timeLabel } from '../../shared/format.js';
import { me } from './common.js';

// Events with a hand-written landing page. Everything else uses the
// standard event layout.
const BESPOKE_LAYOUTS = { 'nyama-choma-festival-2026': 'event' };

function googleCalendarHref(event, url) {
  const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ends = event.endsAt || new Date(event.startsAt.getTime() + 3 * 3600 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(event.startsAt)}/${stamp(ends)}`,
    location: event.venue,
    details: `${event.blurb}\n\n${url}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function eventView(viewer, { slug, rsvp: token } = {}) {
  const page = await getEventPage(slug, viewer);
  if (!page) return null;
  const { event, isOwner } = page;
  const now = new Date();
  const past = (event.endsAt || new Date(event.startsAt.getTime() + 6 * 3600 * 1000)) < now;
  const cancelled = event.status === 'CANCELLED';
  const onlineTiers = event.tiers.filter((tier) => tier.kind === 'ONLINE');

  const [person, similar, mine, byToken] = await Promise.all([
    me(viewer),
    similarEvents(event, 8),
    viewerRsvp(viewer, event.id),
    token ? rsvpByToken(token) : null,
  ]);
  const rsvp = byToken && byToken.eventId === event.id ? byToken : mine;
  const url = `${config().appUrl}/events/${event.slug}`;

  let closedNote = null;
  if (cancelled) closedNote = 'This event was cancelled by the organizer. Anyone who paid has been refunded in full.';
  else if (past) closedNote = `This event took place on ${dayLabel(event.startsAt, event.timezone)}. Browse the guide for what's on next.`;
  else if (event.status === 'PAUSED') closedNote = 'The organizer has paused RSVPs and ticket sales for now.';

  return {
    me: person,
    appUrl: config().appUrl,
    event: {
      ...toEventCard({ ...event, tiers: onlineTiers }),
      id: event.id,
      dateLine: `${dayLabel(event.startsAt, event.timezone)} · ${timeLabel(event.startsAt, event.timezone)}`,
      organizerInitials: initials(event.organizer.name),
      category: EVENT_CATEGORIES[event.category],
    },
    shareUrl: url,
    googleCalendarHref: googleCalendarHref(event, url),
    calendarHref: `/api/events/${event.slug}/calendar`,
    schedule: event.schedule.map((row) => ({ time: row.timeLabel, title: row.title, desc: row.description, tag: row.tag })),
    closedNote,
    canRsvp: event.isFree && !closedNote,
    canBuy: !event.isFree && onlineTiers.length > 0 && !closedNote,
    isOwner,
    rsvp: rsvp && rsvp.status !== 'CANCELLED'
      ? {
          id: rsvp.id,
          name: rsvp.name,
          email: rsvp.email,
          partySize: rsvp.partySize,
          status: rsvp.status,
          reminders: REMINDER_PLANS[rsvp.reminderPlan],
          manageToken: byToken ? token : null,
          mine: Boolean(viewer && rsvp.userId === viewer.id),
        }
      : null,
    similar,
    template: BESPOKE_LAYOUTS[event.slug] || 'eventDetail',
  };
}

export async function eventMetadata(slug) {
  return prisma.event.findUnique({
    where: { slug },
    select: { slug: true, title: true, blurb: true, coverUrl: true, city: true, startsAt: true, timezone: true, status: true, hiddenAt: true },
  });
}
