'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Icon } from '@/components/Icon';
import { useMe, useBookings } from '@/lib/swr';

export default function InboxPage() {
  const router = useRouter();
  const { user, isLoading: meLoading } = useMe();
  const { bookings, isLoading } = useBookings();

  useEffect(() => {
    if (!meLoading && !user) router.push('/sign-in?next=/inbox');
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
        <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 24 }}>Inbox</h1>
        {isLoading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</div>
        ) : bookings.length === 0 ? (
          <div style={{ background: 'var(--tz-cream-soft)', border: '1px dashed var(--tz-border)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
            <Icon name="msg" size={32} color="var(--tz-stone-400)" />
            <h3 style={{ fontFamily: 'var(--tz-serif)', fontSize: 22, margin: '12px 0 6px' }}>No conversations yet.</h3>
            <p className="tz-meta">Book a vendor and your messages will appear here.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, overflow: 'hidden' }}>
            {bookings.map((b, idx) => {
              const last = b.messages?.[b.messages.length - 1];
              return (
                <Link key={b.id} href={`/dashboard/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 14, padding: 16, borderTop: idx === 0 ? 'none' : '1px solid var(--tz-border-soft)', alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden' }}>
                      <Photo src={b.vendor?.coverImage} alt="" ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{b.vendor?.name}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--tz-stone-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {last ? (last.fromRole === 'customer' ? 'You: ' : '') + last.body : 'No messages yet'}
                      </div>
                    </div>
                    <div className="tz-meta" style={{ fontSize: 11 }}>
                      {last ? new Date(last.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
