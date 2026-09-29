import ProvidersView from '../_views/providers';
import { getViewer } from '@/server/viewer';
import { providersView } from '@/server/views/providers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vendors — Twendezetu',
  description: 'DJs, caterers, tents, drivers, photographers and MCs across East Africa and the diaspora. Request a quote with your contacts masked.',
  alternates: { canonical: '/vendors' },
};

const text = (value) => (typeof value === 'string' ? value.slice(0, 80) : undefined);

export default async function VendorsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const query = { category: text(params.category), city: text(params.city), q: text(params.q) };
  const data = await providersView(await getViewer(), query);
  return <ProvidersView data={data} params={query} />;
}
