'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useStore } from '@/store';
import { useMe } from '@/lib/swr';
import { api } from '@/lib/api-client';
import { mutate } from 'swr';

const CITIES = ['Nairobi', 'Mombasa', 'Kampala', 'Entebbe', 'Jinja', 'Dar es Salaam', 'Arusha', 'Kigali'];

function SignUpInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh } = useMe();
  const showToast = useStore((s) => s.showToast);

  const initialRole = sp.get('role') === 'vendor' ? 'vendor' : 'customer';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [role, setRole] = useState(initialRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api.post('/api/auth/sign-up', { name, email, password, city, role });
      await refresh();
      await mutate(() => true, undefined, { revalidate: true });
      showToast('Account created — karibu!');
      router.push(role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Header minimal />
      <main id="main" style={{ minHeight: 'calc(100vh - 80px)', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <h1 className="tz-h2" style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>Plan with us.</h1>
          <p className="tz-meta" style={{ textAlign: 'center', marginBottom: 28 }}>Create an account to save vendors, book, and message.</p>

          <div className="tz-segmented" role="tablist" style={{ marginBottom: 20 }}>
            <button type="button" onClick={() => setRole('customer')} className={`tz-segmented__item ${role === 'customer' ? 'is-active' : ''}`}>
              I&apos;m planning an event
            </button>
            <button type="button" onClick={() => setRole('vendor')} className={`tz-segmented__item ${role === 'vendor' ? 'is-active' : ''}`}>
              I&apos;m a vendor
            </button>
          </div>

          <form onSubmit={onSubmit} className="tz-form">
            <label className="tz-field">
              <span className="tz-field__label">Your name</span>
              <input className="tz-input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Wanjiku Kariuki" />
            </label>
            <label className="tz-field">
              <span className="tz-field__label">Email</span>
              <input className="tz-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </label>
            <label className="tz-field">
              <span className="tz-field__label">Password</span>
              <input className="tz-input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            </label>
            <label className="tz-field">
              <span className="tz-field__label">City</span>
              <select className="tz-select" value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            {error && <div className="tz-form__error">{error}</div>}
            <button type="submit" className="tz-btn tz-btn--primary" disabled={pending} style={{ width: '100%', height: 48 }}>
              {pending ? 'Creating account…' : 'Create account'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--tz-stone-600)', margin: '12px 0 0' }}>
              Already with us? <Link href="/sign-in" style={{ color: 'var(--tz-ink)', fontWeight: 500 }}>Sign in</Link>
            </p>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--tz-stone-500)', marginTop: 18 }}>
              By creating an account you agree to our <Link href="/about" style={{ color: 'inherit' }}>Terms</Link> and <Link href="/about" style={{ color: 'inherit' }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>
      <SignUpInner />
    </Suspense>
  );
}
