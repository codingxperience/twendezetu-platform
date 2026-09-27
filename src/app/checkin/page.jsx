import { notFound } from 'next/navigation';
import CheckinView from '../_views/checkin';
import { requireViewer } from '@/server/viewer';
import { checkinView } from '@/server/views/checkin';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Door check-in — Twendezetu', robots: { index: false } };

export default async function CheckinPage({ searchParams }) {
  const params = (await searchParams) || {};
  const event = typeof params.event === 'string' ? params.event.slice(0, 120) : undefined;
  const viewer = await requireViewer(event ? `/checkin?event=${encodeURIComponent(event)}` : '/checkin');
  const data = await checkinView(viewer, { event }).catch((error) => {
    // Someone else's event reads as not found.
    if (error.status === 404 || error.status === 403) return null;
    throw error;
  });
  if (!data) notFound();
  return <CheckinView data={data} params={{ event }} />;
}
