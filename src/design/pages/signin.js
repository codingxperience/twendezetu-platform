// Sign in, register, two-step code and password reset.

import { COLORS, EMAIL_PATTERN } from './shared';

const HOMES = [
  { value: 'US|New Jersey', label: 'New Jersey / New York, USA' },
  { value: 'KE|Nairobi', label: 'Nairobi, Kenya' },
  { value: 'UG|Kampala', label: 'Kampala, Uganda' },
  { value: 'TZ|Dar es Salaam', label: 'Dar es Salaam, Tanzania' },
  { value: 'RW|Kigali', label: 'Kigali, Rwanda' },
];

export const initialState = { mode: 'signin', step: 'credentials', role: 'user', name: '', email: '', password: '', confirm: '', showPassword: false, home: HOMES[0].value, code: '', phoneHint: '', sentTo: '', canResend: false, linkStatus: null, error: null, notice: null };

// A reset link waits this long before "send it again" is offered, matching
// the server, which ignores a second request inside the same minute.
const RESEND_AFTER_MS = 60 * 1000;
const MIN_PASSWORD = 10;

const LINK_PROBLEMS = {
  used: 'This reset link was already used. If you still need to change your password, ask for a new link.',
  expired: 'This reset link has expired. Links work for 30 minutes; ask for a new one below.',
  invalid: 'This reset link does not work. It may be incomplete, or a newer link replaced it. Ask for a new one below.',
};

export function stateFrom(data, params = {}) {
  if (params.reset) return { step: 'reset', linkStatus: data?.reset?.status || 'invalid' };
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
  const fail = (error) => set((current) => ({ ...current, error, busy: {} }));
  const go = (path) => window.location.assign(path);
  const linkAlive = state.linkStatus === 'valid';

  // Asks for a reset link and moves to the "check your inbox" panel. The
  // reply is the same whether or not the address has an account.
  const sendResetLink = async (email) => {
    await ctx.api.post('/api/auth/password/forgot', { email });
    set((current) => ({ ...current, step: 'sent', sentTo: email, canResend: false, error: null, notice: null, busy: {} }));
    window.setTimeout(() => set((current) => (current.sentTo === email ? { ...current, canResend: true } : current)), RESEND_AFTER_MS);
  };

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
        return await sendResetLink(email);
      }
      if (state.step === 'reset') {
        if (!linkAlive) return set((current) => ({ ...current, busy: {} }));
        if (state.password.length < MIN_PASSWORD) return fail(`Use at least ${MIN_PASSWORD} characters.`);
        if (state.password !== state.confirm) return fail('The two passwords do not match.');
        const result = await ctx.api.post('/api/auth/password/reset', { token: ctx.params.reset, password: state.password });
        if (result.signedIn) return go(next || '/my-twende');
        return set((current) => ({
          ...current,
          step: 'credentials',
          mode: 'signin',
          email: result.email || current.email,
          password: '',
          confirm: '',
          notice: 'Password changed. Sign in with your new password; we will text a code to your phone as usual.',
          busy: {},
        }));
      }
    } catch (error) {
      // A link that died while the page was open switches to the panel that
      // offers a new one, instead of an error beside a form that cannot work.
      const linkStatus = error.details?.linkStatus;
      set((current) => ({ ...current, error: linkStatus ? null : error.message, linkStatus: linkStatus || current.linkStatus, busy: {} }));
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
    isSent: state.step === 'sent',
    isReset: state.step === 'reset' && linkAlive,
    isResetDead: state.step === 'reset' && !linkAlive,
    resetFor: state.data?.reset?.emailHint || '',
    linkProblem: LINK_PROBLEMS[state.linkStatus] || LINK_PROBLEMS.invalid,
    sentTo: state.sentTo,
    resendLabel: state.canResend ? 'Send it again' : 'You can ask again in a minute',
    resendColor: state.canResend ? '#A85A23' : '#8A7F74',
    resend: async () => {
      if (!state.canResend || state.busy?.auth) return;
      set((current) => ({ ...current, busy: { ...current.busy, auth: true }, error: null }));
      try {
        await sendResetLink(state.sentTo);
        ctx.toast('Sent again. Use the newest email: it replaces the earlier link.');
      } catch (error) {
        set((current) => ({ ...current, error: error.message, busy: {} }));
      }
    },
    useOtherEmail: () => set((current) => ({ ...current, step: 'forgot', error: null, notice: null })),
    askNewLink: () => set((current) => ({ ...current, step: 'forgot', password: '', confirm: '', error: null, notice: null })),
    confirm: state.confirm,
    setConfirm: setField('confirm'),
    passwordType: state.showPassword ? 'text' : 'password',
    toggleShowLabel: state.showPassword ? 'Hide passwords' : 'Show passwords',
    toggleShow: () => set((current) => ({ ...current, showPassword: !current.showPassword })),
    lengthMark: state.password.length >= MIN_PASSWORD ? '✓' : '·',
    lengthColor: state.password.length >= MIN_PASSWORD ? COLORS.forest : '#9A8F84',
    matchMark: state.confirm && state.password === state.confirm ? '✓' : '·',
    matchColor: state.confirm && state.password === state.confirm ? COLORS.forest : '#9A8F84',
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
    showForgot: () => set((current) => ({ ...current, step: 'forgot', password: '', error: null, notice: null })),
    backToSignIn: () => set((current) => ({ ...current, step: 'credentials', mode: 'signin', password: '', confirm: '', error: null })),
    resendCode: () =>
      ctx.api.put('/api/auth/two-factor').then(
        () => ctx.toast('A new code is on its way.'),
        (error) => ctx.toast(error.message, 'err'),
      ),
    ctaLabel: register ? 'Create account →' : 'Sign in →',
    guestHref: next || '/',
  };
}

// The reset token is read into memory as the page loads; take it out of the
// address bar and history so it is not bookmarked, shared or synced.
export function onMount(ctx) {
  if (ctx.params.reset && typeof window !== 'undefined') {
    window.history.replaceState(window.history.state, '', '/sign-in');
  }
}
