// Trust & safety: member reports, the moderation queue, suspensions, content
// curation and the admin overview.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, forbidden, notFound, unavailable } from '../errors.js';
import { reference } from '../security/crypto.js';
import { revokeAllSessions } from '../security/sessions.js';
import { notify } from '../notify/index.js';
import { getSettings, setSetting, SETTING_COPY } from '../settings.js';
import { findOrCreateThread, sendMessage } from './threads.js';
import { deliverPasswordReset } from './identity.js';
import { enforceRateLimit } from '../security/rate-limit.js';
import { getRates } from '../fx.js';
import { convert } from '../../shared/money.js';
import { EVENT_CATEGORIES, maskEmail, relativeTime, shortName } from '../../shared/format.js';

const SEVERITY = { SCAM: 'HIGH', OFF_PLATFORM_PAYMENT: 'HIGH', IMPERSONATION: 'MEDIUM', HARASSMENT: 'MEDIUM', SPAM: 'LOW', OTHER: 'LOW' };

export const REPORT_REASON_COPY = {
  SCAM: 'Spam or scam attempt',
  OFF_PLATFORM_PAYMENT: 'Asked to pay off-platform',
  HARASSMENT: 'Harassment or abuse',
  IMPERSONATION: 'Fake listing or impersonation',
  SPAM: 'Spam posting',
  OTHER: 'Something else',
};

async function reportTargetUser(user, targetType, targetId) {
  switch (targetType) {
    case 'THREAD': {
      const participants = await prisma.threadParticipant.findMany({ where: { threadId: targetId }, select: { userId: true } });
      if (!participants.some((participant) => participant.userId === user.id)) throw notFound();
      return participants.find((participant) => participant.userId !== user.id)?.userId || null;
    }
    case 'MESSAGE': {
      const message = await prisma.message.findUnique({ where: { id: targetId }, select: { senderId: true, threadId: true } });
      if (!message) throw notFound();
      const member = await prisma.threadParticipant.findUnique({ where: { threadId_userId: { threadId: message.threadId, userId: user.id } } });
      if (!member) throw notFound();
      return message.senderId;
    }
    case 'EVENT':
      return (await prisma.event.findUnique({ where: { id: targetId }, select: { createdById: true } }))?.createdById ?? null;
    case 'NEED':
      return (await prisma.need.findUnique({ where: { id: targetId }, select: { posterId: true } }))?.posterId ?? null;
    case 'PROVIDER':
      return (await prisma.provider.findUnique({ where: { id: targetId }, select: { ownerId: true } }))?.ownerId ?? null;
    case 'REVIEW':
      return (await prisma.review.findUnique({ where: { id: targetId }, select: { authorId: true } }))?.authorId ?? null;
    case 'USER':
      return targetId;
    default:
      throw badRequest('Unknown report target.');
  }
}

export async function fileReport(user, { targetType, targetId, reason, detail }) {
  const targetUserId = await reportTargetUser(user, targetType, targetId);
  if (targetUserId === user.id) throw badRequest('You cannot report yourself.');
  const report = await prisma.report.create({
    data: {
      reference: reference('RPT', 6),
      reporterId: user.id,
      targetType,
      targetId,
      targetUserId,
      reason,
      detail: detail?.slice(0, 1000) || null,
      severity: SEVERITY[reason],
    },
  });
  return { reference: report.reference };
}

// ── Queue ─────────────────────────────────────────────────────────────────

export async function reportQueue({ includeResolved = false } = {}) {
  const [reports, disputes] = await Promise.all([
    prisma.report.findMany({
      where: includeResolved ? {} : { status: 'OPEN' },
      orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
      include: { reporter: { select: { name: true } } },
      take: 50,
    }),
    prisma.dispute.findMany({ where: { status: 'ESCALATED' }, orderBy: { respondBy: 'asc' }, take: 20 }),
  ]);
  return {
    disputes: disputes.map((dispute) => ({
      id: dispute.id,
      reference: dispute.reference,
      severity: 'DISPUTE',
      reason: `${dispute.reason.replace(/_/g, ' ').toLowerCase()} — escalated`,
      meta: `CASE #${dispute.reference} · ${dispute.currency} ${dispute.amountMinor.toLocaleString('en-US')} HELD`,
      body: dispute.detail,
    })),
    reports: reports.map((report) => ({
      id: report.id,
      reference: report.reference,
      severity: report.severity === 'MEDIUM' ? 'MED' : report.severity,
      reason: REPORT_REASON_COPY[report.reason],
      meta: `${report.targetType} · ${report.automated ? 'AUTO-FLAGGED' : `REPORTED BY ${shortName(report.reporter?.name || 'member').toUpperCase()}`} · ${relativeTime(report.createdAt)}`,
      body: report.detail || 'No details given.',
      status: report.status,
      targetUserId: report.targetUserId,
    })),
  };
}

