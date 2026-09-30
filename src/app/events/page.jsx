import EventsView from '../_views/events';
import { getViewer } from '@/server/viewer';
import { eventsView, readBrowseQuery } from '@/server/views/events';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Events — Twendezetu',
  description: 'Every upcoming event on Twendezetu: concerts, fundraisers, weddings, cookouts, church and sports events across East Africa and the diaspora.',
  alternates: { canonical: '/events' },
};

export default async function EventsPage({ searchParams }) {
  const query = readBrowseQuery((await searchParams) || {});
  const data = await eventsView(await getViewer(), query);
  return <EventsView data={data} params={{}} />;
}
