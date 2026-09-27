import ReferralRewardsView from '../_views/referralRewards';
import { requireViewer } from '@/server/viewer';
import { referralRewardsView } from '@/server/views/referralRewards';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Referral rewards — Twendezetu', robots: { index: false } };

export default async function ReferralRewardsPage() {
  const viewer = await requireViewer('/referral-rewards');
  const data = await referralRewardsView(viewer);
  return <ReferralRewardsView data={data} />;
}
