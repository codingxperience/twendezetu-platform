import { notFound } from 'next/navigation';
import SplitPayView from '../_views/splitPay';
import { getViewer, requireViewer } from '@/server/viewer';
import { splitPayView } from '@/server/views/splitPay';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Split pay — Twendezetu', robots: { index: false } };

// A split link works for anyone who has it; the list of your splits needs
// an account.
export default async function SplitPayPage({ searchParams }) {
  const params = (await searchParams) || {};
  const split = typeof params.split === 'string' ? params.split.slice(0, 40) : undefined;
  const viewer = split ? await getViewer() : await requireViewer('/split-pay');
  const data = await splitPayView(viewer, { split }).catch((error) => {
    if (error.status === 404) return null;
    throw error;
  });
  if (!data) notFound();
  return <SplitPayView data={data} params={{ split }} />;
}
