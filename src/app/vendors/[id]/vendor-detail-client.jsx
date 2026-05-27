'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Rating } from '@/components/Rating';
import { Icon } from '@/components/Icon';
import { useStore, useHydrated } from '@/store';
import { useMe, useFavorites } from '@/lib/swr';
import { api } from '@/lib/api-client';
import { fmtCurrency } from '@/lib/currency';

export function VendorDetailClient({ vendor: v }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const currency = useStore((s) => s.currency);
  const startBooking = useStore((s) => s.startBooking);
  const showToast = useStore((s) => s.showToast);
  const { user } = useMe();
  const { favorites, refresh: refreshFavorites } = useFavorites();
  const isFav = favorites.some((f) => f.id === v.id);

  const [selectedPackage, setSelectedPackage] = useState(v.packages?.find((p) => p.featured)?.id || v.packages?.[0]?.id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [favPending, setFavPending] = useState(false);

  const pkg = v.packages.find((p) => p.id === selectedPackage) || v.packages[0];
  const subtotal = pkg?.price || 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const vat = Math.round((subtotal + serviceFee) * 0.16);
  const total = subtotal + serviceFee + vat;

  const onBook = () => {
    if (!user) {
      showToast('Sign in to book this vendor', 'error');
      router.push(`/sign-in?next=/vendors/${v.slug}`);
      return;
    }
    startBooking({ vendorId: v.id, packageId: pkg.id, contactName: user.name });
    router.push(`/book/${v.slug}`);
  };

  const onFav = async () => {
    if (!user) { showToast('Sign in to save favorites', 'error'); return; }
    setFavPending(true);
    try {
      const r = await api.post('/api/favorites', { vendorId: v.id });
      await refreshFavorites();
      showToast(r.saved ? 'Saved' : 'Removed from saved');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFavPending(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main">
        <div className="container" style={{ padding: '20px 20px 0' }}>
          <div className="tz-meta" style={{ marginBottom: 14, fontSize: 12 }}>
            <Link href="/browse" style={{ color: 'inherit' }}>Browse</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href={`/browse?category=${v.category}`} style={{ color: 'inherit' }}>{v.type}</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: 'var(--tz-ink)' }}>{v.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 10 }}>{v.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 13.5, color: 'var(--tz-stone-700)' }}>
                <Rating value={v.rating} count={v.reviewsCount} />
                <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
                <span><Icon name="pin" size={13} color="var(--tz-stone-500)" /> {v.city}, {v.country}</span>
                {v.capacity && (<>
                  <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
                  <span>Capacity {v.capacity}</span>
                </>)}
                {v.host?.superhost && (<>
                  <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
                  <span style={{ color: 'var(--tz-success)', fontWeight: 500 }}>Superhost · {v.host.years} yrs</span>
                </>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="tz-btn tz-btn--ghost tz-btn--sm"
                onClick={() => {
                  if (navigator.share) navigator.share({ title: v.name, url: window.location.href }).catch(() => {});
                  else { navigator.clipboard.writeText(window.location.href); showToast('Link copied to share'); }
                }}
              >
                <Icon name="share" size={13} /> Share
              </button>
              <button className="tz-btn tz-btn--ghost tz-btn--sm" onClick={onFav} disabled={favPending} aria-pressed={isFav}>
                <Icon name="heart" size={13} color={hydrated && isFav ? 'var(--tz-clay)' : 'currentColor'} />
                {hydrated && isFav ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '0 20px' }}>
          <div className="gallery">
            <div className="gallery-main">
              <Photo src={v.gallery?.[activePhoto] || v.coverImage} alt={v.name} ratio="auto" style={{ height: '100%', aspectRatio: 'unset', borderRadius: 16 }} />
            </div>
            <div className="gallery-thumbs">
              {(v.gallery?.length ? v.gallery : [v.coverImage]).slice(0, 5).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Show photo ${i + 1}`}
                  style={{ padding: 0, border: 0, background: 'transparent', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', outline: i === activePhoto ? '2px solid var(--tz-ink)' : 'none', outlineOffset: 2 }}
                >
                  <Photo src={src} alt="" ratio="1/1" style={{ aspectRatio: '1/1' }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '36px 20px' }}>
          <div className="detail-grid">
            <div>
              <div style={{ borderBottom: '1px solid var(--tz-border)', paddingBottom: 28, marginBottom: 28 }}>
                <h2 className="tz-h3" style={{ fontSize: 26 }}>About this vendor</h2>
                <p className="tz-lead" style={{ marginTop: 12 }}>{v.description}</p>
                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  {[
                    ['shield', 'Twendezetu Verified', 'Background-checked & insured'],
                    ['leaf', v.tags?.includes('Outdoor') ? 'Outdoor + indoor' : 'Studio + on-location', v.highlights?.[0] || ''],
                    ['users', 'Hosted by ' + v.host?.name, `${v.host?.years || 5} years on Twendezetu`],
                  ].map(([ic, t, sub]) => (
                    <div key={t} style={{ display: 'flex', gap: 12 }}>
                      <Icon name={ic} size={20} color="var(--tz-forest-700)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t}</div>
                        <div className="tz-meta">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <h2 className="tz-h3" style={{ fontSize: 26 }}>Packages</h2>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {v.packages.map((p) => {
                    const isSel = p.id === selectedPackage;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPackage(p.id)}
                        style={{
                          textAlign: 'left', cursor: 'pointer',
                          border: isSel ? '2px solid var(--tz-forest-700)' : '1px solid var(--tz-border)',
                          borderRadius: 16, padding: 20,
                          background: isSel ? 'var(--tz-cream-soft)' : 'var(--tz-paper)',
                          position: 'relative', fontFamily: 'inherit',
                        }}
                      >
                        {p.featured && <div style={{ position: 'absolute', top: -10, left: 20, background: 'var(--tz-forest-700)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>Most booked</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ fontFamily: 'var(--tz-serif)', fontWeight: 400, fontSize: 22, margin: 0 }}>{p.name}</h3>
                            <div className="tz-meta" style={{ marginTop: 4 }}>{p.subtitle}</div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                              {p.includes.map((i) => (
                                <li key={i} style={{ fontSize: 12.5, display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--tz-stone-700)' }}>
                                  <Icon name="check" size={11} color="var(--tz-success)" /> {i}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                            <div className="tz-meta">From</div>
                            <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 24, color: 'var(--tz-ink)' }}>{hydrated ? fmtCurrency(p.price, currency) : fmtCurrency(p.price, 'KES')}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside>
              <div className="book-card">
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--tz-serif)', fontSize: 26 }}>{hydrated ? fmtCurrency(pkg.price, currency) : fmtCurrency(pkg.price, 'KES')}</span>
                  <span className="tz-meta">{pkg.name}</span>
                </div>
                <Rating value={v.rating} count={v.reviewsCount} />

                <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--tz-border)', borderRadius: 10, fontSize: 13 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.06, textTransform: 'uppercase', color: 'var(--tz-stone-600)' }}>Selected package</div>
                  <div style={{ marginTop: 4, fontWeight: 600 }}>{pkg.name}</div>
                  <div className="tz-meta" style={{ marginTop: 2 }}>{pkg.subtitle}</div>
                </div>

                <button onClick={onBook} className="tz-btn tz-btn--primary" style={{ width: '100%', marginTop: 14, height: 48 }}>
                  {hydrated && !user ? 'Sign in to book' : 'Request to book'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--tz-stone-500)', marginTop: 8 }}>You won&apos;t be charged yet</p>

                <div style={{ marginTop: 18, borderTop: '1px solid var(--tz-border-soft)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  {[
                    ['Package · ' + pkg.name, subtotal],
                    ['Service fee (5%)', serviceFee],
                    ['VAT (16%)', vat],
                  ].map(([k, val]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tz-stone-700)' }}>
                      <span>{k}</span><span>{hydrated ? fmtCurrency(val, currency) : fmtCurrency(val, 'KES')}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--tz-border-soft)', fontWeight: 600, color: 'var(--tz-ink)' }}>
                    <span>Total</span><span>{hydrated ? fmtCurrency(total, currency) : fmtCurrency(total, 'KES')}</span>
                  </div>
                </div>

                <div style={{ marginTop: 14, padding: 12, background: 'var(--tz-cream-soft)', borderRadius: 10, fontSize: 12, color: 'var(--tz-stone-700)', display: 'flex', gap: 8 }}>
                  <Icon name="shield" size={14} color="var(--tz-forest-700)" />
                  <span>Twendezetu Protect · pay 30% deposit, balance 14 days before. Free cancellation up to 90 days prior.</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .gallery {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .gallery-thumbs {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .book-card {
          background: var(--tz-paper);
          border: 1px solid var(--tz-border);
          border-radius: 18px;
          padding: 22px;
          box-shadow: var(--sh-md);
        }
        @media (min-width: 1024px) {
          .gallery {
            grid-template-columns: 1.4fr 1fr;
            height: 460px;
          }
          .gallery-thumbs {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 1fr;
            height: 100%;
          }
          .detail-grid {
            grid-template-columns: 1.5fr 1fr;
            gap: 48px;
          }
          .book-card { position: sticky; top: 100px; }
        }
      `}</style>
    </>
  );
}
