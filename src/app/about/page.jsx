import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'About Twendezetu' };

const STEPS = [
  ['Discover', 'Browse over 1,200 verified venues, caterers, photographers, planners, and entertainers across Kenya, Uganda, Tanzania, and Rwanda.'],
  ['Plan', 'Save favourites, compare packages, and chat directly with vendors before you book.'],
  ['Book', 'Pay a 30% deposit by card or M-Pesa. We hold it in escrow until your event is delivered.'],
  ['Celebrate', 'Settle the balance 14 days before. Show up. Gather beautifully.'],
];

const VALUES = [
  ['shield', 'Every vendor is verified', 'Background-checked, insurance-confirmed, and reviewed by real customers — not algorithms.'],
  ['leaf',   'Built for East Africa',    'Multi-currency, multi-language, with payment methods (M-Pesa, MTN MoMo, cards) that work where you live.'],
  ['users',  'Coordinator-supported',    'A real human, reachable on WhatsApp, supports every booking from inquiry to event day.'],
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--tz-cream-soft)' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="tz-eyebrow" style={{ marginBottom: 16 }}>About Twendezetu</div>
            <h1 className="tz-h1" style={{ fontSize: 48 }}>Gather beautifully — and easily.</h1>
            <p className="tz-lead" style={{ marginTop: 20, fontSize: 18 }}>
              Twendezetu is East Africa&apos;s curated marketplace for the people, places, and artisans who make every gathering unforgettable.
            </p>
          </div>
        </section>

        <section style={{ padding: '64px 20px', background: 'var(--tz-paper)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              {VALUES.map(([icon, t, d]) => (
                <div key={t} style={{ background: 'var(--tz-cream-soft)', borderRadius: 16, padding: 24, border: '1px solid var(--tz-border-soft)' }}>
                  <Icon name={icon} size={24} color="var(--tz-forest-700)" />
                  <h3 className="tz-h3" style={{ fontSize: 20, marginTop: 14 }}>{t}</h3>
                  <p style={{ marginTop: 8, fontSize: 14, color: 'var(--tz-stone-700)', lineHeight: 1.6 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '64px 20px', background: 'var(--tz-cream-soft)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'center' }}>
              <div>
                <div className="tz-eyebrow" style={{ marginBottom: 12 }}>How it works</div>
                <h2 className="tz-h2" style={{ fontSize: 32 }}>Four steps from idea to event day.</h2>
                <ol style={{ listStyle: 'none', padding: 0, marginTop: 28, display: 'grid', gap: 18 }}>
                  {STEPS.map(([t, d], i) => (
                    <li key={t} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 14, alignItems: 'flex-start' }}>
                      <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tz-forest-700)', color: 'white', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{t}</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--tz-stone-700)', fontSize: 14, lineHeight: 1.55 }}>{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--tz-forest-700)', color: 'var(--tz-cream-soft)' }}>
          <div className="container" style={{ maxWidth: 600 }}>
            <h2 className="tz-h2" style={{ fontSize: 28, color: 'var(--tz-cream-soft)' }}>Ready to plan?</h2>
            <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>
              Create an account and start saving vendors in under a minute.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sign-up" className="tz-btn tz-btn--primary tz-btn--lg">Create account</Link>
              <Link href="/browse" className="tz-btn tz-btn--ghost" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--tz-cream-soft)' }}>Browse vendors</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
