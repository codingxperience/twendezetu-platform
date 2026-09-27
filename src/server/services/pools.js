// Harambee pools: a shared pot of points for a wedding convoy, a DJ's fuel
// or a festival's tents. Anyone with the link can chip in; the organizer
// releases the pot to their wallet once it is funded.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, forbidden, invalid, notFound } from '../errors.js';
import { accounts, balanceOf, post } from '../ledger.js';
import { notify } from '../notify/index.js';
import { getSettings } from '../settings.js';
import { initials, shortDate, shortName, slugify } from '../../shared/format.js';
import { uniqueSlug } from './events.js';

// Pools above US$1,000 can be held for finance review (admin setting).
const REVIEW_THRESHOLD_POINTS = 100_000;

export async function createPool(user, { title, purpose, goalPoints, eventSlug, closesAt }) {
  const goal = Number(goalPoints);
  if (!Number.isInteger(goal) || goal < 100) throw invalid('Set a goal of at least 100 points.');
  const event = eventSlug ? await prisma.event.findUnique({ where: { slug: eventSlug }, select: { id: true } }) : null;
  const pool = await transaction(async (tx) => {
    const created = await tx.pool.create({
      data: {
        slug: await uniqueSlug(tx, 'pool', slugify(title)),
        creatorId: user.id,
        title: title.trim(),
        purpose: (purpose || '').trim(),
        goalPoints: goal,
        eventId: event?.id || null,
        closesAt: closesAt ? new Date(closesAt) : null,
      },
    });
    await audit(tx, { actorId: user.id, action: 'pool.created', targetType: 'Pool', targetId: created.id });
    return created;
  });
  return { slug: pool.slug, href: `/points-wallet?pool=${pool.slug}` };
}

export async function contribute(user, slug, { points, note }) {
  const amount = Number(points);
  if (!Number.isInteger(amount) || amount <= 0) throw invalid('Enter a whole number of points above 0.');
  const pool = await prisma.pool.findUnique({ where: { slug } });
  if (!pool) throw notFound('That pool does not exist.');
  if (pool.status !== 'OPEN') throw badRequest(pool.status === 'FUNDED' ? 'This pool already hit its goal.' : 'This pool is closed.');
  if (pool.closesAt && pool.closesAt < new Date()) throw badRequest('This pool has closed.');

  return transaction(async (tx) => {
    const cleanNote = note ? String(note).trim().slice(0, 140) : null;
    const entryId = await post(tx, {
      kind: 'POOL_CONTRIBUTION',
      memo: `Pool: ${pool.title}`,
      reference: pool.id,
      actorId: user.id,
      meta: { poolId: pool.id, poolTitle: pool.title, note: cleanNote },
      lines: [
        { account: accounts.wallet(user.id), amount: -amount },
        { account: accounts.pool(pool.id), amount },
      ],
    });
    await tx.poolContribution.create({ data: { poolId: pool.id, userId: user.id, points: amount, note: cleanNote, journalEntryId: entryId } });

    const contributors = await tx.poolContribution.findMany({ where: { poolId: pool.id }, distinct: ['userId'], select: { userId: true } });
    const updated = await tx.pool.update({
      where: { id: pool.id },
      data: { raisedPoints: { increment: amount }, contributorCount: contributors.length },
    });
    if (updated.raisedPoints >= updated.goalPoints && updated.status === 'OPEN') {
      await tx.pool.update({ where: { id: pool.id }, data: { status: 'FUNDED' } });
      await notify(tx, {
        userId: pool.creatorId,
        topic: 'MONEY',
        title: `${pool.title} is fully funded`,
        body: `${updated.raisedPoints.toLocaleString('en-US')} points from ${contributors.length} people. Release it to your wallet when you are ready.`,
        href: `/points-wallet?pool=${pool.slug}`,
      });
    } else if (pool.creatorId !== user.id) {
      await notify(tx, {
        userId: pool.creatorId,
        topic: 'SOCIAL',
        title: `${shortName(user.name)} chipped in`,
        body: `${amount.toLocaleString('en-US')} points to ${pool.title}.`,
        href: `/points-wallet?pool=${pool.slug}`,
      });
    }
    return { raisedPoints: updated.raisedPoints, goalPoints: updated.goalPoints };
  });
}

