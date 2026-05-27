'use client';

import Link from 'next/link';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { CATEGORIES, REGIONS } from '@/lib/data';

export function CategoriesAndRegions() {
  return (
    <>
      <section style={{ padding: '32px 20px', background: 'var(--tz-paper)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
            <h2 className="tz-h3" style={{ fontSize: 24 }}>Explore by category</h2>
            <Link href="/browse" style={{ fontSize: 14, color: 'var(--tz-ink)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              See all <Icon name="arrow" size={12} />
            </Link>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/browse?category=${c.key}`}
                style={{
                  background: 'var(--tz-cream-soft)', border: '1px solid var(--tz-border-soft)', borderRadius: 14,
                  padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--tz-paper)', border: '1px solid var(--tz-border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tz-saffron-700)' }}>
                  <Icon name={c.icon} size={18} />
                </div>
                <div style={{ marginTop: 14, fontSize: 13.5, fontWeight: 600 }}>{c.label}</div>
                <div className="tz-meta" style={{ marginTop: 2, fontSize: 12 }}>{c.count} listings</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 20px', background: 'var(--tz-cream-soft)' }}>
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <div className="tz-eyebrow" style={{ marginBottom: 10 }}>Where to gather</div>
            <h2 className="tz-h2" style={{ fontSize: 32 }}>Eight cities. Four countries.</h2>
          </div>
          <div className="region-grid">
            {REGIONS.map((r) => (
              <Link
                key={r.city}
                href={`/browse?city=${encodeURIComponent(r.city)}`}
                style={{ position: 'relative', height: 220, borderRadius: 16, overflow: 'hidden', textDecoration: 'none', color: 'white' }}
              >
                <Photo src={r.img} alt={r.city} ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,15,10,0.7), rgba(20,15,10,0) 60%)' }} />
                <div style={{ position: 'absolute', left: 16, bottom: 16 }}>
                  <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 24, lineHeight: 1.1 }}>{r.city}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{r.country} · {r.venues} venues</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
