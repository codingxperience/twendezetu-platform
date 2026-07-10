import { ClaudeDesignPage } from '@/components/ClaudeDesignPage';
import { findEventBySlug } from '@/design/events-catalog';

const SITE = 'Twendezetu';

export function generateMetadata() {
  const event = findEventBySlug('nyama-choma-festival-2026');
  const description = event?.blurb || 'NYTC Nyama Choma Festival — Nanenane in Jersey City.';

  return {
    title: `${event?.title || 'NYTC Nyama Choma Festival'} — ${SITE}`,
    description,
    alternates: { canonical: '/events/nyama-choma-festival-2026' },
    openGraph: {
      title: event?.title || 'NYTC Nyama Choma Festival',
      description,
      url: '/events/nyama-choma-festival-2026',
      type: 'website',
      siteName: SITE,
      images: [{ url: event?.img || '/assets/events/nytc-nanenane-2026-flyer.jpeg', alt: event?.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event?.title || 'NYTC Nyama Choma Festival',
      description,
      images: [event?.img || '/assets/events/nytc-nanenane-2026-flyer.jpeg'],
    },
  };
}

export default function NyamaChomaEventPage() {
  return <ClaudeDesignPage page="event" />;
}
