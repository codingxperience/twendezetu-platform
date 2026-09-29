// Account settings: profile, notifications, payout methods, security.

import { COLORS } from './shared';

const TABS = [
  ['profile', 'PROFILE', '◌'],
  ['notifications', 'NOTIFICATIONS', '▲'],
  ['payments', 'PAYOUT METHODS', '◍'],
  ['security', 'SECURITY', '✓'],
];
const KINDS = [
  ['MPESA', 'M-PESA', 'M-Pesa number'],
  ['MTN_MOMO', 'MTN MOMO', 'MTN MoMo number'],
  ['AIRTEL_MONEY', 'AIRTEL MONEY', 'Airtel Money number'],
  ['BANK', 'BANK ACCOUNT', 'Account number'],
];
const KIND_ICON = { MPESA: 'M', MTN_MOMO: 'MTN', AIRTEL_MONEY: 'AIR', BANK: 'BANK', CARD: 'CARD' };

export const initialState = { tab: 'profile', form: null, addOpen: false, newKind: 'MPESA', newAccount: '', newBank: '' };

export function stateFrom(data, params = {}) {
  const tab = TABS.some(([key]) => key === params.tab) ? params.tab : 'profile';
  const { profile } = data;
  return { tab, form: { name: profile.name, businessName: profile.businessName, city: profile.city, country: profile.country, currency: profile.currency } };
}

const knob = (on, big = false) => ({ bg: on ? COLORS.clay : COLORS.sand, knob: on ? (big ? '26px' : '20px') : '2px' });

