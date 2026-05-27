'use client';

import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { Icon } from './Icon';

const COLS = [
  ['Discover', [['Venues', '/browse?category=venues'], ['Caterers', '/browse?category=catering'], ['Photographers', '/browse?category=photo'], ['Décor', '/browse?category=decor'], ['DJs', '/browse?category=djs'], ['MCs & planners', '/browse?category=mcs']]],
  ['Regions',  [['Nairobi', '/browse?city=Nairobi'], ['Kampala', '/browse?city=Kampala'], ['Mombasa', '/browse?city=Mombasa'], ['Entebbe', '/browse?city=Entebbe'], ['Dar es Salaam', '/browse?city=Dar%20es%20Salaam'], ['Kigali', '/browse?city=Kigali']]],
  ['For vendors', [['List your service', '/vendor-dashboard'], ['Vendor dashboard', '/vendor-dashboard'], ['Pricing', '/about']]],
  ['Company',  [['About', '/about'], ['Trust & safety', '/about'], ['Contact', '/about']]],
];

export function Footer() {
  return (
    <footer style={{ background: 'var(--tz-forest-700)', color: 'var(--tz-cream-soft)', padding: '48px 20px 24px', position: 'relative', overflow: 'hidden', marginTop: 64 }}>
      <div style={{ position: 'absolute', right: -120, bottom: -180, fontFamily: 'var(--tz-serif)', fontSize: 320, lineHeight: 1, color: 'rgba(255,255,255,0.04)', fontStyle: 'italic', userSelect: 'none', pointerEvents: 'none' }} className="hide-mobile">twendezetu</div>
      <div className="container" style={{ position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr repeat(4, 1fr)',
          gap: 32,
          paddingBottom: 32,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }} className="footer-grid">
          <div>
            <Wordmark size={26} color="var(--tz-cream-soft)" />
            <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: 280 }}>
              East Africa's curated marketplace for venues, caterers, and the artists who make every gathering unforgettable.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a href="#" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tz-cream-soft)' }}>
                <Icon name="instagram" size={14} />
              </a>
              <a href="#" aria-label="WhatsApp" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tz-cream-soft)' }}>
                <Icon name="whatsapp" size={14} />
              </a>
            </div>
          </div>
          {COLS.map(([title, items]) => (
            <div key={title}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.06, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>{title}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14 }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', gap: 12 }}>
          <span>© 2026 Twendezetu Ltd. · Nairobi · Kampala · Dar es Salaam · Kigali</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
          </span>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.footer-grid) {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
