'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Wordmark } from './Wordmark';
import { Icon } from './Icon';
import { useStore, useHydrated } from '@/store';
import { useMe } from '@/lib/swr';
import { api } from '@/lib/api-client';
import { mutate } from 'swr';

const NAV = [
  { href: '/browse', label: 'Browse' },
  { href: '/browse?category=venues', label: 'Venues' },
  { href: '/browse?category=catering', label: 'Catering' },
  { href: '/browse?category=photo', label: 'Photography' },
  { href: '/about', label: 'About' },
];

export function Header({ minimal = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, refresh } = useMe();
  const currency = useStore((s) => s.currency);
  const language = useStore((s) => s.language);
  const setLocale = useStore((s) => s.setLocale);

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const off = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, []);

  const handleSignOut = async () => {
    await api.post('/api/auth/sign-out');
    await refresh();
    await mutate(() => true, undefined, { revalidate: true });
    setUserMenuOpen(false);
    router.push('/');
  };

  const greet = language === 'en-sw' ? 'Karibu' : 'Welcome';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(251,246,236,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--tz-border)' }}>
      <div style={{ borderBottom: '1px solid var(--tz-border-soft)', background: 'var(--tz-cream)' }} className="hide-mobile">
        <div className="container" style={{ padding: '8px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--tz-stone-600)' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="pin" size={12} color="var(--tz-saffron-700)" />
              {user?.city || 'Nairobi & Kampala'}
            </span>
            <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
            <span>Vendors serving Kenya, Uganda, Tanzania &amp; Rwanda</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>{hydrated ? `${greet} · ${currency}` : ''}</span>
            <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
            <button
              onClick={() => {
                const next = { KES: 'UGX', UGX: 'TZS', TZS: 'RWF', RWF: 'KES' }[currency];
                setLocale({ currency: next });
              }}
              style={{ background: 'transparent', border: 0, color: 'var(--tz-stone-600)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            >
              Change currency
            </button>
            <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
            <button
              onClick={() => setLocale({ language: language === 'en' ? 'en-sw' : 'en' })}
              style={{ background: 'transparent', border: 0, color: 'var(--tz-stone-600)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            >
              {language === 'en' ? 'EN' : 'EN/SW'}
            </button>
            <span style={{ color: 'var(--tz-stone-400)' }}>·</span>
            <Link href="/vendor-dashboard" style={{ color: 'var(--tz-stone-600)', textDecoration: 'none' }}>List your service</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Wordmark size={24} />
          </Link>
          {!minimal && (
            <nav className="hide-mobile" style={{ display: 'flex', gap: 24 }}>
              {NAV.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href.split('?')[0]);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--tz-ink)' : 'var(--tz-stone-600)',
                      paddingBottom: 4,
                      borderBottom: active ? '1.5px solid var(--tz-accent)' : '1.5px solid transparent',
                    }}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!minimal && hydrated && user && (
            <Link href="/favorites" className="tz-btn tz-btn--ghost tz-btn--sm hide-mobile" aria-label="Favorites">
              <Icon name="heart" size={14} /> Saved
            </Link>
          )}
          {hydrated && user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px 6px 14px', height: 40, borderRadius: 999,
                  background: 'var(--tz-paper)', border: '1px solid var(--tz-border)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}
                aria-expanded={userMenuOpen}
              >
                <Icon name="menu" size={14} />
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--tz-saffron-500)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600,
                }}>{user.name?.[0] || 'U'}</span>
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--tz-paper)', border: '1px solid var(--tz-border)', borderRadius: 12,
                  boxShadow: 'var(--sh-md)', minWidth: 220, padding: 6, zIndex: 60,
                }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--tz-border-soft)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--tz-stone-500)' }}>{user.email}</div>
                  </div>
                  {[
                    user.role === 'vendor'
                      ? ['/vendor-dashboard', 'Vendor dashboard']
                      : ['/dashboard', 'My events'],
                    ['/favorites', 'Saved'],
                    ['/inbox', 'Inbox'],
                    ['/account', 'Account'],
                  ].map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 12px', fontSize: 13.5, color: 'var(--tz-ink)', textDecoration: 'none', borderRadius: 8 }}
                    >
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--tz-border-soft)', marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={handleSignOut}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 13.5, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--tz-stone-700)', borderRadius: 8 }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : hydrated ? (
            <>
              <Link href="/sign-in" className="tz-btn tz-btn--ghost tz-btn--sm">Sign in</Link>
              <Link href="/sign-up" className="tz-btn tz-btn--primary tz-btn--sm">Plan an event</Link>
            </>
          ) : null}
          {!minimal && (
            <button
              className="hide-desktop"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open menu"
              style={{ background: 'transparent', border: '1px solid var(--tz-border)', borderRadius: 8, padding: 8, marginLeft: 4, cursor: 'pointer' }}
            >
              <Icon name="menu" size={18} />
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="hide-desktop" style={{ background: 'var(--tz-paper)', borderTop: '1px solid var(--tz-border)', padding: 16 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                style={{ padding: '12px 8px', fontSize: 15, color: 'var(--tz-ink)', textDecoration: 'none', borderBottom: '1px solid var(--tz-border-soft)' }}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/vendor-dashboard" onClick={() => setMenuOpen(false)} style={{ padding: '12px 8px', fontSize: 15, color: 'var(--tz-ink)', textDecoration: 'none' }}>
              List your service
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