export async function actOnReport(admin, reportId, action) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw notFound();
  if (report.status !== 'OPEN') throw conflict('This report was already handled.', 'handled');
  const status = { dismiss: 'DISMISSED', warn: 'WARNED', suspend: 'SUSPENDED' }[action];
  if (!status) throw badRequest('Unknown action.');
  if (action !== 'dismiss' && !report.targetUserId) throw badRequest('This report has no account to act on.');

  await transaction(async (tx) => {
    await tx.report.update({ where: { id: report.id }, data: { status, resolvedById: admin.id, resolvedAt: new Date() } });
    if (action === 'warn') {
      await notify(tx, {
        userId: report.targetUserId,
        topic: 'MONEY',
        urgent: true,
        title: 'A formal warning on your account',
        body: `A report about your activity (${REPORT_REASON_COPY[report.reason].toLowerCase()}) was upheld. Another upheld report can lead to suspension. Keep payments and contact on Twendezetu.`,
        href: '/settings',
      });
    }
    if (report.reporterId) {
      await notify(tx, { userId: report.reporterId, topic: 'SOCIAL', title: `Your report ${report.reference} was reviewed`, body: 'Thank you. Trust and safety reviewed it and took action where needed.' });
    }
    await audit(tx, { actorId: admin.id, action: `report.${action}`, targetType: 'Report', targetId: report.id });
  });
  if (action === 'suspend') await setUserSuspended(admin, report.targetUserId, true, `Report ${report.reference}`);
  return { status };
}

export async function setUserSuspended(admin, userId, suspended, reason) {
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, status: true, name: true } });
  if (!target) throw notFound();
  if (target.id === admin.id) throw forbidden('You cannot suspend yourself.');
  if (target.role === 'ADMIN' && admin.role !== 'ADMIN') throw forbidden();
  if (target.status === 'DELETED') throw badRequest('That account was deleted.');

  await transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: suspended ? { status: 'SUSPENDED', suspendedAt: new Date(), suspendedReason: reason || null } : { status: 'ACTIVE', suspendedAt: null, suspendedReason: null },
    });
    const provider = await tx.provider.findUnique({ where: { ownerId: userId } });
    if (provider) {
      const active = provider.membershipEndsAt && provider.membershipEndsAt > new Date();
      await tx.provider.update({ where: { id: provider.id }, data: { status: suspended ? 'SUSPENDED' : active ? 'ACTIVE' : 'DRAFT' } });
    }
    if (suspended) {
      await tx.event.updateMany({ where: { createdById: userId, hiddenAt: null }, data: { hiddenAt: new Date(), hiddenReason: 'account suspended' } });
      await tx.need.updateMany({ where: { posterId: userId, hiddenAt: null }, data: { hiddenAt: new Date() } });
    } else {
      await tx.event.updateMany({ where: { createdById: userId, hiddenReason: 'account suspended' }, data: { hiddenAt: null, hiddenReason: null } });
      await tx.need.updateMany({ where: { posterId: userId }, data: { hiddenAt: null } });
    }
    await audit(tx, { actorId: admin.id, action: suspended ? 'user.suspended' : 'user.reinstated', targetType: 'User', targetId: userId, meta: { reason } });
  });
  if (suspended) await revokeAllSessions(userId);
  return { status: suspended ? 'SUSPENDED' : 'ACTIVE' };
}

// ── Users & content ───────────────────────────────────────────────────────

