import Link from 'next/link';

export const metadata = { title: 'Not found — Twendezetu', robots: { index: false } };

const mono = { fontFamily: 'var(--tz-mono)', fontSize: 12, letterSpacing: '0.08em' };

// Shown for addresses that do not exist and for private pages (someone
// else's event, case or order) that answer as if they did not.
export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: '#F7F1E6', color: '#14201F', fontFamily: 'var(--tz-sans)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 24px', borderBottom: '2px solid #1F3A38' }}>
        <Link href="/" className="tz-logo-link" aria-label="Twendezetu home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Twendezetu" width={1211} height={229} className="tz-logo tz-logo--md" />
        </Link>
      </header>
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ ...mono, color: '#A85A23' }}>[404 · Hatukuipata]</div>
          <h1 style={{ fontFamily: 'var(--tz-display)', fontSize: 'clamp(40px, 8vw, 84px)', textTransform: 'uppercase', lineHeight: 0.92, margin: '12px 0 16px' }}>
            This page took another road<span style={{ color: '#D97A3B' }}>.</span>
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#3A2F25', margin: '0 0 28px' }}>
            The link may be old, the post may have been taken down, or it belongs to an account you are not signed in to.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontFamily: 'var(--tz-display)', fontSize: 16, textTransform: 'uppercase', background: '#D97A3B', color: '#14201F', border: '2px solid #1F3A38', padding: '14px 24px', textDecoration: 'none', boxShadow: '4px 4px 0 #1F3A38' }}>
              Find events →
            </Link>
            <Link href="/vendors" style={{ ...mono, border: '2px solid #1F3A38', color: '#14201F', padding: '14px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              BROWSE VENDORS
            </Link>
            <Link href="/my-twende" style={{ ...mono, border: '2px solid #1F3A38', color: '#14201F', padding: '14px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              MY TWENDE
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
