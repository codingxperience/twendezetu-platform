import { notFound } from 'next/navigation';
import EventView from '../../_views/event';
import { getViewer } from '@/server/viewer';
import { eventMetadata, eventView } from '@/server/views/event';
import { previewMetadata } from '@/server/og';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await eventMetadata(slug);
  if (!event || event.hiddenAt || !['PUBLISHED', 'CANCELLED'].includes(event.status)) {
    return { title: 'Event — Twendezetu', robots: { index: false } };
  }
  return previewMetadata({ title: event.title, description: event.blurb, path: `/events/${event.slug}`, image: event.coverUrl });
}

export default async function EventPage({ params, searchParams }) {
  const { slug } = await params;
  const query = (await searchParams) || {};
  const text = (value) => (typeof value === 'string' ? value.slice(0, 120) : undefined);
  const viewer = await getViewer();
  const data = await eventView(viewer, { slug, rsvp: text(query.rsvp) });
  if (!data) notFound();
  return <EventView data={data} params={{ slug, rsvp: text(query.rsvp), r: text(query.r), src: text(query.src) }} />;
}
