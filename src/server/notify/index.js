// Sending notifications. Callers pass the transaction they are already in, so
// a notice is recorded if and only if the change that caused it commits. The
// in-app notice is written immediately; email, SMS and WhatsApp copies go to
// the outbox and are delivered by the dispatch job.

import { afterQuietHours, enforceFloor, preferencesFor, timezoneFor } from './preferences.js';

// notify(tx, { userId, topic, title, body, href, dedupeKey, sendAfter, urgent })
// `urgent` skips quiet hours (security codes, money movement you initiated).
export async function notify(tx, message) {
  const { userId, topic, title, body, href = null, dedupeKey, sendAfter, urgent = false } = message;
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true, phoneVerifiedAt: true, country: true, quietHours: true, status: true },
  });
  if (!user || user.status === 'DELETED') return;

  const prefs = await preferencesFor(tx, userId);
  const channels = enforceFloor(topic, prefs[topic]);
  const now = new Date();
  const due = sendAfter && sendAfter > now ? sendAfter : now;

  if (channels.inApp) {
    if (due > now) {
      await queue(tx, { userId, channel: 'IN_APP', topic, to: userId, subject: title, body, href, sendAfter: due, dedupeKey: key(dedupeKey, 'app') });
    } else {
      await tx.notification.create({ data: { userId, topic, title, body, href } });
    }
  }

  if (channels.email && user.email) {
    await queue(tx, { userId, channel: 'EMAIL', topic, to: user.email, subject: title, body, href, sendAfter: due, dedupeKey: key(dedupeKey, 'email') });
  }

  const textable = user.phone && user.phoneVerifiedAt;
  const textAfter = urgent || !user.quietHours || topic === 'MONEY' ? due : afterQuietHours(due, timezoneFor(user.country));
  if (channels.sms && textable) {
    await queue(tx, { userId, channel: 'SMS', topic, to: user.phone, subject: title, body, href, sendAfter: textAfter, dedupeKey: key(dedupeKey, 'sms') });
  }
  if (channels.whatsapp && textable) {
    await queue(tx, { userId, channel: 'WHATSAPP', topic, to: user.phone, subject: title, body, href, sendAfter: textAfter, dedupeKey: key(dedupeKey, 'wa') });
  }
}

// Email only: for people without an account (guest RSVPs, ticket buyers,
// service requesters), and for mail a member asked for by name, such as the
// weekly digest, which follows its own switch rather than a topic.
export async function notifyGuest(tx, { email, topic, subject, body, href = null, dedupeKey, sendAfter, userId = null }) {
  await queue(tx, { userId, channel: 'EMAIL', topic, to: email, subject, body, href, sendAfter: sendAfter || new Date(), dedupeKey: key(dedupeKey, 'email') });
}

// Direct text message to a phone number (verification codes).
export async function sendText(tx, { userId, phone, body, topic = 'MONEY' }) {
  await queue(tx, { userId, channel: 'SMS', topic, to: phone, subject: 'Twendezetu code', body, href: null, sendAfter: new Date() });
}

export async function cancelScheduled(tx, dedupePrefix) {
  await tx.outboundMessage.updateMany({
    where: { dedupeKey: { startsWith: dedupePrefix }, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  });
}

function key(base, channel) {
  return base ? `${base}:${channel}` : undefined;
}

async function queue(tx, row) {
  if (!row.dedupeKey) {
    await tx.outboundMessage.create({ data: row });
    return;
  }
  // A message with this key is sent at most once. One still waiting, or
  // cancelled earlier (say, a reminder plan that changed), is refreshed and
  // revived; one already sent or being sent is left alone.
  const { count } = await tx.outboundMessage.updateMany({
    where: { dedupeKey: row.dedupeKey, status: { in: ['PENDING', 'CANCELLED'] } },
    data: { status: 'PENDING', sendAfter: row.sendAfter, subject: row.subject, body: row.body, to: row.to, attempts: 0, lastError: null },
  });
  if (!count) await tx.outboundMessage.createMany({ data: [row], skipDuplicates: true });
}
