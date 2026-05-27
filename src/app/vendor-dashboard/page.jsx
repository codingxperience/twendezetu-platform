'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { useMe, useBookings, useInquiries } from '@/lib/swr';
import { useStore, useHydrated } from '@/store';
import { fmtCurrency } from '@/lib/currency';

export default function VendorDashboard() {
  const router = useRouter();
  const hydrated = useHydrated();
  const currency = useStore((s) => s.currency);
  const { user, isLoading: meLoading } = useMe();
  const { bookings } = useBookings();
  const { inquiries } = useInquiries();

  useEffect(() => {
    if (!meLoading && !user) router.push('/sign-in?next=/vendor-dashboard');
    if (!meLoading && user && user.role !== 'vendor') router.push('/sign-up?role=vendor');
  }, [meLoading, user, router]);

  if (!hydrated || meLoading || !user) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: 80, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</main>
      </>
    );
  }

  if (!user.vendor) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: '64px 20px', maxWidth: 640 }}>
          <h1 className="tz-h2" style={{ fontSize: 32, marginBottom: 8 }}>Your vendor profile isn&apos;t set up yet.</h1>
          <p className="tz-lead" style={{ marginBottom: 24 }}>
            To list your service, our team will pair your account with a verified vendor profile. In the meantime, browse how other vendors present themselves.
          </p>
          <Link href="/browse" className="tz-btn tz-btn--primary">Browse marketplace</Link>
        </main>
        <Footer />
      </>
    );
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.total : 0), 0);
  const newInquiries = inquiries.filter((i) => i.isNew).length;
  const upcoming = bookings.filter((b) => new Date(b.eventDate) > new Date() && b.status !== 'cancelled');

  return (
    <>
      <Header />
      <main id="main" className="container" style={{ padding: '32px 20px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 6 }}>{user.vendor.name}</h1>
            <p className="tz-lead">Vendor dashboard · {user.city}</p>
          </div>
          <Link href={`/vendors/${user.vendor.slug}`} className="tz-btn tz-btn--ghost">View public listing</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          <Tile label="New inquiries" value={newInquiries} icon="bell" />
          <Tile label="Upcoming bookings" value={upcoming.length} icon="cal" />
          <Tile label="Total bookings" value={bookings.length} icon="check" />
          <Tile label="Revenue" value={fmtCurrency(totalRevenue, currency)} icon="bolt" />
        </div>

        <section style={{ marginBottom: 36 }}>
          <h2 className="tz-h3" style={{ fontSize: 22, marginBottom: 14 }}>Inquiries &amp; leads</h2>
          {inquiries.length === 0 ? (
            <div style={{ padding: 24, background: 'var(--tz-cream-soft)', borderRadius: 12, color: 'var(--tz-stone-500)', textAlign: 'center' }}>No inquiries yet.</div>
          ) : (
            <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, overflow: 'hidden' }}>
              {inquiries.map((i, idx) => (
                <div key={i.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto',
                  gap: 14,
                  padding: 16,
                  borderTop: idx === 0 ? 'none' : '1px solid var(--tz-border-soft)',
                  alignItems: 'center',
                  background: i.isNew ? 'rgba(217,122,59,0.04)' : 'transparent',
                }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tz-saffron-050)', color: 'var(--tz-saffron-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {i.customerName.charAt(0)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{i.customerName}</span>
                      {i.isNew && <span style={{ background: 'var(--tz-saffron-500)', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>New</span>}
                      <span className="tz-meta" style={{ fontSize: 11 }}>· {i.status}</span>
                    </div>
                    <div className="tz-meta" style={{ marginTop: 2 }}>{i.event} · {new Date(i.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  {i.bookingId ? (
                    <Link href={`/dashboard/bookings/${i.bookingId}`} className="tz-btn tz-btn--ghost tz-btn--sm">View booking</Link>
                  ) : (
                    <button className="tz-btn tz-btn--ghost tz-btn--sm">Reply</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="tz-h3" style={{ fontSize: 22, marginBottom: 14 }}>Confirmed bookings</h2>
          {bookings.length === 0 ? (
            <div style={{ padding: 24, background: 'var(--tz-cream-soft)', borderRadius: 12, color: 'var(--tz-stone-500)', textAlign: 'center' }}>No confirmed bookings yet.</div>
          ) : (
            <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, overflow: 'hidden' }}>
              {bookings.map((b, idx) => (
                <Link key={b.id} href={`/dashboard/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ padding: 16, borderTop: idx === 0 ? 'none' : '1px solid var(--tz-border-soft)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.customer?.name || b.contactName}</div>
                      <div className="tz-meta" style={{ marginTop: 2 }}>
                        {b.package?.name} · {b.guests} guests · {new Date(b.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{fmtCurrency(b.total, currency)}</div>
                      <div className="tz-meta" style={{ fontSize: 11 }}>{b.status.replace('_', ' ')}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function Tile({ label, value, icon }) {
  return (
    <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 14, padding: 18 }}>
      <Icon name={icon} size={18} color="var(--tz-saffron-700)" />
      <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 26, marginTop: 8 }}>{value}</div>
      <div className="tz-meta">{label}</div>
    </div>
  );
}
