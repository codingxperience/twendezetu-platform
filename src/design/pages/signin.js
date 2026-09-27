// Sign in, register, two-step code and password reset.

import { COLORS, EMAIL_PATTERN } from './shared';

const HOMES = [
  { value: 'US|New Jersey', label: 'New Jersey / New York, USA' },
  { value: 'KE|Nairobi', label: 'Nairobi, Kenya' },
  { value: 'UG|Kampala', label: 'Kampala, Uganda' },
  { value: 'TZ|Dar es Salaam', label: 'Dar es Salaam, Tanzania' },
  { value: 'RW|Kigali', label: 'Kigali, Rwanda' },
];

export const initialState = { mode: 'signin', step: 'credentials', role: 'user', name: '', email: '', password: '', home: HOMES[0].value, code: '', phoneHint: '', error: null, notice: null };

export function stateFrom(data, params = {}) {
  if (params.reset) return { step: 'reset' };
  return { mode: params.mode === 'register' ? 'register' : 'signin', role: ['user', 'advertiser', 'provider'].includes(params.role) ? params.role : 'user' };
}

// Only same-site paths are honoured as a destination after signing in.
function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

export function values(state, set, ctx) {
  const register = state.mode === 'register' && state.step === 'credentials';
  const signIn = state.mode === 'signin' && state.step === 'credentials';
  const next = safeNext(ctx.params.next);
  const setField = (key) => (event) => set((current) => ({ ...current, [key]: event.target.value, error: null }));
  const fail = (error) => set((current) => ({ ...current, error }));
  const go = (path) => window.location.assign(path);

  const submit = async () => {
    if (state.busy?.auth) return;
    const email = state.email.trim();
    if (state.step === 'credentials') {
      if (register && state.name.trim().length < 2) return fail('Add your name — it is how hosts and providers see you.');
      if (!EMAIL_PATTERN.test(email)) return fail('Enter a valid email address.');
      if (!state.password) return fail('Enter your password.');
      if (register && state.password.length < 10) return fail('Use at least 10 characters for your password.');
    }
    set((current) => ({ ...current, busy: { ...current.busy, auth: true }, error: null }));
    try {
      if (state.step === 'credentials' && register) {
        const [country, city] = state.home.split('|');
        const result = await ctx.api.post('/api/auth/sign-up', { name: state.name.trim(), email, password: state.password, city, country, intent: state.role, ref: ctx.params.ref || undefined });
        return go(next || result.next);
      }
      if (state.step === 'credentials') {
        const result = await ctx.api.post('/api/auth/sign-in', { email, password: state.password });
        if (result.twoFactorRequired) {
          return set((current) => ({ ...current, step: 'twoFactor', phoneHint: result.phoneHint, password: '', busy: {} }));
        }
        return go(next || '/my-twende');
      }
      if (state.step === 'twoFactor') {
        await ctx.api.post('/api/auth/two-factor', { code: state.code.trim() });
        return go(next || '/my-twende');
      }
      if (state.step === 'forgot') {
        if (!EMAIL_PATTERN.test(email)) return fail('Enter a valid email address.');
        const result = await ctx.api.post('/api/auth/password/forgot', { email });
        return set((current) => ({ ...current, step: 'credentials', mode: 'signin', notice: result.message, busy: {} }));
      }
      if (state.step === 'reset') {
        await ctx.api.post('/api/auth/password/reset', { token: ctx.params.reset, password: state.password });
        return set((current) => ({ ...current, step: 'credentials', mode: 'signin', password: '', notice: 'Password changed. Sign in with your new password.', busy: {} }));
      }
    } catch (error) {
      set((current) => ({ ...current, error: error.message, busy: {} }));
    }
    return undefined;
  };

  const mkRole = (id, title, desc, tag) => ({
    title,
    desc,
    tag,
    pick: () => set((current) => ({ ...current, role: id })),
    bg: state.role === id ? COLORS.forest : COLORS.paper,
    fg: state.role === id ? COLORS.cream : COLORS.ink,
    shadow: state.role === id ? `4px 4px 0 ${COLORS.clay}` : 'none',
  });

  return {
    isCredentials: state.step === 'credentials',
    isRegister: register,
    isSignIn: signIn,
    isTwoFactor: state.step === 'twoFactor',
    isForgot: state.step === 'forgot',
    isReset: state.step === 'reset',
    setSignIn: () => set((current) => ({ ...current, mode: 'signin', error: null })),
    setRegister: () => set((current) => ({ ...current, mode: 'register', error: null })),
    signInBg: state.mode === 'signin' ? COLORS.forest : COLORS.cream,
    signInFg: state.mode === 'signin' ? COLORS.cream : COLORS.ink,
    registerBg: state.mode === 'register' ? COLORS.forest : COLORS.cream,
    registerFg: state.mode === 'register' ? COLORS.cream : COLORS.ink,
    roleCards: [
      mkRole('user', 'User / guest', 'Browse, RSVP, save events, reminders, refer friends.', 'FREE'),
      mkRole('advertiser', 'Advertiser / event maker', 'Post events & needs. Free RSVP events, or add ticket tiers when you post — 5% fee only when tickets sell.', 'FREE TO POST'),
      mkRole('provider', 'Provider', 'Offer services — drivers, DJs, tents, catering. Joining is free; the yearly listing membership starts when you want to answer leads.', 'FREE TO JOIN'),
    ],
    name: state.name,
    setName: setField('name'),
    email: state.email,
    setEmail: setField('email'),
    password: state.password,
    setPassword: setField('password'),
    passwordAutocomplete: register ? 'new-password' : 'current-password',
    passwordPlaceholder: register ? 'At least 10 characters' : '••••••••',
    home: state.home,
    setHome: setField('home'),
    homes: HOMES,
    code: state.code,
    setCode: (event) => set((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6), error: null })),
    phoneHint: state.phoneHint,
    error: state.error,
    notice: state.notice,
    busy: Boolean(state.busy?.auth),
    submit,
    submitOnEnter: (event) => {
      if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
        event.preventDefault();
        submit();
      }
    },
    showForgot: () => set((current) => ({ ...current, step: 'forgot', error: null, notice: null })),
    backToSignIn: () => set((current) => ({ ...current, step: 'credentials', mode: 'signin', error: null })),
    resendCode: () =>
      ctx.api.put('/api/auth/two-factor').then(
        () => ctx.toast('A new code is on its way.'),
        (error) => ctx.toast(error.message, 'err'),
      ),
    ctaLabel: register ? 'Create account →' : 'Sign in →',
    guestHref: next || '/',
  };
}
