'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Icon } from '@/components/Icon';
import { useStore, useHydrated } from '@/store';
import { fmtCurrency } from '@/lib/currency';

export function ConfirmClient({ booking }) {
  const currency = useStore((s) => s.currency);
  const hydrated = useHydrated();
  const v = booking.vendor;

  return (
    <>
      <Header />
      <main id="main" className="container" style={{ padding: '40px 20px 64px', maxWidth: 720 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--tz-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="check" size={28} />
          </div>
          <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 6 }}>Karibu — you&apos;re booked!</h1>
          <p className="tz-lead">A confirmation email is on its way. {v?.name} will reach out within 24 hours.</p>
        </div>

        <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ aspectRatio: '16/9' }}>
            <Photo src={v?.coverImage} alt={v?.name} ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
          </div>
          <div style={{ padding: 20 }}>
            <h2 className="tz-h3" style={{ fontSize: 22 }}>{v?.name}</h2>
            <div className="tz-meta">{v?.type} · {v?.city}, {v?.country}</div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13.5 }}>
              <Cell label="Event date" value={new Date(booking.eventDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} />
              <Cell label="Guests" value={booking.guests} />
              <Cell label="Package" value={booking.package?.name} />
              <Cell label="Booking ID" value={booking.id.slice(-8)} />
            </div>

            <div style={{ marginTop: 18, padding: 14, background: 'var(--tz-cream-soft)', borderRadius: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--tz-stone-700)' }}>Deposit paid</span>
                <span style={{ fontWeight: 600 }}>{hydrated ? fmtCurrency(booking.depositAmount, currency) : fmtCurrency(booking.depositAmount, 'KES')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--tz-stone-700)' }}>Balance due 14 days before event</span>
                <span style={{ fontWeight: 600 }}>{hydrated ? fmtCurrency(booking.total - booking.depositAmount, currency) : fmtCurrency(booking.total - booking.depositAmount, 'KES')}</span>
              </div>
            </div>
          </div>
        </div>

        {booking.messages?.length > 0 && (
          <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Icon name="msg" size={16} color="var(--tz-forest-700)" />
              <div style={{ fontWeight: 600 }}>Latest message from {v?.name}</div>
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--tz-ink)', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
              &ldquo;{booking.messages[booking.messages.length - 1].body}&rdquo;
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/dashboard/bookings/${booking.id}`} className="tz-btn tz-btn--primary">View booking</Link>
          <Link href="/dashboard" className="tz-btn tz-btn--ghost">My events</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Cell({ label, value }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--tz-border-soft)' }}>
      <div className="tz-meta" style={{ fontSize: 11 }}>{label}</div>
      <div style={{ marginTop: 2, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
