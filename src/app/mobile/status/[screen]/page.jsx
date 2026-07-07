import { notFound } from 'next/navigation';
import { MobileStatusAssets, mobileScreenIds } from '../../MobileShowcase';

export const metadata = {
  title: 'Twendezetu Mobile Status Export',
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  return mobileScreenIds.map((screen) => ({ screen }));
}

export default async function MobileStatusExportPage({ params }) {
  const { screen } = await params;

  if (!mobileScreenIds.includes(screen)) {
    notFound();
  }

  return <MobileStatusAssets screenId={screen} />;
}
