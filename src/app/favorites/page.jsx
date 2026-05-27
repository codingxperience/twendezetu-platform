'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VendorCard } from '@/components/VendorCard';
import { Icon } from '@/components/Icon';
import { useMe, useFavorites } from '@/lib/swr';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoading: meLoading } = useMe();
  const { favorites, isLoading } = useFavorites();

  useEffect(() => {
    if (!meLoading && !user) router.push('/sign-in?next=/favorites');
  }, [meLoading, user, router]);

  if (meLoading || !user) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: 80, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main" className="container" style={{ padding: '32px 20px 64px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 6 }}>Saved vendors</h1>
          <p className="tz-lead">Your shortlist, ready when you are.</p>
        </div>
        {isLoading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</div>
        ) : favorites.length === 0 ? (
          <div style={{ background: 'var(--tz-cream-soft)', border: '1px dashed var(--tz-border)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
            <Icon name="heart" size={32} color="var(--tz-stone-400)" />
            <h3 style={{ fontFamily: 'var(--tz-serif)', fontSize: 22, margin: '12px 0 6px' }}>No saved vendors yet.</h3>
            <p className="tz-meta" style={{ marginBottom: 18 }}>Tap the heart on any listing to save it for later.</p>
            <Link href="/browse" className="tz-btn tz-btn--primary">Browse vendors</Link>
          </div>
        ) : (
          <div className="vendor-grid">
            {favorites.map((v) => <VendorCard key={v.id} v={v} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
