import './globals.css';
import { Toaster } from '@/components/Toaster';
import { ThemeApplier } from '@/components/ThemeApplier';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://twendezetu-platform-oufr.vercel.app';

export const metadata = {
  title: 'Twendezetu — Event Portal',
  description: 'Events, needs, providers, tickets, and masked community coordination for East Africa and the diaspora.',
  keywords: ['East Africa', 'event portal', 'nyama choma', 'diaspora', 'providers', 'Nairobi', 'Kampala', 'New Jersey'],
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Twendezetu — Gather anywhere.',
    description: 'Post events and needs, discover providers, RSVP, pay, and coordinate without exposing contacts.',
    type: 'website',
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
