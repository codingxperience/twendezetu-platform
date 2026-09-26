// RSVPs, reminders and saved events. Guests can RSVP with just a name and an
// email; they get a private link to change their mind.

import { prisma, transaction } from '../db.js';
import { badRequest, conflict, forbidden, notFound, unauthorized } from '../errors.js';
import { randomToken, sha256 } from '../security/crypto.js';
import { cancelScheduled, notify, notifyGuest } from '../notify/index.js';
import { getSettings } from '../settings.js';
import { dayLabel, timeLabel } from '../format.js';

export const REMINDER_PLANS = Object.freeze({
  '7d,1d,2h': '7d · 1d · 2h',
  '1d,2h': '1d · 2h',
  '1d': '1d',
  off: 'Off',
});

const STEP_MS = { '7d': 7 * 86_400_000, '1d': 86_400_000, '2h': 7_200_000 };
const STEP_COPY = { '7d': 'in a week', '1d': 'tomorrow', '2h': 'in two hours' };

export function planFromLabel(label) {
  return Object.entries(REMINDER_PLANS).find(([, value]) => value === label)?.[0] || null;
}

async function scheduleReminders(tx, rsvp, event) {
  await cancelScheduled(tx, `reminder:${rsvp.id}:`);
  if (rsvp.status !== 'GOING' || rsvp.reminderPlan === 'off') return;
  const now = Date.now();
  for (const step of rsvp.reminderPlan.split(',')) {
    const at = new Date(event.startsAt.getTime() - STEP_MS[step]);
    if (!STEP_MS[step] || at.getTime() <= now) continue;
    const title = `${event.title} is ${STEP_COPY[step]}`;
    const body = `${dayLabel(event.startsAt, event.timezone)} · ${timeLabel(event.startsAt, event.timezone)} · ${event.venue}.`;
    const href = `/events/${event.slug}`;
    const dedupeKey = `reminder:${rsvp.id}:${step}`;
    if (rsvp.userId) {
      await notify(tx, { userId: rsvp.userId, topic: 'REMINDERS', title, body, href, sendAfter: at, dedupeKey });
    } else {
      await notifyGuest(tx, { email: rsvp.email, topic: 'REMINDERS', subject: title, body, href, sendAfter: at, dedupeKey });
    }
  }
}

// Adjusts goingCount by `delta` people, refusing to pass capacity.
async function adjustGoing(tx, eventId, delta) {
  if (!delta) return;
  const updated = await tx.$executeRaw`
    UPDATE "Event" SET "goingCount" = GREATEST(0, "goingCount" + ${delta})
     WHERE "id" = ${eventId}
       AND (${delta} <= 0 OR "capacity" IS NULL OR "goingCount" + ${delta} <= "capacity")`;
  if (!updated) throw conflict('This event is at capacity.', 'event_full');
}

function counted(rsvp) {
  return rsvp && rsvp.status === 'GOING' ? rsvp.partySize : 0;
}

export async function rsvpToEvent({ slug, viewer, name, email, partySize = 1, status = 'GOING', referrerHandle, source }) {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true, status: true, hiddenAt: true, startsAt: true, endsAt: true, timezone: true, venue: true, allowGuestRsvp: true },
  });
  if (!event || event.status !== 'PUBLISHED' || event.hiddenAt) throw notFound('This event is not taking RSVPs.');
  if ((event.endsAt || event.startsAt) < new Date()) throw badRequest('This event has already happened.');

  if (!viewer) {
    const settings = await getSettings();
    if (!event.allowGuestRsvp || !settings.guestRsvp) throw unauthorized('Sign in to RSVP to this event.');
  }

  const attendeeEmail = (viewer?.email || email || '').trim().toLowerCase();
  const attendeeName = (viewer?.name || name || '').trim();
  if (!attendeeEmail || !attendeeName) throw badRequest('Add your name and email.');

  const referrer = referrerHandle
    ? await prisma.user.findUnique({ where: { handle: String(referrerHandle).toLowerCase() }, select: { id: true } })
    : null;
  const manageToken = viewer ? null : randomToken(24);

  const rsvp = await transaction(async (tx) => {
    const previous = await tx.rsvp.findUnique({ where: { eventId_email: { eventId: event.id, email: attendeeEmail } } });
    if (previous?.userId && previous.userId !== viewer?.id) {
      throw forbidden('This email already has an RSVP linked to an account. Sign in to change it.');
    }

    // A guest RSVP can only be changed from its private link. Someone typing
    // the same email again gets that link re-sent to the inbox, and nothing
    // about the existing RSVP changes.
    if (!viewer && previous && previous.status !== 'CANCELLED') {
      await tx.rsvp.update({ where: { id: previous.id }, data: { manageTokenHash: sha256(manageToken) } });
      await notifyGuest(tx, {
        email: attendeeEmail,
        topic: 'REMINDERS',
        subject: `Your RSVP for ${event.title}`,
        body: 'You are already on the list. Use the link below to change your party size or cancel.',
        href: `/events/${event.slug}?rsvp=${manageToken}`,
      });
      return previous;
    }

    const saved = await tx.rsvp.upsert({
      where: { eventId_email: { eventId: event.id, email: attendeeEmail } },
      create: {
        eventId: event.id,
        userId: viewer?.id || null,
        name: attendeeName,
        email: attendeeEmail,
        partySize,
        status,
        referrerId: referrer && referrer.id !== viewer?.id ? referrer.id : null,
        source: source || null,
        manageTokenHash: manageToken ? sha256(manageToken) : null,
      },
      update: {
        name: attendeeName,
        partySize,
        status,
        userId: viewer?.id || previous?.userId || null,
        ...(manageToken ? { manageTokenHash: sha256(manageToken) } : {}),
      },
    });

    await adjustGoing(tx, event.id, counted(saved) - counted(previous));
    await scheduleReminders(tx, saved, event);

    if (status === 'GOING' && (!previous || previous.status !== 'GOING')) {
      const body = `You're going to ${event.title} — ${dayLabel(event.startsAt, event.timezone)} · ${timeLabel(event.startsAt, event.timezone)} · ${event.venue}. We'll remind you before it starts.`;
      if (viewer) {
        await notify(tx, { userId: viewer.id, topic: 'REMINDERS', title: `RSVP confirmed: ${event.title}`, body, href: `/events/${event.slug}` });
      } else {
        await notifyGuest(tx, {
          email: attendeeEmail,
          topic: 'REMINDERS',
          subject: `RSVP confirmed: ${event.title}`,
          body: `${body}\n\nChanged your plans? Use the link below to update or cancel your RSVP.`,
          href: `/events/${event.slug}?rsvp=${manageToken}`,
        });
      }
    }
    return saved;
  });

  return { id: rsvp.id, status: rsvp.status, partySize: rsvp.partySize, name: rsvp.name };
}

