import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Rating } from '@/components/Rating';
import { VendorCard } from '@/components/VendorCard';
import { Icon } from '@/components/Icon';
import { HeroStats } from '@/components/HeroStats';
import { CategoriesAndRegions } from '@/components/CategoriesAndRegions';
import { CurrencyAwarePrice } from '@/components/CurrencyAwarePrice';
import { prisma } from '@/lib/prisma';
import { serializeVendor } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getFeatured() {
  const vendors = await prisma.vendor.findMany({
    where: { published: true },
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
    orderBy: [{ superhost: 'desc' }, { rating: 'desc' }],
    take: 6,
  });
  return vendors.map(serializeVendor);
}

export default async function HomePage() {
  const featured = await getFeatured();
  const totalVendors = await prisma.vendor.count({ where: { published: true } });
  const avgRating = (await prisma.vendor.aggregate({ _avg: { rating: true } }))._avg.rating || 4.9;

  return (
    <>
      <Header />
      <main id="main">
        <section style={{ position: 'relative', padding: '40px 20px 56px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 80% 30%, rgba(217,122,59,0.13) 0%, transparent 60%), radial-gradient(50% 80% at 10% 80%, rgba(31,58,56,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative' }}>
            <div className="hero-grid">
              <div>
                <div className="tz-eyebrow" style={{ marginBottom: 16 }}>East Africa · est. 2026</div>
                <h1 className="tz-h1 hero-title">
                  Gather <em className="tz-italic" style={{ color: 'var(--tz-saffron-700)' }}>beautifully.</em>
                  <br />From Nairobi<br />to Kampala.
                </h1>
                <p className="tz-lead" style={{ maxWidth: 520, marginTop: 20, fontSize: 17 }}>
                  Twendezetu is East Africa&apos;s curated marketplace for venues, caterers, photographers, and event makers across Kenya, Uganda, Tanzania, and Rwanda.
                </p>
                <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link href="/browse" className="tz-btn tz-btn--primary tz-btn--lg">Browse vendors</Link>
                  <Link href="/sign-up" style={{ fontSize: 14, color: 'var(--tz-ink)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    Create an account <Icon name="arrow" size={12} color="var(--tz-saffron-500)" />
                  </Link>
                </div>
                <HeroStats vendors={totalVendors} avg={avgRating.toFixed(2)} />
              </div>
              <div className="hero-collage hide-mobile" style={{ position: 'relative', height: 460 }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '70%', height: '90%', borderRadius: 220, overflow: 'hidden', boxShadow: 'var(--sh-lg)' }}>
                  <Photo src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80" alt="Outdoor wedding setup" ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 20, left: 0, width: '50%', height: '58%', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--sh-md)', border: '6px solid var(--tz-paper)' }}>
                  <Photo src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80" alt="Kampala wedding" ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
                </div>
                <div style={{ position: 'absolute', top: 30, left: 40, width: 160, height: 160, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--sh-md)', border: '6px solid var(--tz-paper)' }}>
                  <Photo src="https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&q=80" alt="Décor" ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 80, right: 20, background: 'var(--tz-paper)', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-lg)', width: 220, border: '1px solid var(--tz-border)' }}>
                  <Rating value={4.97} />
                  <p style={{ fontFamily: 'var(--tz-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.35, margin: '8px 0 0', color: 'var(--tz-ink)' }}>
                    &ldquo;Mwalimu Studios captured Kampala like home.&rdquo;
                  </p>
                  <div className="tz-meta" style={{ marginTop: 8 }}>Faridah &amp; Joel · Kampala</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CategoriesAndRegions />

        <section style={{ padding: '48px 20px', background: 'var(--tz-paper)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="tz-eyebrow" style={{ marginBottom: 10 }}>Featured this season</div>
                <h2 className="tz-h2" style={{ fontSize: 32, maxWidth: 580 }}>Vendors we&apos;d book for our own families.</h2>
              </div>
              <Link href="/browse" style={{ fontSize: 14, color: 'var(--tz-ink)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Browse all <Icon name="arrow" size={12} />
              </Link>
            </div>
            <div className="vendor-grid">
              {featured.map((v) => <VendorCard key={v.id} v={v} />)}
            </div>
          </div>
        </section>

        <section style={{ padding: '56px 20px', background: 'var(--tz-paper)' }}>
          <div className="container">
            <div className="package-grid">
              <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5' }} className="hide-mobile">
                <Photo src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80" alt="Curated wedding" ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
              </div>
              <div>
                <div className="tz-eyebrow" style={{ marginBottom: 14 }}>Curated packages</div>
                <h2 className="tz-h2" style={{ fontSize: 32 }}>A wedding, fully arranged.<br />From <CurrencyAwarePrice kes={680000} />.</h2>
                <p className="tz-lead" style={{ marginTop: 16, maxWidth: 480 }}>
                  Choose a venue, and we&apos;ll pair it with vetted catering, décor, photography, and a bilingual MC. One contract. One payment plan. Three site visits included.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'grid', gap: 12, maxWidth: 460 }}>
                  {['One coordinator from booking to send-off', 'Multi-currency: KES, UGX, TZS, RWF', 'Cancel free up to 90 days before'].map((p) => (
                    <li key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: 'var(--tz-stone-800)' }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--tz-saffron-050)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tz-saffron-700)', flex: '0 0 auto' }}>
                        <Icon name="check" size={12} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <Link href="/browse?category=packages" className="tz-btn tz-btn--primary">See packages</Link>
                  <Link href="/about" className="tz-btn tz-btn--ghost">How it works</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--tz-forest-700)', color: 'var(--tz-cream-soft)', padding: '56px 20px' }}>
          <div className="container" style={{ maxWidth: 900, textAlign: 'center' }}>
            <Icon name="sparkle" size={22} color="var(--tz-saffron-500)" />
            <p style={{ fontFamily: 'var(--tz-serif)', fontSize: 28, lineHeight: 1.25, fontStyle: 'italic', margin: '20px 0', color: 'var(--tz-cream-soft)' }}>
              &ldquo;Twendezetu found us a coastal venue, a chef who knew our parents&apos; favourite pilau, and a photographer who shot like family. The day was effortless.&rdquo;
            </p>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Aisha &amp; Khalid · Diani Beach, October 2026</div>
          </div>
        </section>

        <section style={{ padding: '48px 20px', background: 'var(--tz-cream-soft)' }}>
          <div className="container" style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 24, padding: '36px 28px' }}>
            <div>
              <div className="tz-eyebrow" style={{ marginBottom: 12 }}>For vendors</div>
              <h2 className="tz-h2" style={{ fontSize: 28 }}>Run your studio. We&apos;ll bring the bookings.</h2>
              <p className="tz-lead" style={{ marginTop: 14, maxWidth: 540 }}>
                List your venue, kitchen, lens, or playlist. Manage leads, calendars, and confirmations from one dashboard.
              </p>
              <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/sign-up?role=vendor" className="tz-btn tz-btn--ink">List your service</Link>
                <Link href="/vendor-dashboard" className="tz-btn tz-btn--ghost">See dashboard</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