export async function listUsers({ q, take = 25 } = {}) {
  const search = q?.trim();
  const users = await prisma.user.findMany({
    where: {
      status: { not: 'DELETED' },
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search.toLowerCase() } }, { handle: { contains: search.toLowerCase() } }] } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true, name: true, email: true, city: true, country: true, role: true, status: true,
      provider: { select: { id: true } },
      _count: { select: { eventsCreated: true, needs: true } },
    },
  });
  return users.map((user) => {
    const roles = [];
    if (user.role !== 'MEMBER') roles.push(user.role);
    if (user.provider) roles.push('VENDOR');
    if (user._count.eventsCreated) roles.push('ORGANIZER');
    if (!roles.length) roles.push(user._count.needs ? 'USER + ADVERTISER' : 'USER');
    return {
      id: user.id,
      name: user.name,
      email: maskEmail(user.email),
      role: roles.join(' + '),
      staffRole: user.role,
      city: user.city || user.country || '—',
      suspended: user.status === 'SUSPENDED',
    };
  });
}

const ROLE_COPY = { MEMBER: 'member', MODERATOR: 'moderator', FINANCE: 'finance', ADMIN: 'administrator' };

// Staff roles are granted by administrators only, never to themselves.
export async function setUserRole(admin, userId, role) {
  if (admin.role !== 'ADMIN') throw forbidden('Only administrators can change roles.');
  if (!ROLE_COPY[role]) throw badRequest('Unknown role.');
  if (userId === admin.id) throw forbidden('Ask another administrator to change your own role.');
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, status: true } });
  if (!target || target.status === 'DELETED') throw notFound();
  if (target.role === role) return { role };
  await transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role } });
    await notify(tx, {
      userId,
      topic: 'MONEY',
      urgent: true,
      title: 'Your account role changed',
      body: role === 'MEMBER' ? 'Your staff access was removed.' : `You now have ${ROLE_COPY[role]} access. Staff tools need two-step verification on: turn it on in Settings under Security.`,
    });
    await audit(tx, { actorId: admin.id, action: 'user.role_changed', targetType: 'User', targetId: userId, meta: { from: target.role, to: role } });
  });
  return { role };
}

// A message from the team lands in the member's inbox as a support thread.
export async function messageUser(staff, userId, text) {
  const body = String(text || '').trim();
  if (body.length < 2) throw badRequest('Write the message first.');
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, status: true } });
  if (!target || target.status === 'DELETED') throw notFound();
  if (target.id === staff.id) throw badRequest('You cannot message yourself.');
  const thread = await transaction((tx) =>
    findOrCreateThread(tx, {
      kind: 'SUPPORT',
      subject: 'Twendezetu support',
      participants: [{ userId: staff.id, role: 'MEMBER' }, { userId: target.id, role: 'MEMBER' }],
    }),
  );
  await sendMessage(staff, thread.id, { text: body });
  await audit(prisma, { actorId: staff.id, action: 'user.messaged', targetType: 'User', targetId: userId });
  return { threadId: thread.id };
}

// Sends the member the same reset link they could ask for themselves.
// Staff already know the account exists, so unlike the public form this
// says plainly whether the email went out.
export async function sendPasswordResetFor(staff, userId) {
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, status: true } });
  if (!target || target.status !== 'ACTIVE') throw badRequest('Only active accounts can reset a password.');
  await enforceRateLimit('auth.password', `reset:${target.email}`);
  const result = await deliverPasswordReset(target.email, { ipAddress: `staff:${staff.id}`, requestedBy: staff.id });
  if (result.reason === 'cooldown') throw conflict('A reset link went to this member less than a minute ago. Give it a moment to arrive.');
  if (!result.sent) throw unavailable('The reset email could not be sent. Try again in a few minutes.');
  await audit(prisma, { actorId: staff.id, action: 'user.password_reset_sent', targetType: 'User', targetId: userId });
  return { sent: true };
}

