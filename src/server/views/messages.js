// Messages: the person's conversations and the one they have open, with the
// booking (if any) that the conversation led to.

import { prisma } from '../db.js';
import { ESCROW } from '../fees.js';
import { unauthorized } from '../errors.js';
import { listThreads, markThreadRead, threadDetail } from '../services/threads.js';
import { formatMoney } from '../../shared/money.js';
import { shortDate } from '../../shared/format.js';
import { timezoneFor } from '../notify/preferences.js';
import { me } from './common.js';

const BOOKING_STATUS = {
  PENDING_PAYMENT: 'WAITING FOR PAYMENT',
  ESCROWED: 'PAID · HELD IN ESCROW',
  RELEASED: 'COMPLETE · PROVIDER PAID',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTE OPEN',
  REFUNDED: 'REFUNDED',
};

async function bookingFor(threadId, viewer) {
  const booking = await prisma.booking.findFirst({
    where: { threadId },
    orderBy: { createdAt: 'desc' },
    include: { provider: { select: { name: true, slug: true, ownerId: true } }, review: { select: { id: true } } },
  });
  if (!booking) return null;
  const customer = booking.customerId === viewer.id;
  const provider = booking.provider.ownerId === viewer.id;
  if (!customer && !provider) return null;
  return {
    id: booking.id,
    reference: booking.reference,
    title: booking.title,
    amount: formatMoney(booking.amountMinor, booking.currency),
    status: booking.status,
    statusLabel: BOOKING_STATUS[booking.status],
    when: booking.serviceStartsOn ? shortDate(booking.serviceStartsOn, 'UTC') : null,
    releaseOn: booking.releaseAfter ? shortDate(booking.releaseAfter, 'UTC') : null,
    releaseHours: ESCROW.bookingReleaseDelayHours,
    customer,
    provider,
    providerName: booking.provider.name,
    providerSlug: booking.provider.slug,
    canPay: customer && booking.status === 'PENDING_PAYMENT',
    canConfirm: customer && booking.status === 'ESCROWED',
    canCancel: booking.status === 'PENDING_PAYMENT',
    canDispute: ['ESCROWED', 'RELEASED'].includes(booking.status),
    canReview: customer && booking.status === 'RELEASED' && !booking.review,
  };
}

export async function messagesView(viewer, { thread: requested } = {}) {
  if (!viewer) throw unauthorized();
  const [person, threads] = await Promise.all([me(viewer), listThreads(viewer.id, timezoneFor(viewer.country))]);
  // Open the thread asked for when the viewer is in it (even an old one past
  // the list's first page); otherwise the latest.
  const member = requested
    ? await prisma.threadParticipant.findUnique({ where: { threadId_userId: { threadId: String(requested), userId: viewer.id } }, select: { threadId: true } })
    : null;
  const activeId = member?.threadId || threads[0]?.id || null;
  const [active, booking] = activeId ? await Promise.all([threadDetail(viewer, activeId), bookingFor(activeId, viewer)]) : [null, null];
  // Opening a conversation reads it.
  const opened = threads.find((thread) => thread.id === activeId);
  if (opened?.unread) {
    await markThreadRead(viewer, activeId);
    opened.unread = false;
  }
  return { me: person, threads, active, booking };
}
