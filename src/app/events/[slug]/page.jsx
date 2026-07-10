import { ClaudeDesignPage } from '@/components/ClaudeDesignPage';
import { findEventBySlug } from '@/design/events-catalog';

const SITE = 'Twendezetu';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = findEventBySlug(slug);

  if (!event) {
    return {
      title: `Event · ${SITE}`,
      description: 'Discover events, needs and providers across East Africa and the diaspora.',
    };
  }

  const title = `${event.title} · ${event.date} · ${event.city}`;
  const description = event.blurb || event.description;
  const url = `/events/${event.slug}`;

  return {
    title: `${event.title} — ${SITE}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: event.title,
      description,
      url,
      type: 'website',
      siteName: SITE,
      images: [{ url: event.img, alt: event.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [event.img],
    },
  };
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params;
  return <ClaudeDesignPage page="eventDetail" initialState={{ slug }} />;
}
