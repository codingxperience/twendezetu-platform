'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Photo } from '@/components/Photo';
import { Rating } from '@/components/Rating';
import { Icon } from '@/components/Icon';
import { useStore, useHydrated } from '@/store';
import { useMe } from '@/lib/swr';
import { api } from '@/lib/api-client';
import { fmtCurrency } from '@/lib/currency';
import { mutate } from 'swr';

const STEPS = [
  { id: 1, label: 'Event' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Pay' },
];

const ADDONS = [
  { id: 'photo',    label: 'Same-day photo highlights', price: 35000 },
  { id: 'cinema',   label: 'Cinematic 4K film',         price: 95000 },
  { id: 'bar',      label: 'Premium bar service',       price: 65000 },
  { id: 'mc',       label: 'Bilingual MC (EN/SW)',      price: 45000 },
];

export function BookingFlowClient({ vendor }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const showToast = useStore((s) => s.showToast);
  const draft = useStore((s) => s.bookingDraft);
  const updateDraft = useStore((s) => s.updateDraft);
  const startBooking = useStore((s) => s.startBooking);
  const clearDraft = useStore((s) => s.clearDraft);
  const currency = useStore((s) => s.currency);
  const { user, isLoading } = useMe();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // If the user navigated here directly (no draft) initialise from the
  // featured package so the flow never breaks.
  useEffect(() => {
    if (!draft || draft.vendorId !== vendor.id) {
      const pkg = vendor.packages.find((p) => p.featured) || vendor.packages[0];
      startBooking({ vendorId: vendor.id, packageId: pkg.id, contactName: user?.name });
    }
  }, [draft, vendor.id, vendor.packages, startBooking, user?.name]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) router.push(`/sign-in?next=/book/${vendor.slug}`);
  }, [isLoading, user, router, vendor.slug]);

  const pkg = vendor.packages.find((p) => p.id === draft?.packageId) || vendor.packages[0];
  const addOnTotal = (draft?.addOns || []).reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price || 0), 0);
  const subtotal = (pkg?.price || 0) + addOnTotal;
  const serviceFee = Math.round(subtotal * 0.05);
  const vat = Math.round((subtotal + serviceFee) * 0.16);
  const total = subtotal + serviceFee + vat;
  const deposit = Math.round(total * 0.30);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async () => {
    if (!draft) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/bookings', {
        vendorId: vendor.id,
        packageId: pkg.id,
        eventDate: draft.eventDate,
        guests: Number(draft.guests),
        contactName: draft.contactName,
        contactPhone: draft.contactPhone,
        notes: draft.notes,
        addOns: draft.addOns || [],
        currency,
      });
      // Stub-payment side-effect (becomes a real Stripe call if keys set)
      await api.post('/api/payments/intent', { bookingId: res.booking.id }).catch(() => {});
      await mutate('/api/bookings');
      clearDraft();
      showToast('Booking confirmed!');
      router.push(`/confirm/${res.booking.id}`);
    } catch (err) {
      showToast(err.message || 'Could not place booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || isLoading || !user) {
    return (
      <>
        <Header minimal />
        <main id="main" className="container" style={{ padding: 80, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</main>
      </>
    );
  }

  return (
    <>
      <Header minimal />
      <main id="main" className="container" style={{ padding: '24px 20px 64px' }}>
        <div style={{ marginBottom: 18 }}>
          <Link href={`/vendors/${vendor.slug}`} style={{ fontSize: 13, color: 'var(--tz-stone-700)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="chev" size={12} color="currentColor" style={{ transform: 'rotate(180deg)' }} /> Back to {vendor.name}
          </Link>
        </div>

        <Stepper step={step} />

        <div className="book-grid">
          <div>
            {step === 1 && <StepEvent draft={draft} updateDraft={updateDraft} vendor={vendor} pkg={pkg} />}
            {step === 2 && <StepContact draft={draft} updateDraft={updateDraft} />}
            {step === 3 && <StepReview draft={draft} vendor={vendor} pkg={pkg} addOnTotal={addOnTotal} />}
            {step === 4 && <StepPay draft={draft} deposit={deposit} total={total} />}

            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
              {step > 1 ? (
                <button onClick={back} className="tz-btn tz-btn--ghost">Back</button>
              ) : <span />}
              {step < 4 ? (
                <button
                  onClick={next}
                  disabled={!isStepValid(step, draft)}
                  className="tz-btn tz-btn--primary"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="tz-btn tz-btn--primary"
                  style={{ height: 48, minWidth: 200 }}
                >
                  {submitting ? 'Confirming…' : `Pay deposit · ${fmtCurrency(deposit, currency)}`}
                </button>
              )}
            </div>
          </div>

          <aside>
            <div className="summary-card">
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 14, aspectRatio: '16/10' }}>
                <Photo src={vendor.coverImage} alt={vendor.name} ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{vendor.name}</div>
              <div className="tz-meta">{vendor.type} · {vendor.city}, {vendor.country}</div>
              <Rating value={vendor.rating} count={vendor.reviewsCount} />

              <div style={{ marginTop: 18, padding: 14, background: 'var(--tz-cream-soft)', borderRadius: 10, fontSize: 13 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.06, textTransform: 'uppercase', color: 'var(--tz-stone-600)', marginBottom: 4 }}>Selected package</div>
                <div style={{ fontWeight: 600 }}>{pkg.name}</div>
                <div className="tz-meta">{pkg.subtitle}</div>
              </div>

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                {[
                  [pkg.name, pkg.price],
                  ...(draft?.addOns || []).map((id) => {
                    const a = ADDONS.find((x) => x.id === id);
                    return [a?.label, a?.price];
                  }).filter(([, p]) => p),
                  ['Service fee (5%)', serviceFee],
                  ['VAT (16%)', vat],
                ].map(([k, val], i) => (
                  <div key={k + i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tz-stone-700)' }}>
                    <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span>
                    <span>{fmtCurrency(val, currency)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--tz-border-soft)', fontWeight: 600, color: 'var(--tz-ink)', fontSize: 14 }}>
                  <span>Total</span><span>{fmtCurrency(total, currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tz-forest-700)', fontWeight: 600 }}>
                  <span>Due now (30% deposit)</span><span>{fmtCurrency(deposit, currency)}</span>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: 12, background: 'var(--tz-paper)', border: '1px solid var(--tz-border-soft)', borderRadius: 10, fontSize: 12, color: 'var(--tz-stone-700)', display: 'flex', gap: 8 }}>
                <Icon name="shield" size={14} color="var(--tz-forest-700)" />
                <span>Twendezetu Protect · balance due 14 days before event. Free cancellation up to 90 days prior.</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .book-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .summary-card {
          background: var(--tz-paper);
          border: 1px solid var(--tz-border);
          border-radius: 16px;
          padding: 18px;
          box-shadow: var(--sh-sm);
        }
        @media (min-width: 1024px) {
          .book-grid { grid-template-columns: 1fr 380px; }
          .summary-card { position: sticky; top: 100px; }
        }
      `}</style>
    </>
  );
}

function isStepValid(step, draft) {
  if (!draft) return false;
  if (step === 1) return !!draft.eventDate && Number(draft.guests) > 0;
  if (step === 2) return draft.contactName?.length >= 2 && draft.contactPhone?.length >= 6;
  return true;
}

function Stepper({ step }) {
  return (
    <div className="tz-stepper">
      {STEPS.map((s, i) => (
        <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`tz-stepper__dot ${step === s.id ? 'is-active' : step > s.id ? 'is-done' : ''}`}>
            {step > s.id ? <Icon name="check" size={12} /> : s.id}
          </span>
          <span className="tz-stepper__label">{s.label}</span>
          {i < STEPS.length - 1 && <span className="tz-stepper__line" />}
        </span>
      ))}
    </div>
  );
}

function StepEvent({ draft, updateDraft, vendor, pkg }) {
  return (
    <div className="tz-form">
      <h2 className="tz-h3" style={{ fontSize: 24, marginBottom: 4 }}>When is your event?</h2>
      <p className="tz-meta" style={{ marginBottom: 12 }}>{vendor.name} can be booked up to 12 months in advance.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <label className="tz-field">
          <span className="tz-field__label">Event date</span>
          <input
            className="tz-input"
            type="date"
            value={draft?.eventDate || ''}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => updateDraft({ eventDate: e.target.value })}
          />
        </label>
        <label className="tz-field">
          <span className="tz-field__label">Expected guests</span>
          <input
            className="tz-input"
            type="number"
            min={1}
            max={5000}
            value={draft?.guests || ''}
            onChange={(e) => updateDraft({ guests: Number(e.target.value) })}
          />
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <span className="tz-field__label" style={{ display: 'block', marginBottom: 8 }}>Choose a package</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vendor.packages.map((p) => {
            const sel = p.id === draft?.packageId;
            return (
              <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, border: sel ? '2px solid var(--tz-forest-700)' : '1px solid var(--tz-border)', borderRadius: 12, cursor: 'pointer', background: sel ? 'var(--tz-cream-soft)' : 'var(--tz-paper)' }}>
                <input
                  type="radio"
                  name="package"
                  checked={sel}
                  onChange={() => updateDraft({ packageId: p.id })}
                  style={{ marginTop: 4 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                  <div className="tz-meta">{p.subtitle}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{fmtCurrency(p.price)}</div>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <span className="tz-field__label" style={{ display: 'block', marginBottom: 8 }}>Add-ons (optional)</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ADDONS.map((a) => {
            const on = (draft?.addOns || []).includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  const cur = draft?.addOns || [];
                  updateDraft({ addOns: on ? cur.filter((x) => x !== a.id) : [...cur, a.id] });
                }}
                style={{
                  textAlign: 'left', padding: 12, borderRadius: 10, cursor: 'pointer',
                  background: on ? 'var(--tz-cream-soft)' : 'var(--tz-paper)',
                  border: on ? '1.5px solid var(--tz-forest-700)' : '1px solid var(--tz-border)',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.label}</div>
                <div className="tz-meta" style={{ marginTop: 2 }}>+ {fmtCurrency(a.price)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepContact({ draft, updateDraft }) {
  return (
    <div className="tz-form">
      <h2 className="tz-h3" style={{ fontSize: 24, marginBottom: 4 }}>Who is hosting?</h2>
      <p className="tz-meta" style={{ marginBottom: 12 }}>The vendor coordinator will use these details to reach you.</p>
      <label className="tz-field">
        <span className="tz-field__label">Full name</span>
        <input className="tz-input" required minLength={2} value={draft?.contactName || ''} onChange={(e) => updateDraft({ contactName: e.target.value })} />
      </label>
      <label className="tz-field">
        <span className="tz-field__label">Phone (WhatsApp preferred)</span>
        <input className="tz-input" required value={draft?.contactPhone || ''} onChange={(e) => updateDraft({ contactPhone: e.target.value })} placeholder="+254 720 ..." />
      </label>
      <label className="tz-field">
        <span className="tz-field__label">Notes for the vendor (optional)</span>
        <textarea className="tz-textarea" value={draft?.notes || ''} onChange={(e) => updateDraft({ notes: e.target.value })} placeholder="Anything we should know — accessibility, dietary, dress code…" />
      </label>
    </div>
  );
}

function StepReview({ draft, vendor, pkg }) {
  return (
    <div>
      <h2 className="tz-h3" style={{ fontSize: 24, marginBottom: 16 }}>Review your booking</h2>
      <div style={{ background: 'var(--tz-cream-soft)', border: '1px solid var(--tz-border-soft)', borderRadius: 12, padding: 18 }}>
        <Row label="Vendor" value={vendor.name} />
        <Row label="Package" value={pkg.name} />
        <Row label="Event date" value={new Date(draft.eventDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
        <Row label="Guests" value={draft.guests} />
        <Row label="Contact" value={`${draft.contactName} · ${draft.contactPhone}`} />
        {draft.notes && <Row label="Notes" value={draft.notes} />}
        {draft.addOns?.length > 0 && (
          <Row label="Add-ons" value={draft.addOns.map((id) => ADDONS.find((a) => a.id === id)?.label).filter(Boolean).join(', ')} />
        )}
      </div>
      <p className="tz-meta" style={{ marginTop: 16 }}>Continue to payment to secure your date with a 30% deposit.</p>
    </div>
  );
}

function StepPay({ draft, deposit, total }) {
  const currency = useStore((s) => s.currency);
  const [method, setMethod] = useState('card');
  return (
    <div>
      <h2 className="tz-h3" style={{ fontSize: 24, marginBottom: 4 }}>Pay deposit · secure your date</h2>
      <p className="tz-meta" style={{ marginBottom: 16 }}>
        We&apos;ll charge {fmtCurrency(deposit, currency)} now (30% of {fmtCurrency(total, currency)}). The balance is due 14 days before the event.
      </p>

      <div className="tz-segmented" style={{ marginBottom: 18 }}>
        <button type="button" onClick={() => setMethod('card')} className={`tz-segmented__item ${method === 'card' ? 'is-active' : ''}`}>
          <Icon name="shield" size={12} /> Card (Stripe)
        </button>
        <button type="button" onClick={() => setMethod('mpesa')} className={`tz-segmented__item ${method === 'mpesa' ? 'is-active' : ''}`}>
          M-Pesa
        </button>
      </div>

      {method === 'card' ? (
        <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 12, padding: 18 }}>
          <p className="tz-meta" style={{ marginBottom: 12 }}>Use Stripe&apos;s test card while in development:</p>
          <div style={{ fontFamily: 'var(--tz-mono)', fontSize: 13, background: 'var(--tz-cream-soft)', padding: 12, borderRadius: 8 }}>
            4242 4242 4242 4242 · 12/34 · CVC 123
          </div>
          <p className="tz-meta" style={{ marginTop: 12 }}>
            Without Stripe keys configured, the deposit is recorded as &apos;paid&apos; in mock mode (no real money moves).
            See the README for going live with Stripe keys.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 12, padding: 18 }}>
          <p className="tz-meta">An STK push will be sent to your phone. Approve on your handset to complete payment.</p>
          <p className="tz-meta" style={{ marginTop: 8, fontStyle: 'italic' }}>M-Pesa integration scaffolded — connect Daraja API credentials to enable in production.</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--tz-border-soft)', fontSize: 14, gap: 12 }}>
      <span style={{ color: 'var(--tz-stone-600)' }}>{label}</span>
      <span style={{ color: 'var(--tz-ink)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
