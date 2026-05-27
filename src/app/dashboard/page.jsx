'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Icon } from '@/components/Icon';
import { useMe, useBookings, useFavorites } from '@/lib/swr';
import { useStore, useHydrated } from '@/store';
import { fmtCurrency } from '@/lib/currency';

const STATUS_LABELS = {
  pending_payment: { label: 'Deposit pending', color: 'var(--tz-saffron-700)', bg: 'var(--tz-saffron-050)' },
  confirmed:       { label: 'Confirmed',       color: 'var(--tz-success)',     bg: 'rgba(56, 142, 60, 0.08)' },
  cancelled:       { label: 'Cancelled',       color: 'var(--tz-stone-500)',   bg: 'var(--tz-cream-soft)' },
  completed:       { label: 'Completed',       color: 'var(--tz-forest-700)',  bg: 'rgba(31, 58, 56, 0.08)' },
};

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const currency = useStore((s) => s.currency);
  const { user, isLoading: meLoading } = useMe();
  const { bookings, isLoading: bkLoading } = useBookings();
  const { favorites } = useFavorites();

  useEffect(() => {
    if (!meLoading && !user) router.push('/sign-in?next=/dashboard');
    if (!meLoading && user?.role === 'vendor') router.push('/vendor-dashboard');
  }, [meLoading, user, router]);

  if (!hydrated || meLoading || !user) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: 80, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</main>
      </>
    );
  }

  const upcoming = bookings.filter((b) => new Date(b.eventDate) > new Date() && b.status !== 'cancelled');
  const past = bookings.filter((b) => new Date(b.eventDate) <= new Date() || b.status === 'cancelled');

  return (
    <>
      <Header />
      <main id="main" className="container" style={{ padding: '32px 20px 64px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 6 }}>Karibu, {user.name.split(' ')[0]}.</h1>
          <p className="tz-lead">Your events, vendors, and saved ideas.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          <Tile label="Upcoming events" value={upcoming.length} icon="cal" />
          <Tile label="Saved vendors"   value={favorites.length} icon="heart" />
          <Tile label="Total bookings"  value={bookings.length} icon="check" />
          <Tile label="City"            value={user.city} icon="pin" />
        </div>

        <section style={{ marginBottom: 36 }}>
          <h2 className="tz-h3" style={{ fontSize: 22, marginBottom: 14 }}>Upcoming</h2>
          {bkLoading ? (
            <div style={{ padding: 32, color: 'var(--tz-stone-500)', textAlign: 'center' }}>Loading bookings…</div>
          ) : upcoming.length === 0 ? (
            <Empty
              title="No upcoming events yet."
              body="Browse the marketplace to find your venue, caterer, or photographer."
              cta={{ href: '/browse', label: 'Browse vendors' }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {upcoming.map((b) => <BookingCard key={b.id} b={b} currency={currency} />)}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="tz-h3" style={{ fontSize: 22, marginBottom: 14 }}>Past &amp; cancelled</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {past.map((b) => <BookingCard key={b.id} b={b} currency={currency} muted />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function Tile({ label, value, icon }) {
  return (
    <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, padding: 18 }}>
      <Icon name={icon} size={18} color="var(--tz-saffron-700)" />
      <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 28, marginTop: 8 }}>{value}</div>
      <div className="tz-meta">{label}</div>
    </div>
  );
}

function BookingCard({ b, currency, muted }) {
  const status = STATUS_LABELS[b.status] || STATUS_LABELS.confirmed;
  return (
    <Link href={`/dashboard/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, padding: 14, opacity: muted ? 0.7 : 1 }}>
        <div style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden' }}>
          <Photo src={b.vendor?.coverImage} alt="" ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{b.vendor?.name}</div>
          <div className="tz-meta">{b.vendor?.type} · {b.vendor?.city}, {b.vendor?.country}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 13, color: 'var(--tz-stone-700)', flexWrap: 'wrap' }}>
            <span><Icon name="cal" size={12} color="var(--tz-stone-500)" /> {new Date(b.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span><Icon name="users" size={12} color="var(--tz-stone-500)" /> {b.guests} guests</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', textAlign: 'right' }}>
          <span style={{ background: status.bg, color: status.color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
            {status.label}
          </span>
          <span style={{ fontWeight: 600 }}>{fmtCurrency(b.total, currency)}</span>
        </div>
      </div>
    </Link>
  );
}

function Empty({ title, body, cta }) {
  return (
    <div style={{ background: 'var(--tz-cream-soft)', border: '1px dashed var(--tz-border)', borderRadius: 16, padding: 36, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 20, marginBottom: 6 }}>{title}</div>
      <p className="tz-meta" style={{ marginBottom: 16 }}>{body}</p>
      {cta && <Link href={cta.href} className="tz-btn tz-btn--primary">{cta.label}</Link>}
    </div>
  );
}
