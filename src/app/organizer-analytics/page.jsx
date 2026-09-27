import { notFound } from 'next/navigation';
import OrganizerAnalyticsView from '../_views/organizerAnalytics';
import { requireViewer } from '@/server/viewer';
import { organizerAnalyticsView } from '@/server/views/organizerAnalytics';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Event analytics — Twendezetu', robots: { index: false } };

export default async function OrganizerAnalyticsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const event = typeof params.event === 'string' ? params.event.slice(0, 120) : undefined;
  const viewer = await requireViewer(event ? `/organizer-analytics?event=${encodeURIComponent(event)}` : '/organizer-analytics');
  const data = await organizerAnalyticsView(viewer, { event }).catch((error) => {
    // Someone else's event reads as not found.
    if (error.status === 404 || error.status === 403) return null;
    throw error;
  });
  if (!data) notFound();
  return <OrganizerAnalyticsView data={data} params={{ event }} />;
}
