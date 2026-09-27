import FinanceView from '../_views/finance';
import { requireRole } from '@/server/viewer';
import { financeView } from '@/server/views/finance';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Finance console — Twendezetu', robots: { index: false } };

export default async function FinancePage({ searchParams }) {
  const params = (await searchParams) || {};
  const range = typeof params.range === 'string' ? params.range : undefined;
  const filter = typeof params.filter === 'string' ? params.filter : undefined;
  const viewer = await requireRole(['ADMIN', 'FINANCE'], '/finance');
  const data = await financeView(viewer, { range, filter });
  return <FinanceView data={data} params={{ range: data.range, filter: data.filter }} />;
}
