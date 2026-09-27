// Referral rewards: your invite link, what each friend earned you, and how
// close the next multiplier is.

import { prisma } from '../db.js';
import { unauthorized } from '../errors.js';
import { referralSummary } from '../services/referrals.js';
import { appUrl, me } from './common.js';

export async function referralRewardsView(viewer) {
  if (!viewer) throw unauthorized();
  const [person, summary] = await Promise.all([me(viewer), referralSummary(prisma, viewer.id)]);
  return { me: person, link: `${appUrl()}/r/${summary.handle}`, ...summary };
}