export async function releasePool(user, slug, { byFinance = false } = {}) {
  const pool = await prisma.pool.findUnique({ where: { slug } });
  if (!pool) throw notFound();
  if (!byFinance && pool.creatorId !== user.id) throw forbidden('Only the person who started this pool can release it.');
  if (pool.status === 'RELEASED') throw badRequest('This pool was already released.');

  const balance = await balanceOf(prisma, accounts.pool(pool.id));
  if (balance <= 0) throw badRequest('There is nothing in this pool to release yet.');
  const settings = await getSettings();
  if (!byFinance && settings.poolReleaseReview && balance > REVIEW_THRESHOLD_POINTS) {
    throw forbidden('Pools over $1,000 are released after a finance review. The team has been notified.');
  }

  await transaction(async (tx) => {
    await post(tx, {
      kind: 'POOL_RELEASE',
      memo: `Pool released: ${pool.title}`,
      reference: pool.id,
      idempotencyKey: `pool:${pool.id}:release:${balance}`,
      actorId: user.id,
      meta: { poolId: pool.id, poolTitle: pool.title },
      lines: [
        { account: accounts.pool(pool.id), amount: -balance },
        { account: accounts.wallet(pool.creatorId), amount: balance },
      ],
    });
    await tx.pool.update({ where: { id: pool.id }, data: { status: 'RELEASED', releasedAt: new Date() } });
    await audit(tx, { actorId: user.id, action: 'pool.released', targetType: 'Pool', targetId: pool.id, meta: { points: balance, byFinance } });
  });
  return { released: balance };
}

function poolView(pool, viewerId) {
  const pct = Math.min(100, Math.round((pool.raisedPoints / pool.goalPoints) * 100));
  const recent = pool.contributions || [];
  const shown = recent.slice(0, 3).map((contribution) => initials(contribution.user.name));
  const extra = pool.contributorCount - shown.length;
  const status = pool.status === 'OPEN' && pool.closesAt && pool.closesAt.getTime() - Date.now() < 3 * 86_400_000 ? 'CLOSING SOON' : pool.status;
  return {
    slug: pool.slug,
    title: pool.title,
    meta: [pool.purpose, pool.closesAt ? `CLOSES ${shortDate(pool.closesAt)}` : null].filter(Boolean).join(' · ').toUpperCase(),
    status,
    raised: pool.raisedPoints,
    goal: pool.goalPoints,
    pct,
    count: pool.contributorCount,
    contributors: [...shown, ...(extra > 0 ? [`+${extra}`] : [])],
    mine: pool.creatorId === viewerId,
    releasable: pool.creatorId === viewerId && pool.status !== 'RELEASED' && pool.raisedPoints > 0,
  };
}

const POOL_INCLUDE = {
  contributions: {
    orderBy: { createdAt: 'desc' },
    distinct: ['userId'],
    take: 3,
    include: { user: { select: { name: true } } },
  },
};

export async function poolsForUser(userId, { highlightSlug } = {}) {
  const pools = await prisma.pool.findMany({
    where: {
      status: { in: ['OPEN', 'FUNDED'] },
      OR: [{ creatorId: userId }, { contributions: { some: { userId } } }, ...(highlightSlug ? [{ slug: highlightSlug }] : [])],
    },
    include: POOL_INCLUDE,
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    take: 12,
  });
  const views = pools.map((pool) => poolView(pool, userId));
  if (highlightSlug) views.sort((a, b) => (a.slug === highlightSlug ? -1 : b.slug === highlightSlug ? 1 : 0));
  return views;
}