async function findManageable({ rsvpId, token, viewer }) {
  if (token) {
    const rsvp = await prisma.rsvp.findUnique({ where: { manageTokenHash: sha256(String(token)) } });
    if (!rsvp) throw notFound('That RSVP link is no longer valid.');
    return rsvp;
  }
  if (!viewer) throw unauthorized();
  const rsvp = await prisma.rsvp.findUnique({ where: { id: rsvpId } });
  if (!rsvp || rsvp.userId !== viewer.id) throw notFound();
  return rsvp;
}

export async function cancelRsvp({ rsvpId, token, viewer }) {
  const rsvp = await findManageable({ rsvpId, token, viewer });
  if (rsvp.status === 'CANCELLED') return { status: 'CANCELLED' };
  await transaction(async (tx) => {
    const updated = await tx.rsvp.update({ where: { id: rsvp.id }, data: { status: 'CANCELLED' } });
    await adjustGoing(tx, rsvp.eventId, -counted(rsvp));
    await cancelScheduled(tx, `reminder:${updated.id}:`);
  });
  return { status: 'CANCELLED' };
}

export async function setReminderPlan(viewer, rsvpId, plan) {
  if (!REMINDER_PLANS[plan]) throw badRequest('Unknown reminder plan.');
  const rsvp = await findManageable({ rsvpId, viewer });
  await transaction(async (tx) => {
    const updated = await tx.rsvp.update({ where: { id: rsvp.id }, data: { reminderPlan: plan } });
    const event = await tx.event.findUnique({ where: { id: rsvp.eventId }, select: { title: true, slug: true, startsAt: true, timezone: true, venue: true } });
    await scheduleReminders(tx, updated, event);
  });
  return { reminderPlan: plan, label: REMINDER_PLANS[plan] };
}

export async function setCalendarAdded(viewer, rsvpId, added) {
  const rsvp = await findManageable({ rsvpId, viewer });
  await prisma.rsvp.update({ where: { id: rsvp.id }, data: { calendarAddedAt: added ? new Date() : null } });
  return { added };
}

export async function toggleSavedEvent(viewer, slug) {
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) throw notFound();
  const key = { userId_eventId: { userId: viewer.id, eventId: event.id } };
  const existing = await prisma.savedEvent.findUnique({ where: key });
  if (existing) {
    await prisma.savedEvent.delete({ where: key });
    return { saved: false };
  }
  await prisma.savedEvent.create({ data: { userId: viewer.id, eventId: event.id } });
  return { saved: true };
}

export async function viewerRsvp(viewer, eventId) {
  if (!viewer) return null;
  return prisma.rsvp.findFirst({ where: { eventId, OR: [{ userId: viewer.id }, { email: viewer.email }] } });
}

export async function rsvpByToken(token) {
  if (!token) return null;
  return prisma.rsvp.findUnique({ where: { manageTokenHash: sha256(String(token)) } });
}

// Ticket buyers are attendees too: their purchase creates (or upgrades) an
// RSVP so reminders and My Twende work the same way.
export async function ensureAttendeeRsvp(tx, { event, userId, name, email, partySize }) {
  const previous = await tx.rsvp.findUnique({ where: { eventId_email: { eventId: event.id, email } } });
  const saved = await tx.rsvp.upsert({
    where: { eventId_email: { eventId: event.id, email } },
    create: { eventId: event.id, userId, name, email, partySize: Math.min(partySize, 20), status: 'GOING' },
    update: { status: 'GOING', userId: userId || previous?.userId || null, partySize: Math.min(Math.max(previous?.partySize || 0, partySize), 20) },
  });
  const delta = counted(saved) - counted(previous);
  if (delta) {
    await tx.$executeRaw`UPDATE "Event" SET "goingCount" = GREATEST(0, "goingCount" + ${delta}) WHERE "id" = ${event.id}`;
  }
  await scheduleReminders(tx, saved, event);
  return saved;
}
