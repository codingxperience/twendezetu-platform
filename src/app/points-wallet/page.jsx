import WalletView from '../_views/wallet';
import { requireViewer } from '@/server/viewer';
import { walletView } from '@/server/views/wallet';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Points wallet — Twendezetu', robots: { index: false } };

export default async function PointsWalletPage({ searchParams }) {
  const params = (await searchParams) || {};
  const pool = typeof params.pool === 'string' ? params.pool.slice(0, 100) : undefined;
  const viewer = await requireViewer(pool ? `/points-wallet?pool=${encodeURIComponent(pool)}` : '/points-wallet');
  const data = await walletView(viewer, { pool });
  return <WalletView data={data} params={{ pool }} />;
}
