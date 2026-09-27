// The weekly digest: one email on Monday morning for people who switched it
// on (in settings, or on a need they posted). It says what is coming up for
// them, what came in on their needs, and what is new near them. Nothing is
// sent when there is nothing to say.

import { prisma, transaction } from '../db.js';
import { notifyGuest } from '../notify/index.js';
import { dayLabel } from '../../shared/format.js';
import { formatMoney } from '../../shared/money.js';

const WEEK_MS = 7 * 86_400_000;

// ISO week key, e.g. "2026-W40", so a retried run never sends twice.
function weekKey(date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((day - yearStart) / 86_400_000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

async function digestFor(user, now) {
  const since = new Date(now.getTime() - WEEK_MS);
  const until = new Date(now.getTime() + WEEK_MS);
  const [upcoming, offers, nearby] = await Promise.all([
    prisma.rsvp.findMany({
      where: { userId: user.id, status: 'GOING', event: { status: 'PUBLISHED', startsAt: { gte: now, lt: until } } },
      include: { event: { select: { title: true, startsAt: true, timezone: true, city: true } } },
      orderBy: { event: { startsAt: 'asc' } },
      take: 5,
    }),
    prisma.offer.findMany({
      where: { createdAt: { gte: since }, need: { posterId: user.id, status: { in: ['OPEN', 'PAUSED'] } } },
      include: { need: { select: { title: true } }, provider: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    user.city
      ? prisma.event.findMany({
          where: { status: 'PUBLISHED', hiddenAt: null, publishedAt: { gte: since }, startsAt: { gte: now }, city: { contains: user.city.split(',')[0].trim(), mode: 'insensitive' } },
          select: { title: true, startsAt: true, timezone: true },
          orderBy: { startsAt: 'asc' },
          take: 3,
        })
      : [],
  ]);

  const sections = [];
  if (upcoming.length) {
    sections.push(['This week', upcoming.map((rsvp) => `• ${rsvp.event.title} — ${dayLabel(rsvp.event.startsAt, rsvp.event.timezone)}, ${rsvp.event.city}`)]);
  }
  if (offers.length) {
    sections.push(['Offers on your needs', offers.map((offer) => `• ${offer.provider.name}: ${formatMoney(offer.priceMinor, offer.currency)} for “${offer.need.title}”`)]);
  }
  if (nearby.length) {
    sections.push([`New near ${user.city}`, nearby.map((event) => `• ${event.title} — ${dayLabel(event.startsAt, event.timezone)}`)]);
  }
  return sections;
}

export async function sendWeeklyDigests(now = new Date()) {
  const recipients = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      OR: [{ weeklyDigest: true }, { needs: { some: { weeklyDigest: true, status: { in: ['OPEN', 'PAUSED'] } } } }],
    },
    select: { id: true, email: true, name: true, city: true },
    take: 5000,
  });
  const week = weekKey(now);
  let sent = 0;
  for (const user of recipients) {
    const sections = await digestFor(user, now);
    if (!sections.length) continue;
    const body = [`Habari ${user.name.split(' ')[0]}, here is your week on Twendezetu.`, ...sections.map(([title, lines]) => `${title}\n${lines.join('\n')}`)].join('\n\n');
    await transaction((tx) =>
      notifyGuest(tx, { userId: user.id, email: user.email, topic: 'NEWS', subject: 'Your week on Twendezetu', body, href: '/my-twende', dedupeKey: `digest:${user.id}:${week}` }),
    );
    sent += 1;
  }
  return sent;
}
