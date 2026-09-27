import DisputesView from '../_views/disputes';
import { requireViewer } from '@/server/viewer';
import { disputesView } from '@/server/views/disputes';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Refunds & disputes — Twendezetu', robots: { index: false } };

const PARAMS = ['case', 'order', 'booking'];

export default async function DisputesPage({ searchParams }) {
  const raw = (await searchParams) || {};
  const params = Object.fromEntries(PARAMS.filter((key) => typeof raw[key] === 'string').map((key) => [key, raw[key].slice(0, 64)]));
  const query = new URLSearchParams(params).toString();
  const viewer = await requireViewer(`/disputes${query ? `?${query}` : ''}`);
  const data = await disputesView(viewer, params);
  return <DisputesView data={data} params={params} />;
}
