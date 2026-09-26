// Gate check-in. Admission is one conditional UPDATE, so two scanners at two
// gates cannot both admit the same ticket: the second sees "already in".

import { prisma } from '../db.js';
import { forbidden, notFound } from '../errors.js';
import { parseScan } from './tickets.js';
import { messageStamp } from '../format.js';

export async function checkinEventFor(user, slug) {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true, startsAt: true, createdById: true, organizer: { select: { ownerId: true } } },
  });
  if (!event) throw notFound();
  const staff = ['ADMIN', 'MODERATOR'].includes(user.role);
  if (event.createdById !== user.id && event.organizer.ownerId !== user.id && !staff) throw forbidden('Only the organizer can check people in.');
  return event;
}

// The organizer's events closest to now, for picking which gate to run.
export async function checkinEvents(user) {
  const events = await prisma.event.findMany({
    where: {
      OR: [{ createdById: user.id }, { organizer: { ownerId: user.id } }],
      status: { in: ['PUBLISHED', 'PAUSED'] },
      startsAt: { gte: new Date(Date.now() - 2 * 86_400_000) },
    },
    orderBy: { startsAt: 'asc' },
    select: { slug: true, title: true },
    take: 10,
  });
  return events;
}

export async function checkinStats(eventId) {
  const [admitted, total, blocked, log] = await Promise.all([
    prisma.ticket.count({ where: { eventId, status: 'CHECKED_IN' } }),
    prisma.ticket.count({ where: { eventId, status: { not: 'VOID' } } }),
    prisma.checkInScan.count({ where: { eventId, result: { not: 'ADMITTED' } } }),
    prisma.checkInScan.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { ticket: { select: { code: true, holderName: true } } },
    }),
  ]);
  return {
    admitted,
    total,
    blocked,
    log: log.map((scan) => ({
      icon: scan.result === 'ADMITTED' ? '✓' : scan.result === 'DUPLICATE' ? '⛔' : '⚠',
      code: scan.ticket?.code || '—',
      name: scan.ticket?.holderName || 'Unknown QR',
      note: scan.result === 'ADMITTED' ? 'Valid ticket' : scan.result === 'DUPLICATE' ? 'Second scan blocked' : 'Not valid for this event',
      status: scan.result,
      time: messageStamp(scan.createdAt),
    })),
  };
}

export async function scanTicket(user, slug, input) {
  const event = await checkinEventFor(user, slug);
  const parsed = parseScan(input);
  const raw = String(input || '').slice(0, 120);

  if (!parsed.code || !parsed.authentic) {
    await prisma.checkInScan.create({ data: { eventId: event.id, scannedById: user.id, input: raw, result: 'INVALID' } });
    return { result: 'INVALID', title: '✕ Invalid', sub: parsed.signed ? 'Signature failed — not a Twendezetu ticket' : `${raw.toUpperCase() || 'Code'} not recognised` };
  }

  const admitted = await prisma.ticket.updateMany({
    where: { code: parsed.code, eventId: event.id, status: 'VALID' },
    data: { status: 'CHECKED_IN', checkedInAt: new Date(), checkedInById: user.id },
  });
  const ticket = await prisma.ticket.findUnique({ where: { code: parsed.code }, include: { tier: { select: { name: true } } } });

  if (admitted.count) {
    await prisma.checkInScan.create({ data: { eventId: event.id, ticketId: ticket.id, scannedById: user.id, input: raw, result: 'ADMITTED' } });
    return { result: 'ADMITTED', title: '✓ Karibu!', sub: `${ticket.code} · ${ticket.holderName} · ${ticket.tier.name}` };
  }

  if (ticket && ticket.eventId === event.id && ticket.status === 'CHECKED_IN') {
    await prisma.checkInScan.create({ data: { eventId: event.id, ticketId: ticket.id, scannedById: user.id, input: raw, result: 'DUPLICATE' } });
    return { result: 'DUPLICATE', title: '✕ Already in', sub: `${ticket.code} was scanned at ${messageStamp(ticket.checkedInAt)}` };
  }

  await prisma.checkInScan.create({
    data: { eventId: event.id, ticketId: ticket?.eventId === event.id ? ticket.id : null, scannedById: user.id, input: raw, result: 'INVALID' },
  });
  const why = !ticket ? `${parsed.code} not found` : ticket.eventId !== event.id ? 'Ticket is for a different event' : 'Ticket was refunded or voided';
  return { result: 'INVALID', title: '✕ Invalid', sub: why };
}
