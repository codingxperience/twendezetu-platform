'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Icon } from '@/components/Icon';
import { useMe, useBooking } from '@/lib/swr';
import { useStore } from '@/store';
import { api } from '@/lib/api-client';
import { fmtCurrency } from '@/lib/currency';

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const currency = useStore((s) => s.currency);
  const showToast = useStore((s) => s.showToast);
  const { user, isLoading: meLoading } = useMe();
  const { booking, isLoading, refresh } = useBooking(id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const msgRef = useRef(null);

  useEffect(() => {
    if (!meLoading && !user) router.push('/sign-in');
  }, [meLoading, user, router]);

  useEffect(() => {
    msgRef.current?.scrollTo?.(0, msgRef.current.scrollHeight);
  }, [booking?.messages?.length]);

  if (meLoading || isLoading) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: 80, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</main>
      </>
    );
  }
  if (!booking) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: '64px 20px', textAlign: 'center' }}>
          <h1 className="tz-h2" style={{ fontSize: 32 }}>Booking not found.</h1>
          <Link href="/dashboard" className="tz-btn tz-btn--primary" style={{ marginTop: 16 }}>Back to dashboard</Link>
        </main>
      </>
    );
  }

  const sendMessage = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/bookings/${id}/messages`, { body: draft });
      setDraft('');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel this booking? Up to 90 days before the event, the deposit is fully refundable.')) return;
    setCancelling(true);
    try {
      await api.patch(`/api/bookings/${id}`, { status: 'cancelled' });
      await refresh();
      showToast('Booking cancelled');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const v = booking.vendor;

  return (
    <>
      <Header />
      <main id="main" className="container" style={{ padding: '24px 20px 64px' }}>
        <div style={{ marginBottom: 18 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--tz-stone-700)', textDecoration: 'none' }}>← My events</Link>
        </div>

        <div className="booking-grid">
          <div>
            <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <h1 className="tz-h2" style={{ fontSize: 26, marginBottom: 4 }}>{v?.name}</h1>
              <div className="tz-meta">{v?.type} · {v?.city}, {v?.country}</div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, fontSize: 13.5 }}>
                <Cell label="Date" value={new Date(booking.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <Cell label="Guests" value={booking.guests} />
                <Cell label="Package" value={booking.package?.name} />
                <Cell label="Status" value={booking.status} />
              </div>
            </div>

            <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 16, padding: 20 }}>
              <h2 className="tz-h3" style={{ fontSize: 20, marginBottom: 14 }}>Messages with {v?.name}</h2>
              <div ref={msgRef} style={{ maxHeight: 360, overflowY: 'auto', padding: 12, background: 'var(--tz-cream-soft)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(booking.messages || []).length === 0 && <div className="tz-meta">No messages yet.</div>}
                {booking.messages?.map((m) => {
                  const mine = m.fromRole === 'customer';
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '78%',
                        background: mine ? 'var(--tz-forest-700)' : 'var(--tz-paper)',
                        color: mine ? 'white' : 'var(--tz-ink)',
                        border: mine ? 'none' : '1px solid var(--tz-border)',
                        borderRadius: 14, padding: '10px 14px', fontSize: 14, lineHeight: 1.4,
                      }}>
                        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                          {mine ? 'You' : (m.senderName || v?.name)} · {new Date(m.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>{m.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                style={{ marginTop: 12, display: 'flex', gap: 8 }}
              >
                <input
                  className="tz-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Send a message…"
                  style={{ flex: 1 }}
                />
                <button type="submit" disabled={!draft.trim() || sending} className="tz-btn tz-btn--primary">
                  {sending ? '…' : 'Send'}
                </button>
              </form>
            </div>
          </div>

          <aside>
            <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 100 }}>
              <div style={{ aspectRatio: '16/10' }}>
                <Photo src={v?.coverImage} alt={v?.name} ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
              </div>
              <div style={{ padding: 18 }}>
                <div className="tz-meta">Total</div>
                <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 26 }}>{fmtCurrency(booking.total, currency)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, fontSize: 13, color: 'var(--tz-stone-700)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{fmtCurrency(booking.subtotal, currency)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service fee</span><span>{fmtCurrency(booking.serviceFee, currency)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>VAT</span><span>{fmtCurrency(booking.vat, currency)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--tz-border-soft)', fontWeight: 600, color: 'var(--tz-forest-700)' }}><span>Deposit paid</span><span>{fmtCurrency(booking.depositAmount, currency)}</span></div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href={`/vendors/${v?.slug}`} className="tz-btn tz-btn--ghost" style={{ width: '100%' }}>View vendor</Link>
                  {booking.status !== 'cancelled' && (
                    <button onClick={cancel} disabled={cancelling} className="tz-btn tz-btn--ghost" style={{ width: '100%', color: 'var(--tz-stone-700)' }}>
                      {cancelling ? 'Cancelling…' : 'Cancel booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .booking-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .booking-grid { grid-template-columns: 1fr 360px; }
        }
      `}</style>
    </>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <div className="tz-meta" style={{ fontSize: 11 }}>{label}</div>
      <div style={{ marginTop: 2, fontWeight: 500, textTransform: 'capitalize' }}>{value?.toString().replace(/_/g, ' ')}</div>
    </div>
  );
}
