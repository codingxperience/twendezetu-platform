'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { useStore } from '@/store';
import { useMe } from '@/lib/swr';
import { api } from '@/lib/api-client';
import { mutate } from 'swr';

function SignInInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const showToast = useStore((s) => s.showToast);
  const { refresh } = useMe();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const next = sp.get('next') || '/dashboard';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api.post('/api/auth/sign-in', { email, password });
      await refresh();
      await mutate(() => true, undefined, { revalidate: true });
      showToast('Welcome back!');
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  const fillDemo = (e, pw) => {
    setEmail(e);
    setPassword(pw);
  };

  return (
    <>
      <Header minimal />
      <main id="main" style={{ minHeight: 'calc(100vh - 80px)', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 className="tz-h2" style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>Karibu back.</h1>
          <p className="tz-meta" style={{ textAlign: 'center', marginBottom: 28 }}>Sign in to continue planning.</p>

          <form onSubmit={onSubmit} className="tz-form">
            <label className="tz-field">
              <span className="tz-field__label">Email</span>
              <input
                type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="tz-input" placeholder="you@example.com"
              />
            </label>
            <label className="tz-field">
              <span className="tz-field__label">Password</span>
              <input
                type="password" autoComplete="current-password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="tz-input" placeholder="At least 8 characters"
              />
            </label>
            {error && <div className="tz-form__error">{error}</div>}
            <button type="submit" className="tz-btn tz-btn--primary" disabled={pending} style={{ width: '100%', height: 48 }}>
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--tz-stone-600)', margin: '12px 0 0' }}>
              New here? <Link href="/sign-up" style={{ color: 'var(--tz-ink)', fontWeight: 500 }}>Create an account</Link>
            </p>
          </form>

          <div style={{ marginTop: 32, padding: 18, background: 'var(--tz-cream-soft)', borderRadius: 14, border: '1px dashed var(--tz-border)' }}>
            <div className="tz-eyebrow" style={{ marginBottom: 10 }}>Demo accounts</div>
            <p className="tz-meta" style={{ marginBottom: 12 }}>Tap to autofill, then press Sign in.</p>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                ['wanjiku@demo.tz', 'demo1234', 'Wanjiku · Customer (Nairobi)'],
                ['david@demo.tz', 'demo1234', 'David · Customer (Kampala)'],
                ['aisha@demo.tz', 'demo1234', 'Aisha · Vendor (Kampala)'],
                ['mama@demo.tz', 'demo1234', 'Mama Wanjiru · Vendor (Nairobi)'],
              ].map(([e, p, label]) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => fillDemo(e, p)}
                  style={{ textAlign: 'left', padding: '10px 12px', background: 'var(--tz-paper)', border: '1px solid var(--tz-border-soft)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
                >
                  <div style={{ fontWeight: 500 }}>{label}</div>
                  <div style={{ color: 'var(--tz-stone-500)', fontSize: 12, marginTop: 2 }}>{e} · {p}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
