import { ClaudeDesignPage } from '@/components/ClaudeDesignPage';
import { findProviderBySlug } from '@/design/providers-catalog';
import { ogImagesFor } from '@/design/events-catalog';

const SITE = 'Twendezetu';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const provider = findProviderBySlug(slug);

  if (!provider) {
    return {
      title: `Provider · ${SITE}`,
      description: 'Discover trusted providers across East Africa and the diaspora.',
    };
  }

  const title = `${provider.name} · ${provider.cat} · ${provider.city}`;
  const description = provider.description;
  const url = `/providers/${provider.slug}`;

  return {
    title: `${provider.name} — ${SITE}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: provider.name,
      description,
      url,
      type: 'website',
      siteName: SITE,
      images: ogImagesFor(provider.img, provider.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: provider.name,
      description,
      images: ogImagesFor(provider.img, provider.name).map((image) => image.url),
    },
  };
}

export default async function ProviderDetailPage({ params }) {
  const { slug } = await params;
  return <ClaudeDesignPage page="providerDetail" initialState={{ slug }} />;
}
