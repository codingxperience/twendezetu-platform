'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { useMe } from '@/lib/swr';
import { useStore } from '@/store';
import { api } from '@/lib/api-client';
import { mutate } from 'swr';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, refresh } = useMe();
  const currency = useStore((s) => s.currency);
  const language = useStore((s) => s.language);
  const theme = useStore((s) => s.theme);
  const setLocale = useStore((s) => s.setLocale);
  const showToast = useStore((s) => s.showToast);

  useEffect(() => {
    if (!isLoading && !user) router.push('/sign-in?next=/account');
  }, [isLoading, user, router]);

  const signOut = async () => {
    await api.post('/api/auth/sign-out');
    await refresh();
    await mutate(() => true, undefined, { revalidate: true });
    showToast('Signed out');
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: 80, textAlign: 'center', color: 'var(--tz-stone-500)' }}>Loading…</main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main" className="container" style={{ padding: '32px 20px 64px', maxWidth: 720 }}>
        <h1 className="tz-h1" style={{ fontSize: 36, marginBottom: 32 }}>Account</h1>

        <Section title="Profile">
          <Row k="Name" v={user.name} />
          <Row k="Email" v={user.email} />
          <Row k="City" v={user.city} />
          <Row k="Role" v={user.role} />
        </Section>

        <Section title="Preferences">
          <div className="tz-field">
            <span className="tz-field__label">Currency</span>
            <select className="tz-select" value={currency} onChange={(e) => setLocale({ currency: e.target.value })}>
              <option value="KES">Kenyan Shilling (KSh)</option>
              <option value="UGX">Ugandan Shilling (USh)</option>
              <option value="TZS">Tanzanian Shilling (TSh)</option>
              <option value="RWF">Rwandan Franc (RWF)</option>
            </select>
          </div>
          <div className="tz-field" style={{ marginTop: 16 }}>
            <span className="tz-field__label">Language</span>
            <select className="tz-select" value={language} onChange={(e) => setLocale({ language: e.target.value })}>
              <option value="en-sw">English + Kiswahili</option>
              <option value="en">English only</option>
            </select>
          </div>
          <div className="tz-field" style={{ marginTop: 16 }}>
            <span className="tz-field__label">Colour theme</span>
            <div className="tz-segmented">
              {['savanna', 'coast', 'highlands'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLocale({ theme: t })}
                  className={`tz-segmented__item ${theme === t ? 'is-active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >{t}</button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Account actions">
          <button onClick={signOut} className="tz-btn tz-btn--ghost" style={{ width: '100%' }}>
            <Icon name="ext" size={14} /> Sign out
          </button>
          <p className="tz-meta" style={{ marginTop: 14, fontSize: 12 }}>
            Need to delete your account or export your data? <Link href="/about" style={{ color: 'inherit' }}>Contact us</Link>.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <h2 className="tz-h3" style={{ fontSize: 18, marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--tz-border-soft)', fontSize: 14 }}>
      <span style={{ color: 'var(--tz-stone-600)' }}>{k}</span>
      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
    </div>
  );
}