export function values(state, set, ctx) {
  const { data, form } = state;
  const { profile, notifications, security } = data;
  const field = (key) => (event) => set((current) => ({ ...current, form: { ...current.form, [key]: event.target.value } }));
  const refresh = () => ctx.reload();

  const goTab = (tab) => {
    set((current) => ({ ...current, tab }));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  };

  const password = (title, body) => ctx.ask({ title, body, type: 'password', autoComplete: 'current-password', placeholder: 'Your password', confirmLabel: 'Confirm' });

  // ── Profile ───────────────────────────────────────────────────────────
  const saveProfile = () => {
    if (form.name.trim().length < 2) return ctx.toast('Add your name.', 'err');
    return ctx.run('profile', () => ctx.api.patch('/api/account/profile', {
      name: form.name.trim(),
      city: form.city.trim(),
      country: form.country,
      currency: form.currency,
      ...(data.isProvider && form.businessName.trim() ? { businessName: form.businessName.trim() } : {}),
    }), { success: 'Saved.' });
  };

  const changePhoto = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return ctx.toast('Photos can be at most 4 MB.', 'err');
    return ctx.run('photo', async () => {
      const { file: stored } = await ctx.api.upload(file, 'AVATAR');
      await ctx.api.patch('/api/account/profile', { avatarUrl: stored.url });
    }, { success: 'Photo updated.' });
  };

  const changeEmail = async () => {
    const email = await ctx.ask({ title: 'Change your email', body: 'This is the address you sign in with and where receipts go.', type: 'email', autoComplete: 'email', placeholder: 'new@example.com', confirmLabel: 'Next' });
    if (!email) return;
    const pass = await password('Confirm it is you', `Enter your password to move your account to ${email}.`);
    if (!pass) return;
    ctx.run('email', () => ctx.api.patch('/api/account/email', { email, password: pass }), { success: `Your sign-in email is now ${email}.` });
  };

  const changePhone = async () => {
    const phone = await ctx.ask({ title: profile.phone ? 'Change your phone' : 'Add your phone', body: 'We text a code to check it. Used for security codes and money alerts, never shown to anyone.', type: 'tel', autoComplete: 'tel', placeholder: '+256 772 000 000', initial: profile.phone, confirmLabel: 'Text me a code' });
    if (!phone) return;
    const sent = await ctx.run('phone', () => ctx.api.post('/api/account/phone', { phone }), { reloadAfter: false });
    if (!sent) return;
    const code = await ctx.ask({ title: 'Enter the code', body: `We texted a 6-digit code to ${phone}. It works for 10 minutes.`, inputMode: 'numeric', autoComplete: 'one-time-code', maxLength: 6, placeholder: '123456', confirmLabel: 'Verify' });
    if (!code) return;
    ctx.run('phone-verify', () => ctx.api.put('/api/account/phone', { phone, code }), { success: 'Phone verified.' });
  };

  // ── Notifications ─────────────────────────────────────────────────────
  const toggleChannel = (row, channel) => {
    const next = !row[channel];
    set((current) => ({
      ...current,
      data: { ...current.data, notifications: { ...current.data.notifications, rows: current.data.notifications.rows.map((item) => (item.topic === row.topic ? { ...item, [channel]: next } : item)) } },
    }));
    ctx.api.patch('/api/account/notifications', { topic: row.topic, channel, enabled: next })
      .then((saved) => {
        // The server keeps money notices reachable; show what it kept.
        set((current) => ({ ...current, data: { ...current.data, notifications: { ...current.data.notifications, rows: current.data.notifications.rows.map((item) => (item.topic === row.topic ? { ...item, ...saved } : item)) } } }));
      })
      .catch((error) => {
        ctx.toast(error.message, 'err');
        refresh();
      });
  };
  const setSwitch = (key, value, success) => ctx.run(`switch:${key}`, () => ctx.api.put('/api/account/notifications', { [key]: value }), { success });

  // ── Payout methods ────────────────────────────────────────────────────
  const kind = KINDS.find(([key]) => key === state.newKind);
  const saveMethod = () => {
    if (state.newAccount.replace(/\D/g, '').length < 6) return ctx.toast('Enter the full number.', 'err');
    return ctx.run('method', async () => {
      await ctx.api.post('/api/account/payment-methods', { kind: state.newKind, account: state.newAccount.trim(), bankName: state.newKind === 'BANK' ? state.newBank.trim() || undefined : undefined });
      set((current) => ({ ...current, addOpen: false, newAccount: '', newBank: '' }));
    }, { success: 'Saved.' });
  };

  // ── Security ──────────────────────────────────────────────────────────
  const toggleTwoFactor = async () => {
    const enabling = !security.twoFactor;
    if (enabling && !profile.phoneVerified) {
      ctx.toast('Verify your phone first: the codes are texted to it.', 'err');
      return;
    }
    const pass = await password(enabling ? 'Turn on two-step verification' : 'Turn off two-step verification', enabling ? 'After your password, we will text a code when you sign in and before money leaves your account.' : 'Signing in and moving money will then need only your password.');
    if (!pass) return;
    ctx.run('2fa', () => ctx.api.put('/api/account/two-factor', { enabled: enabling, password: pass }), { success: enabling ? 'Two-step verification is on.' : 'Two-step verification is off.' });
  };
  const changePassword = async () => {
    const current = await password('Change your password', 'First, your current password.');
    if (!current) return;
    const next = await ctx.ask({ title: 'New password', body: 'At least 10 characters. A few unrelated words make a strong one.', type: 'password', autoComplete: 'new-password', placeholder: 'New password', confirmLabel: 'Change password' });
    if (!next) return;
    ctx.run('password', () => ctx.api.post('/api/account/password', { currentPassword: current, newPassword: next }), { success: 'Password changed. Other devices have been signed out.' });
  };
  const deleteAccount = async () => {
    const pass = await ctx.ask({
      title: 'Delete your account?',
      body: 'Your profile, posts and listing are removed and you are signed out everywhere. Money already in escrow or on its way is still settled, and records the law requires us to keep are kept. This cannot be undone.',
      type: 'password',
      autoComplete: 'current-password',
      placeholder: 'Your password',
      confirmLabel: 'Delete my account',
      danger: true,
    });
    if (!pass) return;
    ctx.run('delete', async () => {
      await ctx.api.delete('/api/account', { password: pass });
      window.location.assign('/');
    }, { reloadAfter: false });
  };

  const others = data.sessions.filter((row) => !row.current);

  return {
    me: data.me,
    backHref: data.isProvider ? '/provider-dashboard' : '/my-twende',
    backLabel: data.isProvider ? 'VENDOR PORTAL' : 'MY TWENDE',
    signOut: () => ctx.run('signout', async () => {
      await ctx.api.post('/api/auth/sign-out');
      window.location.assign('/');
    }, { reloadAfter: false }),
    navItems: TABS.map(([key, label, icon]) => ({ label, icon, current: state.tab === key ? 'page' : 'false', bg: state.tab === key ? COLORS.forest : 'transparent', fg: state.tab === key ? COLORS.cream : COLORS.ink, go: () => goTab(key) })),
    isProfile: state.tab === 'profile',
    isNotifs: state.tab === 'notifications',
    isPayments: state.tab === 'payments',
    isSecurity: state.tab === 'security',

    initials: data.me.initials,
    hasAvatar: Boolean(profile.avatarUrl),
    noAvatar: !profile.avatarUrl,
    avatarUrl: profile.avatarUrl,
    photoLabel: profile.avatarUrl ? 'CHANGE PHOTO' : 'ADD A PHOTO',
    changePhoto,
    removePhoto: () => ctx.run('photo', () => ctx.api.patch('/api/account/profile', { avatarUrl: '' }), { success: 'Photo removed.' }),
    isProvider: data.isProvider,
    fName: form.name, setFName: field('name'),
    fBiz: form.businessName, setFBiz: field('businessName'),
    fEmail: profile.email,
    fPhone: profile.phone ? `${profile.phoneMasked}${profile.phoneVerified ? ' ✓' : ' · not verified'}` : 'Not added',
    phoneAction: profile.phone ? (profile.phoneVerified ? 'CHANGE' : 'VERIFY') : 'ADD',
    changeEmail,
    changePhone,
    fCity: form.city, setFCity: field('city'),
    fCountry: form.country, setFCountry: field('country'),
    fCurrency: form.currency, setFCurrency: field('currency'),
    countries: data.countries,
    currencies: data.currencies,
    timezoneNote: `${profile.timezone.replace('_', ' ')}, from your country. Event times are shown in the venue's time zone, with its name beside every time.`,
    timezone: profile.timezone.replace('_', ' '),
    saveProfile,
    savingProfile: Boolean(state.busy?.profile),
    saveLabel: 'Save changes',

    notifRows: notifications.rows.map((row) => {
      const app = knob(row.inApp);
      const email = knob(row.email);
      const sms = knob(row.sms);
      return {
        ...row,
        appOn: row.inApp, appBg: app.bg, appKnob: app.knob, tApp: () => toggleChannel(row, 'inApp'),
        emailOn: row.email, emailBg: email.bg, emailKnob: email.knob, tEmail: () => toggleChannel(row, 'email'),
        smsOn: row.sms, smsBg: sms.bg, smsKnob: sms.knob, tSms: () => toggleChannel(row, 'sms'),
      };
    }),
    smsNeedsPhone: !profile.phoneVerified,
    quietOn: notifications.quietHours,
    quietBg: knob(notifications.quietHours, true).bg,
    quietKnob: knob(notifications.quietHours, true).knob,
    toggleQuiet: () => setSwitch('quietHours', !notifications.quietHours, notifications.quietHours ? 'Quiet hours are off.' : 'Quiet hours are on.'),
    digestOn: notifications.weeklyDigest,
    digestBg: knob(notifications.weeklyDigest, true).bg,
    digestKnob: knob(notifications.weeklyDigest, true).knob,
    toggleDigest: () => setSwitch('weeklyDigest', !notifications.weeklyDigest, notifications.weeklyDigest ? 'Weekly digest is off.' : 'Weekly digest is on.'),
    digestAll: async () => {
      const sure = await ctx.ask({ title: 'Digest instead of emails?', body: 'Everyday emails, texts and WhatsApp messages stop, and you get one summary every Monday. Money notices still reach you.', input: false, confirmLabel: 'Switch to the digest' });
      if (sure) ctx.run('digest-all', () => ctx.api.put('/api/account/notifications', { muteNonEssential: true, weeklyDigest: true }), { success: 'Done. One email on Mondays, plus money notices.' });
    },
    muteAll: async () => {
      const sure = await ctx.ask({ title: 'Mute everything but money?', body: 'Emails and texts stop for everything except money moving in or out of your account. In-app notices keep arriving. Turn any type back on here.', input: false, confirmLabel: 'Mute' });
      if (sure) ctx.run('mute', () => ctx.api.put('/api/account/notifications', { muteNonEssential: true }), { success: 'Muted. Money notices still reach you.' });
    },

    payMethods: data.methods.map((method) => ({
      ...method,
      icon: KIND_ICON[method.kind] || '·',
      iconBg: method.isDefault ? COLORS.clay : COLORS.sand,
      iconFg: method.isDefault ? COLORS.cream : COLORS.ink,
      meta: `${method.payouts ? 'RECEIVES PAYOUTS' : 'SAVED'} · ADDED ${method.added}`,
      notDefault: !method.isDefault,
      makeDefault: () => ctx.run(`default:${method.id}`, () => ctx.api.patch(`/api/account/payment-methods/${method.id}`), { success: `${method.label} is now your default.` }),
      remove: async () => {
        const pass = await password(`Remove ${method.label}?`, 'Enter your password to remove this payout method.');
        if (pass) ctx.run(`remove:${method.id}`, () => ctx.api.delete(`/api/account/payment-methods/${method.id}`, { password: pass }), { success: 'Removed.' });
      },
    })),
    noMethods: data.methods.length === 0,
    addOpen: state.addOpen,
    addClosed: !state.addOpen,
    addMethod: () => set((current) => ({ ...current, addOpen: true })),
    closeAdd: () => set((current) => ({ ...current, addOpen: false })),
    kinds: KINDS.map(([key, label]) => ({ label, selected: state.newKind === key, bg: state.newKind === key ? COLORS.forest : COLORS.paper, fg: state.newKind === key ? COLORS.cream : COLORS.ink, pick: () => set((current) => ({ ...current, newKind: key })) })),
    isBank: state.newKind === 'BANK',
    accountLabel: kind[2],
    newAccount: state.newAccount,
    setNewAccount: (event) => set((current) => ({ ...current, newAccount: event.target.value })),
    newBank: state.newBank,
    setNewBank: (event) => set((current) => ({ ...current, newBank: event.target.value })),
    saveMethod,

    staffLocked: security.staffLocked,
    staffLockedText: !security.textsAvailable
      ? `Your ${security.console} console opens once two-step verification is on. Text messages are not set up on this site yet, so it cannot be turned on: the site owner needs to add the text message (SMS) settings first.`
      : profile.phoneVerified
        ? `Your ${security.console} console opens once two-step verification is on. Turn it on below; after that we text you a code at each sign-in.`
        : `Your ${security.console} console opens once two-step verification is on. It texts a code to your phone, so first verify your number under Profile, then turn it on below.`,
    securityRows: [
      {
        title: 'Two-step verification',
        desc: security.twoFactor ? 'On. We text a code when you sign in and before money leaves your account.' : 'Off. Turn it on so a stolen password is not enough to take your account or your money.',
        btn: security.twoFactor ? 'TURN OFF' : 'TURN ON',
        action: toggleTwoFactor,
      },
      { title: 'Password', desc: security.passwordChanged ? `Last changed ${security.passwordChanged.toLowerCase()}.` : `Set when you joined in ${security.memberSince}.`, btn: 'CHANGE', action: changePassword },
      { title: 'Download your data', desc: 'Everything we hold about you, as a file you can keep.', btn: '↓ DOWNLOAD', href: '/api/account/export' },
      { title: 'Delete your account', desc: 'Removes your profile, posts and listing for good.', btn: 'DELETE', action: deleteAccount, danger: true },
    ].map((row) => ({
      ...row,
      isLink: Boolean(row.href),
      isButton: !row.href,
      border: row.danger ? COLORS.red : COLORS.forest,
      btnBorder: row.danger ? COLORS.red : COLORS.forest,
      btnBg: row.danger ? 'transparent' : COLORS.cream,
      btnFg: row.danger ? COLORS.red : COLORS.ink,
    })),
    sessions: data.sessions.map((row) => ({
      ...row,
      other: !row.current,
      meta: `LAST ACTIVE ${row.lastSeen}`,
      revoke: () => ctx.run(`session:${row.id}`, () => ctx.api.delete(`/api/account/sessions/${row.id}`), { success: `${row.device} is signed out.` }),
    })),
    hasOtherSessions: others.length > 0,
    revokeOthers: async () => {
      const sure = await ctx.ask({ title: 'Sign out everywhere else?', body: `${others.length} other ${others.length === 1 ? 'device' : 'devices'} will need your password again.`, input: false, confirmLabel: 'Sign them out', danger: true });
      if (sure) ctx.run('sessions', () => ctx.api.delete('/api/account/sessions'), { success: 'Signed out everywhere else.' });
    },
  };
}
