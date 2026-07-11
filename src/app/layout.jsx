import './globals.css';
import { Toaster } from '@/components/Toaster';
import { ThemeApplier } from '@/components/ThemeApplier';

// Resolve a public, crawlable base URL for social/OG previews.
// A localhost NEXT_PUBLIC_APP_URL (dev default) must never leak into a deploy's
// metadataBase, or link previews resolve to unreachable localhost URLs.
function resolveAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  const isLocal = (u) => !u || /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(u);
  if (!isLocal(explicit)) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return explicit || 'https://twendezetu-platform-oufr.vercel.app';
}

const appUrl = resolveAppUrl();

export const metadata = {
  title: 'Twendezetu — Event Portal',
  description: 'Events, needs, providers, tickets, and masked community coordination for East Africa and the diaspora.',
  keywords: ['East Africa', 'event portal', 'nyama choma', 'diaspora', 'providers', 'Nairobi', 'Kampala', 'New Jersey'],
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Twendezetu — Gather anywhere.',
    description: 'Post events and needs, discover providers, RSVP, pay, and coordinate without exposing contacts.',
    type: 'website',
    siteName: 'Twendezetu',
    images: [{ url: '/assets/events/nytc-nanenane-2026-flyer.jpeg', alt: 'Twendezetu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twendezetu — Gather anywhere.',
    description: 'Post events and needs, discover providers, RSVP, pay, and coordinate without exposing contacts.',
    images: ['/assets/events/nytc-nanenane-2026-flyer.jpeg'],
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  themeColor: '#1F3A38',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <a href="#main" className="tz-skip">Skip to content</a>
        <ThemeApplier />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
