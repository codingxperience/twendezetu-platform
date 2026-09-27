// Referral rewards: share your link and follow what it has earned.

import { COLORS, copyText, shareLinks } from './shared';

const points = (value) => value.toLocaleString('en-US');

export const initialState = { copied: false };

export function values(state, set, ctx) {
  const { data } = state;
  const share = shareLinks(data.link, 'Join me on Twendezetu, where our community finds events and trusted providers.', 'Join me on Twendezetu');
  const next = data.nextTier;
  const progress = next ? Math.round((data.verifiedFriends / next.friends) * 100) : 100;

  return {
    me: data.me,
    link: data.link,
    copyLabel: state.copied ? 'COPIED ✓' : 'COPY',
    copyLink: async () => {
      if (!(await copyText(data.link))) return ctx.toast('Copy failed. Select the link and copy it by hand.', 'err');
      set((current) => ({ ...current, copied: true }));
      window.setTimeout(() => set((current) => ({ ...current, copied: false })), 2000);
      return undefined;
    },
    waHref: share.waHref,
    fbHref: share.fbHref,
    smsHref: `sms:?&body=${encodeURIComponent(`Join me on Twendezetu: ${data.link}`)}`,

    earned: points(data.totalPoints),
    earnedNote: data.verifiedFriends
      ? `≈ $${(data.totalPoints / 100).toFixed(2)} · from ${data.verifiedFriends} verified friend${data.verifiedFriends === 1 ? '' : 's'}`
      : 'Nothing yet: share your link to start',

    rules: data.rules.map((rule) => ({ ...rule, pts: `+${points(rule.points * data.multiplier)}` })),
    multiplierNote: data.multiplier > 1
      ? `Shown at your ${data.multiplier}× ${data.currentTier} rate.`
      : 'Points reach your wallet as soon as a friend hits each step.',

    milestoneLabel: next ? `${data.verifiedFriends} / ${next.friends} TO ${next.name.toUpperCase()}` : 'TOP TIER REACHED',
    progressWidth: `${Math.min(100, progress)}%`,
    tiers: data.tiers.map((tier) => ({
      ...tier,
      bg: tier.current ? COLORS.clay : tier.reached ? COLORS.forest : COLORS.paper,
      fg: tier.current || !tier.reached ? COLORS.ink : COLORS.cream,
      badge: tier.current ? 'YOU ARE HERE' : tier.reached ? 'REACHED' : 'LOCKED',
      badgeColor: tier.current ? COLORS.ink : tier.reached ? COLORS.clayLight : COLORS.muted,
    })),

    friends: data.friends.map((friend, index) => ({
      ...friend,
      pts: `+${points(friend.points)}`,
      avBg: [COLORS.clay, COLORS.forest, COLORS.sage, COLORS.clayLight][index % 4],
      avFg: index % 4 === 1 ? COLORS.cream : COLORS.ink,
      color: COLORS.rust,
    })),
    hasFriends: data.friends.length > 0,
    noFriends: data.friends.length === 0,
    waitingNote: data.waiting
      ? `${data.waiting} more signed up through your link and have not verified a phone yet. Nothing is earned until they do.`
      : '',
    hasWaiting: data.waiting > 0,
  };
}
