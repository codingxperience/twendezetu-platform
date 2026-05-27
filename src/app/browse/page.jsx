'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VendorCard } from '@/components/VendorCard';
import { Icon } from '@/components/Icon';
import { useVendors } from '@/lib/swr';
import { CATEGORIES } from '@/lib/data';

function BrowseInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const categoryParam = sp.get('category') || '';
  const cityParam = sp.get('city') || '';
  const queryParam = sp.get('q') || '';
  const sortParam = sp.get('sort') || 'recommended';

  const [query, setQuery] = useState(queryParam);
  useEffect(() => { setQuery(queryParam); }, [queryParam]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v); else next.delete(k);
    router.push(`/browse?${next.toString()}`, { scroll: false });
  };

  const { vendors, isLoading } = useVendors({
    category: categoryParam,
    city: cityParam,
    q: queryParam,
    sort: sortParam,
  });

  const activeCategory = CATEGORIES.find((c) => c.key === categoryParam);
  const cities = ['Nairobi', 'Kampala', 'Mombasa', 'Entebbe', 'Dar es Salaam', 'Kigali'];

  return (
    <>
      <Header />
      <main id="main">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--tz-border-soft)', background: 'var(--tz-cream-soft)' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <form
              onSubmit={(e) => { e.preventDefault(); setParam('q', query); }}
              style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--tz-paper)', borderRadius: 999, padding: 4, border: '1px solid var(--tz-border)', boxShadow: 'var(--sh-sm)', maxWidth: 720 }}
            >
              <Icon name="search" size={16} color="var(--tz-stone-500)" style={{ marginLeft: 14 }} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vendors, cities, or styles…"
                style={{ flex: 1, border: 0, outline: 0, padding: '12px 8px', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }}
              />
              <button type="submit" className="tz-btn tz-btn--primary tz-btn--sm" style={{ borderRadius: 999 }}>Search</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div className="tz-scroll-x" style={{ flex: 1, minWidth: 0 }}>
                <button className={`tz-chip ${!categoryParam ? 'tz-chip--active' : ''}`} onClick={() => setParam('category', '')}>All</button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    className={`tz-chip ${categoryParam === c.key ? 'tz-chip--active' : ''}`}
                    onClick={() => setParam('category', c.key)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={cityParam} onChange={(e) => setParam('city', e.target.value)} className="tz-select" style={{ height: 36, padding: '0 30px 0 12px', fontSize: 13 }} aria-label="Filter by city">
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={sortParam} onChange={(e) => setParam('sort', e.target.value === 'recommended' ? '' : e.target.value)} className="tz-select" style={{ height: 36, padding: '0 30px 0 12px', fontSize: 13 }} aria-label="Sort">
                  <option value="recommended">Recommended</option>
                  <option value="rating">Top rated</option>
                  <option value="priceAsc">Price: low to high</option>
                  <option value="priceDesc">Price: high to low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '24px 20px 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <h1 className="tz-h3" style={{ fontSize: 22 }}>
              {activeCategory?.label || (cityParam ? `Vendors in ${cityParam}` : 'All vendors')}{' '}
              <span style={{ color: 'var(--tz-stone-500)', fontFamily: 'var(--tz-sans)', fontWeight: 400, fontSize: 14 }}>· {vendors.length} {vendors.length === 1 ? 'result' : 'results'}</span>
            </h1>
            {(categoryParam || cityParam || queryParam) && (
              <button onClick={() => router.push('/browse')} style={{ background: 'transparent', border: 0, color: 'var(--tz-stone-700)', textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}>
                Clear filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading vendors…</div>
          ) : vendors.length === 0 ? (
            <div style={{ background: 'var(--tz-cream-soft)', border: '1px dashed var(--tz-border)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
              <Icon name="search" size={32} color="var(--tz-stone-400)" />
              <h3 style={{ fontFamily: 'var(--tz-serif)', fontSize: 22, margin: '12px 0 6px' }}>No vendors match those filters.</h3>
              <p className="tz-meta">Try clearing a filter or searching in a different city.</p>
            </div>
          ) : (
            <div className="vendor-grid">
              {vendors.map((v) => <VendorCard key={v.id} v={v} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>
      <BrowseInner />
    </Suspense>
  );
}
