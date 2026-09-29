import ProviderDashboardView from '../_views/providerDashboard';
import { requireViewer } from '@/server/viewer';
import { providerDashboardView } from '@/server/views/providerDashboard';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Vendor portal — Twendezetu', robots: { index: false } };

export default async function ProviderDashboardPage({ searchParams }) {
  const params = (await searchParams) || {};
  const edit = params.edit === '1' ? '1' : undefined;
  const viewer = await requireViewer(`/provider-dashboard${edit ? '?edit=1' : ''}`);
  const data = await providerDashboardView(viewer);
  return <ProviderDashboardView data={data} params={{ edit }} />;
}