export async function contentList() {
  const [events, needs] = await Promise.all([
    prisma.event.findMany({
      where: { status: { in: ['PUBLISHED', 'PAUSED'] } },
      orderBy: [{ featuredRank: { sort: 'asc', nulls: 'last' } }, { goingCount: 'desc' }],
      take: 12,
      include: { organizer: { select: { name: true } }, _count: { select: { tickets: true } } },
    }),
    prisma.need.findMany({ where: { status: { in: ['OPEN', 'PAUSED', 'ACCEPTED'] } }, orderBy: { offerCount: 'desc' }, take: 8, include: { poster: { select: { name: true } } } }),
  ]);
  return [
    ...events.map((event) => ({
      kind: 'event',
      id: event.id,
      title: event.title,
      by: event.organizer.name,
      type: event.isFree ? 'EVENT' : 'EVENT · PAID',
      city: event.city,
      traction: event.isFree ? `${event.goingCount} RSVP · ${event.shareCount} SH` : `${event._count.tickets} SOLD`,
      featured: event.featuredRank != null,
      hidden: Boolean(event.hiddenAt),
      category: EVENT_CATEGORIES[event.category],
    })),
    ...needs.map((need) => ({
      kind: 'need',
      id: need.id,
      title: need.title,
      by: shortName(need.poster.name),
      type: 'NEED',
      city: need.city,
      traction: `${need.offerCount} OFFERS`,
      featured: false,
      hidden: Boolean(need.hiddenAt),
    })),
  ];
}

export async function setFeatured(admin, eventId, featured) {
  await transaction(async (tx) => {
    if (featured) {
      const top = await tx.event.aggregate({ _max: { featuredRank: true } });
      await tx.event.update({ where: { id: eventId }, data: { featuredRank: (top._max.featuredRank ?? 0) + 1, badge: 'FEATURED' } });
    } else {
      await tx.event.update({ where: { id: eventId }, data: { featuredRank: null, badge: null } });
    }
    await audit(tx, { actorId: admin.id, action: featured ? 'content.featured' : 'content.unfeatured', targetType: 'Event', targetId: eventId });
  });
  return { featured };
}

export async function setHidden(admin, kind, id, hidden, reason) {
  await transaction(async (tx) => {
    if (kind === 'event') await tx.event.update({ where: { id }, data: hidden ? { hiddenAt: new Date(), hiddenReason: reason || 'moderation' } : { hiddenAt: null, hiddenReason: null } });
    else if (kind === 'need') await tx.need.update({ where: { id }, data: { hiddenAt: hidden ? new Date() : null } });
    else throw badRequest('Unknown content type.');
    await audit(tx, { actorId: admin.id, action: hidden ? 'content.hidden' : 'content.restored', targetType: kind, targetId: id, meta: { reason } });
  });
  return { hidden };
}

export async function adminSettings() {
  const values = await getSettings();
  return Object.entries(SETTING_COPY).map(([key, [title, desc]]) => ({ key, title, desc, on: values[key] }));
}

export async function updateSetting(admin, key, value) {
  if (admin.role !== 'ADMIN') throw forbidden('Only administrators can change platform settings.');
  await transaction(async (tx) => {
    await setSetting(tx, key, value, admin.id);
    await audit(tx, { actorId: admin.id, action: 'settings.changed', targetType: 'PlatformSetting', targetId: key, meta: { value } });
  });
  return { key, value: Boolean(value) };
}

// ── Overview ──────────────────────────────────────────────────────────────

