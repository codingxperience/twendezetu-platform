import { notFound, redirect } from 'next/navigation';
import CheckoutView from '../_views/checkout';
import { getViewer } from '@/server/viewer';
import { checkoutView } from '@/server/views/checkout';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Checkout — Twendezetu', robots: { index: false } };

const text = (value) => (typeof value === 'string' ? value.slice(0, 120) : undefined);

export default async function CheckoutPage({ searchParams }) {
  const params = (await searchParams) || {};
  const slug = text(params.event);
  if (!slug) redirect('/');
  const viewer = await getViewer();
  const data = await checkoutView(viewer, { event: slug, order: text(params.order), key: text(params.key) });
  if (!data) notFound();
  if ((data.event.isFree || data.event.past) && !data.order) redirect(`/events/${slug}`);
  return <CheckoutView data={data} params={{ event: slug, order: text(params.order), key: text(params.key), r: text(params.r), src: text(params.src), promo: text(params.promo) }} />;
}
