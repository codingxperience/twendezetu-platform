// Referral rewards. A friend who joins through someone's link earns that
// person points at four milestones. Each milestone pays once per friend (a
// unique index guarantees it), funded from the platform promotions account.

import { REFERRAL_POINTS, REFERRAL_TIERS } from '../fees.js';
import { accounts, post } from '../ledger.js';
import { notify } from '../notify/index.js';
import { relativeTime, initials, shortName } from '../../shared/format.js';

const MILESTONE_COPY = {
  JOINED: 'Joined + verified',
  FIRST_TICKET: 'Bought a ticket',
  FIRST_POST: 'Posted an event or a need',
  BECAME_PROVIDER: 'Became a provider',
};

export function tierFor(friendCount) {
  let current = null;
  for (const tier of REFERRAL_TIERS) if (friendCount >= tier.friends) current = tier;
  return current;
}

// Call inside the transaction of the action that reached the milestone.
export async function awardReferral(tx, refereeId, milestone) {
  const referee = await tx.user.findUnique({
    where: { id: refereeId },
    select: { name: true, phoneVerifiedAt: true, referredBy: { select: { id: true, status: true } } },
  });
  const referrer = referee?.referredBy;
  if (!referrer || referrer.status !== 'ACTIVE') return null;
  // Nothing pays before the friend verifies a phone number (one account per
  // number), which is what stops points being farmed with throwaway
  // sign-ups. Steps reached before that are paid when they verify.
  if (!referee.phoneVerifiedAt) return null;

  const already = await tx.referralReward.findUnique({ where: { refereeId_milestone: { refereeId, milestone } } });
  if (already) return null;

  const verifiedFriends = await tx.referralReward.count({ where: { referrerId: referrer.id, milestone: 'JOINED' } });
  const multiplier = tierFor(verifiedFriends)?.multiplier || 1;
  const points = REFERRAL_POINTS[milestone] * multiplier;

  const entryId = await post(tx, {
    kind: 'REFERRAL_REWARD',
    memo: `Referral: ${shortName(referee.name)} · ${MILESTONE_COPY[milestone].toLowerCase()}`,
    reference: refereeId,
    idempotencyKey: `referral:${refereeId}:${milestone}`,
    meta: { refereeId, milestone },
    lines: [
      { account: accounts.promotions(), amount: -points },
      { account: accounts.wallet(referrer.id), amount: points },
    ],
  });

  await tx.referralReward.create({
    data: { referrerId: referrer.id, refereeId, milestone, points, journalEntryId: entryId },
  });

  await notify(tx, {
    userId: referrer.id,
    topic: 'SOCIAL',
    title: `+${points} points from your referral`,
    body: `${shortName(referee.name)} · ${MILESTONE_COPY[milestone].toLowerCase()}.`,
    href: '/referral-rewards',
  });

  if (milestone === 'JOINED') {
    for (const earlier of await milestonesReached(tx, refereeId)) await awardReferral(tx, refereeId, earlier);
  }
  return points;
}

// Steps a friend reached before verifying their phone.
async function milestonesReached(tx, userId) {
  const [tickets, events, needs, memberships] = await Promise.all([
    tx.order.count({ where: { buyerId: userId, paidAt: { not: null } } }),
    tx.event.count({ where: { createdById: userId } }),
    tx.need.count({ where: { posterId: userId } }),
    tx.membership.count({ where: { provider: { ownerId: userId } } }),
  ]);
  return [tickets && 'FIRST_TICKET', (events || needs) && 'FIRST_POST', memberships && 'BECAME_PROVIDER'].filter(Boolean);
}

export async function referralSummary(db, userId) {
  const [user, rewards, invited] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { handle: true } }),
    db.referralReward.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { referee: { select: { id: true, name: true } } },
    }),
    db.user.count({ where: { referredById: userId } }),
  ]);

  const byFriend = new Map();
  for (const reward of rewards) {
    const entry = byFriend.get(reward.refereeId) || { name: reward.referee.name, points: 0, latest: reward, milestones: 0 };
    entry.points += reward.points;
    entry.milestones += 1;
    byFriend.set(reward.refereeId, entry);
  }
  const verified = rewards.filter((reward) => reward.milestone === 'JOINED').length;
  const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
  const current = tierFor(verified);
  const next = REFERRAL_TIERS.find((tier) => tier.friends > verified) || null;

  return {
    handle: user.handle,
    verifiedFriends: verified,
    // Signed up through the link but not yet verified: nothing earned yet.
    waiting: Math.max(0, invited - byFriend.size),
    totalPoints,
    multiplier: current?.multiplier || 1,
    currentTier: current?.name || null,
    nextTier: next ? { name: next.name, friends: next.friends, remaining: next.friends - verified } : null,
    rules: [
      { icon: '👋', label: 'Friend joins and verifies their phone number', points: REFERRAL_POINTS.JOINED },
      { icon: '🎟', label: 'Their first ticket purchase', points: REFERRAL_POINTS.FIRST_TICKET },
      { icon: '📣', label: 'They post an event or a need', points: REFERRAL_POINTS.FIRST_POST },
      { icon: '🤝', label: 'They become a paying provider', points: REFERRAL_POINTS.BECAME_PROVIDER },
    ],
    tiers: REFERRAL_TIERS.map((tier) => ({
      name: tier.name,
      need: `${tier.friends} verified friend${tier.friends === 1 ? '' : 's'}`,
      perk: tier.perk,
      reached: verified >= tier.friends,
      current: current?.name === tier.name,
    })),
    friends: [...byFriend.values()].map((friend) => ({
      init: initials(friend.name),
      name: shortName(friend.name),
      action: `${MILESTONE_COPY[friend.latest.milestone]} · ${relativeTime(friend.latest.createdAt).toLowerCase()}`,
      milestones: friend.milestones,
      points: friend.points,
    })),
  };
}