function delta(current, previous) {
  if (!previous) return current ? 'new this period' : 'no change';
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs prior 30d`;
}

export async function adminOverview() {
  const now = Date.now();
  const d30 = new Date(now - 30 * 86_400_000);
  const d60 = new Date(now - 60 * 86_400_000);
  const d7 = new Date(now - 7 * 86_400_000);
  const [
    users, users30, usersPrior, providers, providers7, liveEvents, featuredEligible, openNeeds,
    tickets30, ticketsPrior, openReports, highReports, pendingVerifications, stalledVerifications, payoutsPending, ordersPaid30, escrowed30,
  ] = await Promise.all([
    prisma.user.count({ where: { status: { not: 'DELETED' } } }),
    prisma.user.count({ where: { createdAt: { gte: d30 } } }),
    prisma.user.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    prisma.provider.count({ where: { status: 'ACTIVE' } }),
    prisma.provider.count({ where: { status: 'ACTIVE', createdAt: { gte: d7 } } }),
    prisma.event.count({ where: { status: 'PUBLISHED', hiddenAt: null, startsAt: { gte: new Date(now - 6 * 3600 * 1000) } } }),
    prisma.event.count({ where: { status: 'PUBLISHED', hiddenAt: null, featuredRank: null, goingCount: { gte: 50 } } }),
    prisma.need.count({ where: { status: 'OPEN', hiddenAt: null } }),
    prisma.ticket.count({ where: { createdAt: { gte: d30 }, order: { status: 'PAID' } } }),
    prisma.ticket.count({ where: { createdAt: { gte: d60, lt: d30 }, order: { status: 'PAID' } } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.report.count({ where: { status: 'OPEN', severity: 'HIGH' } }),
    prisma.verificationApplication.count({ where: { status: 'SUBMITTED' } }),
    prisma.verificationApplication.count({ where: { status: 'SUBMITTED', submittedAt: { lt: new Date(now - 48 * 3600 * 1000) } } }),
    prisma.payout.groupBy({ by: ['currency'], where: { status: 'REQUESTED' }, _sum: { amountMinor: true }, _count: { _all: true } }),
    prisma.order.groupBy({ by: ['currency'], where: { status: 'PAID', paidAt: { gte: d30 } }, _sum: { totalMinor: true } }),
    prisma.booking.groupBy({ by: ['currency'], where: { escrowedAt: { gte: d30 } }, _sum: { amountMinor: true } }),
  ]);

  const rates = await getRates();
  const toUsd = (rows, field) => rows.reduce((sum, row) => sum + convert(row._sum[field] || 0, row.currency === 'PTS' ? 'PTS' : row.currency, 'USD', rates), 0);
  const gmvCents = toUsd(ordersPaid30, 'totalMinor') + toUsd(escrowed30, 'amountMinor');
  const payoutCount = payoutsPending.reduce((sum, row) => sum + row._count._all, 0);
  const payoutUsd = toUsd(payoutsPending, 'amountMinor');
  const escalated = await prisma.dispute.count({ where: { status: 'ESCALATED' } });
  const matched = await prisma.need.count({ where: { createdAt: { gte: d30 }, offerCount: { gt: 0 } } });
  const posted = await prisma.need.count({ where: { createdAt: { gte: d30 } } });

  const kpis = [
    { label: 'TOTAL USERS', big: users.toLocaleString('en-US'), delta: delta(users30, usersPrior), good: users30 >= usersPrior },
    { label: 'ACTIVE VENDORS', big: providers.toLocaleString('en-US'), delta: `+${providers7} this week`, good: true },
    { label: 'LIVE EVENTS', big: liveEvents.toLocaleString('en-US'), delta: `${featuredEligible} featured-eligible`, good: null },
    { label: 'OPEN NEEDS', big: openNeeds.toLocaleString('en-US'), delta: posted ? `${Math.round((matched / posted) * 100)}% got an offer (30d)` : 'no needs posted (30d)', good: true },
    { label: 'TICKETS SOLD (30D)', big: tickets30.toLocaleString('en-US'), delta: delta(tickets30, ticketsPrior), good: tickets30 >= ticketsPrior },
    { label: 'GMV (30D)', big: usdShort(gmvCents), delta: 'USD equivalent', good: null },
    { label: 'OPEN REPORTS', big: String(openReports), delta: highReports ? `${highReports} high severity` : 'none high severity', good: highReports ? false : null },
    { label: 'PAYOUTS WAITING', big: String(payoutCount), delta: payoutCount ? `${usdShort(payoutUsd)} to approve` : 'queue is clear', good: payoutCount ? false : true },
  ];

  const attention = [];
  if (highReports) attention.push({ label: `${highReports} high-severity report${highReports === 1 ? '' : 's'} waiting`, action: 'MODERATE', section: 'moderation' });
  if (escalated) attention.push({ label: `${escalated} refund case${escalated === 1 ? '' : 's'} waiting for a decision (money is frozen)`, action: 'DECIDE', section: 'cases' });
  if (stalledVerifications) attention.push({ label: `${stalledVerifications} vendor verification${stalledVerifications === 1 ? '' : 's'} waiting over 48h`, action: 'REVIEW', section: 'verify' });
  if (payoutCount) attention.push({ label: `Payout batch of ${usdShort(payoutUsd)} awaits finance approval`, action: 'FINANCE', href: '/finance' });
  if (featuredEligible) attention.push({ label: `${featuredEligible} popular event${featuredEligible === 1 ? ' is' : 's are'} not featured yet`, action: 'CURATE', section: 'content' });

  return { kpis, attention, badges: { moderation: openReports || null, cases: escalated || null, verify: pendingVerifications || null } };
}

function usdShort(cents) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 10_000) return `$${Math.round(dollars / 1000)}K`;
  return `$${Math.round(dollars).toLocaleString('en-US')}`;
}
