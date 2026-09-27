// Masked conversations between posters, providers and organizers.
//
// Contact details are stripped from every message until the conversation is
// unmasked (an offer is accepted on a need whose poster allowed it). Messages
// that look like an attempt to take payment off the platform are flagged,
// a notice is shown to both sides and, when automated scam detection is on,
// a report lands in the trust & safety queue.

import { prisma, transaction } from '../db.js';
import { badRequest, forbidden, notFound } from '../errors.js';
import { maskContacts, offPlatformPaymentSignal } from '../security/masking.js';
import { notify } from '../notify/index.js';
import { getSettings } from '../settings.js';
import { formatMoney } from '../../shared/money.js';
import { initials, messageStamp, ratingLabel, shortName, threadStamp } from '../../shared/format.js';
import { reference } from '../security/crypto.js';
import { maskPhone } from './identity.js';
import { timezoneFor } from '../notify/preferences.js';

export const NOTICES = {
  masked: 'Contact details are masked until an offer is accepted.',
  redacted: 'Contact details detected and hidden until an offer is accepted.',
  offPlatform: 'Heads up: never pay outside Twendezetu. Payments made here are held in escrow and protected; payments sent directly are not.',
  revealed: 'Offer accepted. Contacts are now visible to both of you.',
};

export async function findOrCreateThread(tx, { kind, subject, needId = null, providerId = null, eventId = null, participants }) {
  const [first, second] = participants;
  const existing = await tx.thread.findFirst({
    where: {
      kind,
      needId,
      providerId,
      eventId,
      AND: [{ participants: { some: { userId: first.userId } } }, { participants: { some: { userId: second.userId } } }],
    },
  });
  if (existing) return existing;
  return tx.thread.create({
    data: {
      kind,
      subject,
      needId,
      providerId,
      eventId,
      participants: { create: participants.map(({ userId, role }) => ({ userId, role })) },
    },
  });
}

export async function appendMessage(tx, { threadId, senderId = null, kind = 'TEXT', body, offerId = null, fileId = null, redacted = false, flagged = false }) {
  const message = await tx.message.create({ data: { threadId, senderId, kind, body, offerId, fileId, redacted, flagged } });
  await tx.thread.update({ where: { id: threadId }, data: { lastMessageAt: message.createdAt } });
  if (senderId) {
    await tx.threadParticipant.update({ where: { threadId_userId: { threadId, userId: senderId } }, data: { lastReadAt: message.createdAt } });
  }
  return message;
}

// Tells the other side about a new message. One email per ten minutes per
// thread, however many messages arrive in a burst.
export async function notifyParticipants(tx, thread, senderId, { title, body }) {
  const others = await tx.threadParticipant.findMany({ where: { threadId: thread.id, userId: { not: senderId } }, select: { userId: true } });
  const bucket = Math.floor(Date.now() / 600_000);
  for (const { userId } of others) {
    await notify(tx, { userId, topic: 'OFFERS', title, body, href: `/messages?thread=${thread.id}`, dedupeKey: `thread:${thread.id}:${userId}:${bucket}` });
  }
}

async function participantOrThrow(db, threadId, userId) {
  const participant = await db.threadParticipant.findUnique({ where: { threadId_userId: { threadId, userId } } });
  if (!participant) throw notFound('That conversation does not exist.');
  return participant;
}

export async function sendMessage(user, threadId, { text, fileId }) {
  await participantOrThrow(prisma, threadId, user.id);
  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  const original = String(text || '').trim().slice(0, 2000);
  if (!original && !fileId) throw badRequest('Type a message first.');

  if (fileId) {
    const file = await prisma.fileObject.findUnique({ where: { id: fileId }, select: { ownerId: true, purpose: true } });
    if (!file || file.ownerId !== user.id || file.purpose !== 'MESSAGE') throw forbidden('That attachment is not available.');
  }

  const revealed = Boolean(thread.contactsRevealedAt);
  const { text: body, redacted } = revealed ? { text: original, redacted: false } : maskContacts(original);
  const suspicious = offPlatformPaymentSignal(original);
  const settings = await getSettings();

  return transaction(async (tx) => {
    const message = await appendMessage(tx, {
      threadId,
      senderId: user.id,
      kind: fileId ? 'FILE' : 'TEXT',
      body: body || 'Attachment',
      fileId: fileId || null,
      redacted,
      flagged: suspicious,
    });
    if (redacted) await appendMessage(tx, { threadId, kind: 'NOTICE', body: NOTICES.redacted });
    if (suspicious) {
      await appendMessage(tx, { threadId, kind: 'NOTICE', body: NOTICES.offPlatform });
      if (settings.autoScamDetection) {
        await tx.report.create({
          data: {
            reference: reference('RPT', 6),
            targetType: 'MESSAGE',
            targetId: message.id,
            targetUserId: user.id,
            reason: 'OFF_PLATFORM_PAYMENT',
            detail: `Automatic flag in thread ${thread.subject}`,
            severity: 'HIGH',
            automated: true,
          },
        });
      }
    }
    await notifyParticipants(tx, thread, user.id, {
      title: `New message from ${shortName(user.name)}`,
      body: `${thread.subject}: ${body.slice(0, 140)}`,
    });
    return { id: message.id, redacted, flagged: suspicious };
  });
}

export async function markThreadRead(user, threadId) {
  await participantOrThrow(prisma, threadId, user.id);
  await prisma.threadParticipant.update({ where: { threadId_userId: { threadId, userId: user.id } }, data: { lastReadAt: new Date() } });
}

// ── Reading ───────────────────────────────────────────────────────────────

