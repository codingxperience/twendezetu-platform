import './globals.css';
import { Toaster } from '@/components/Toaster';
import { ThemeApplier } from '@/components/ThemeApplier';

export const metadata = {
  title: 'Twendezetu — Premium East African Event Marketplace',
  description: "East Africa's curated marketplace for venues, caterers, photographers, and event makers. Serving Kenya, Uganda, Tanzania, and Rwanda.",
  keywords: ['East Africa', 'wedding', 'event', 'venue', 'marketplace', 'Nairobi', 'Kampala', 'Kenya', 'Uganda'],
  metadataBase: new URL('https://codingxperience.github.io/twendezetu-platform/'),
  openGraph: {
    title: 'Twendezetu — Gather beautifully.',
    description: 'From Nairobi to Kampala to Kigali.',
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
