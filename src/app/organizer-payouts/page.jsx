import OrganizerPayoutsView from '../_views/organizerPayouts';
import { requireViewer } from '@/server/viewer';
import { organizerPayoutsView } from '@/server/views/organizerPayouts';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Payouts — Twendezetu', robots: { index: false } };

export default async function OrganizerPayoutsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const currency = typeof params.currency === 'string' && /^[A-Za-z]{3}$/.test(params.currency) ? params.currency.toUpperCase() : undefined;
  const viewer = await requireViewer(currency ? `/organizer-payouts?currency=${currency}` : '/organizer-payouts');
  const data = await organizerPayoutsView(viewer, { currency });
  return <OrganizerPayoutsView data={data} params={{ currency }} />;
}