function counterpartOf(thread, viewerId) {
  const other = thread.participants.find((participant) => participant.userId !== viewerId);
  if (!other) return { name: 'Twendezetu', initials: 'TZ', sub: '', role: 'MEMBER', userId: null };
  if (other.role === 'PROVIDER' && thread.provider) {
    const provider = thread.provider;
    const rating = ratingLabel(provider);
    const parts = [rating === 'NEW' ? 'NEW' : `★ ${rating}`, provider.verifiedAt ? 'VERIFIED' : `${provider.jobsCompleted} JOBS`];
    return { name: provider.name, initials: initials(provider.name), sub: parts.join(' · '), role: 'PROVIDER', userId: other.userId };
  }
  if (other.role === 'ORGANIZER' && thread.event?.organizer) {
    return { name: thread.event.organizer.name, initials: initials(thread.event.organizer.name), sub: 'ORGANIZER', role: 'ORGANIZER', userId: other.userId };
  }
  return { name: shortName(other.user.name), initials: initials(other.user.name), sub: other.role === 'POSTER' ? 'POSTER' : 'MEMBER', role: other.role, userId: other.userId };
}

const THREAD_INCLUDE = {
  participants: { include: { user: { select: { id: true, name: true } } } },
  provider: { select: { id: true, name: true, ratingSum: true, ratingCount: true, verifiedAt: true, jobsCompleted: true, ownerId: true } },
  event: { select: { slug: true, organizer: { select: { name: true } } } },
  need: { select: { slug: true, title: true, posterId: true } },
};

export async function listThreads(userId, timeZone = 'UTC') {
  const memberships = await prisma.threadParticipant.findMany({
    where: { userId, archivedAt: null },
    include: {
      thread: {
        include: {
          ...THREAD_INCLUDE,
          messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { offer: { select: { title: true, priceMinor: true, currency: true } } } },
        },
      },
    },
    orderBy: { thread: { lastMessageAt: 'desc' } },
    take: 50,
  });
  return memberships.map(({ thread, lastReadAt }) => {
    const last = thread.messages[0];
    const counterpart = counterpartOf(thread, userId);
    const preview = !last
      ? 'No messages yet'
      : last.kind === 'OFFER' && last.offer
        ? `Formal offer: ${formatMoney(last.offer.priceMinor, last.offer.currency)} · ${last.offer.title}`
        : last.body;
    return {
      id: thread.id,
      name: counterpart.name,
      re: thread.subject.toUpperCase(),
      time: threadStamp(thread.lastMessageAt, timeZone),
      unread: Boolean(last && last.senderId !== userId && (!lastReadAt || lastReadAt < thread.lastMessageAt)),
      preview,
    };
  });
}

export async function threadDetail(user, threadId) {
  await participantOrThrow(prisma, threadId, user.id);
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      ...THREAD_INCLUDE,
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 200,
        include: { sender: { select: { id: true, name: true } }, offer: true, file: { select: { id: true, name: true, mime: true } } },
      },
    },
  });
  const counterpart = counterpartOf(thread, user.id);
  const revealed = Boolean(thread.contactsRevealedAt);
  let contacts = null;
  if (revealed && counterpart.userId) {
    const other = await prisma.user.findUnique({ where: { id: counterpart.userId }, select: { email: true, phone: true, phoneVerifiedAt: true } });
    contacts = { email: other.email, phone: other.phoneVerifiedAt ? other.phone : null };
  }
  const isPoster = thread.need?.posterId === user.id;
  const timeZone = timezoneFor(user.country);

  const messages = thread.messages.map((message) => {
    const mine = message.senderId === user.id;
    const base = {
      id: message.id,
      kind: message.kind,
      mine,
      who: mine ? 'YOU' : message.senderId ? counterpart.name.toUpperCase() : 'TWENDEZETU',
      time: messageStamp(message.createdAt, timeZone),
      text: message.body,
      file: message.file ? { id: message.file.id, name: message.file.name, image: message.file.mime.startsWith('image/'), href: `/api/files/${message.file.id}` } : null,
    };
    if (message.kind !== 'OFFER' || !message.offer) return base;
    const offer = message.offer;
    return {
      ...base,
      offer: {
        id: offer.id,
        reference: `#${offer.reference}`,
        title: offer.title,
        price: formatMoney(offer.priceMinor, offer.currency),
        note: offer.note,
        status: offer.status,
        canRespond: isPoster && ['OPEN', 'COUNTERED'].includes(offer.status),
        canWithdraw: !isPoster && mine && ['OPEN', 'COUNTERED'].includes(offer.status),
      },
    };
  });

  return {
    id: thread.id,
    name: counterpart.name,
    initials: counterpart.initials,
    sub: counterpart.sub,
    subject: thread.subject.toUpperCase(),
    revealed,
    contacts: contacts && { email: contacts.email, phone: contacts.phone, phoneHint: maskPhone(contacts.phone) },
    isPoster,
    messages,
  };
}

// Opens (or reopens) a masked conversation with an event's organizer.
export async function openOrganizerThread(user, slug) {
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, title: true, organizer: { select: { ownerId: true } } } });
  if (!event) throw notFound();
  if (event.organizer.ownerId === user.id) throw badRequest('You organise this event.');
  const thread = await transaction((tx) =>
    findOrCreateThread(tx, {
      kind: 'EVENT',
      subject: `${event.title} · questions`,
      eventId: event.id,
      participants: [
        { userId: user.id, role: 'MEMBER' },
        { userId: event.organizer.ownerId, role: 'ORGANIZER' },
      ],
    }),
  );
  return { threadId: thread.id };
}
