import { Anton, Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

// Fonts are downloaded at build time and served from this site, so pages
// never wait on (or report visitors to) a third-party font host.
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-anton' });
const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });
const geistMono = Geist_Mono({ weight: ['400', '500'], subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' });
const instrumentSerif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], display: 'swap', variable: '--font-instrument-serif' });
const fontVariables = [anton.variable, geist.variable, geistMono.variable, instrumentSerif.variable].join(' ');

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
    images: [{ url: '/brand/share-card.png', width: 1200, height: 630, alt: 'Twendezetu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twendezetu — Gather anywhere.',
    description: 'Post events and needs, discover providers, RSVP, pay, and coordinate without exposing contacts.',
    images: ['/brand/share-card.png'],
  },
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#1F3A38',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a href="#main" className="tz-skip">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
