// The admin console: platform health, the report queue, refund cases waiting
// on a decision, members and roles, provider verification, content curation
// and operator switches. Every action is checked and audit-logged on the
// server; this page only asks for what the server needs.

import { COLORS, toggleStyle } from './shared';

const NAV = [
  ['overview', 'Overview', 'M3 12h4l3-8 4 16 3-8h4'],
  ['moderation', 'Moderation', 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z'],
  ['cases', 'Refund cases', 'M4 7h16M4 12h16M4 17h10'],
  ['users', 'Users & roles', 'M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8M22 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8'],
  ['verify', 'Verification', 'M20 6L9 17l-5-5'],
  ['content', 'Content', 'M4 4h16v16H4zM4 9h16M9 20V9'],
  ['settings', 'Settings', 'M12 15a3 3 0 100-6 3 3 0 000 6M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-2.9-1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H3a2 2 0 110-4h.1a1.7 1.7 0 001.2-2.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 002.9-1.2V3a2 2 0 114 0v.1a1.7 1.7 0 002.9 1.2l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 001.2 2.9H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z'],
];

const SEVERITY_BG = { HIGH: COLORS.red, MED: COLORS.clayLight, LOW: COLORS.sand };
const ROLES = [['MEMBER', 'Member'], ['MODERATOR', 'Moderator'], ['FINANCE', 'Finance'], ['ADMIN', 'Administrator']];

export const initialState = { menuOpen: false, openUser: null, userMode: null, roleDraft: {}, messageDraft: '', search: '' };

export function stateFrom(data) {
  return { search: data.query || '' };
}

export function values(state, set, ctx) {
  const { data } = state;
  const { staff, section } = data;
  const go = (next, extra = '') => ctx.navigate(`/admin?section=${next}${extra}`);
  const post = (key, path, body, success) => ctx.run(key, () => ctx.api.post(path, body, { idempotent: true }), { success });

  // ── Moderation ────────────────────────────────────────────────────────
  const reports = (data.reports || []).map((report) => ({
    ...report,
    sevBg: SEVERITY_BG[report.severity] || COLORS.sand,
    open: report.status === 'OPEN',
    resolved: report.status !== 'OPEN',
    resolution: report.status,
    canAct: Boolean(report.targetUserId),
    dismiss: () => post(`r:${report.id}`, `/api/admin/reports/${report.id}`, { action: 'dismiss' }, 'Report dismissed.'),
    warn: () => post(`r:${report.id}`, `/api/admin/reports/${report.id}`, { action: 'warn' }, 'Warning sent to the member.'),
    suspend: async () => {
      const sure = await ctx.ask({
        title: 'Suspend this account?',
        body: 'They are signed out everywhere, their posts are hidden and a provider listing is taken down until you reinstate them.',
        input: false,
        confirmLabel: 'Suspend',
        danger: true,
      });
      if (sure) post(`r:${report.id}`, `/api/admin/reports/${report.id}`, { action: 'suspend' }, 'Account suspended.');
    },
  }));

  // ── Refund cases ──────────────────────────────────────────────────────
  const decide = async (item, outcome) => {
    let amount;
    if (outcome === 'partial') {
      amount = await ctx.ask({ title: `Partial refund on ${item.reference}`, body: `Up to ${item.amount}. The rest goes to the seller as normal.`, placeholder: `Amount in ${item.currency}`, inputMode: 'decimal', confirmLabel: 'Next' });
      if (!amount) return;
    }
    const titles = { refund: `Refund ${item.amount} in full?`, partial: 'Explain the decision', deny: 'Close without a refund?' };
    const note = await ctx.ask({
      title: titles[outcome],
      body: 'Both sides read this reason with the decision. The money moves as soon as you confirm, and it cannot be undone here.',
      placeholder: 'The reason, in a sentence or two',
      maxLength: 1000,
      confirmLabel: outcome === 'deny' ? 'Close the case' : 'Refund and close',
      danger: outcome === 'deny',
    });
    if (!note) return;
    post(`c:${item.id}`, `/api/admin/disputes/${item.id}`, { outcome, amount, note }, 'Decided. Both sides have been told.');
  };
  const cases = (data.cases || []).map((item) => ({
    ...item,
    hasNotes: item.notes.length > 0,
    hasEvidence: item.evidence.length > 0,
    refund: () => decide(item, 'refund'),
    partial: () => decide(item, 'partial'),
    deny: () => decide(item, 'deny'),
  }));

  // ── Users ─────────────────────────────────────────────────────────────
  const toggleUser = (id, mode) => set((current) => ({ ...current, openUser: current.openUser === id && current.userMode === mode ? null : id, userMode: mode, messageDraft: '' }));
  const users = (data.users || []).map((user) => {
    const managing = state.openUser === user.id && state.userMode === 'manage';
    const messaging = state.openUser === user.id && state.userMode === 'message';
    const self = user.id === staff.id;
    const draft = state.roleDraft[user.id] || user.staffRole;
    return {
      ...user,
      status: user.suspended ? 'SUSPENDED' : 'ACTIVE',
      statusColor: user.suspended ? COLORS.clayLight : COLORS.sage,
      manage: () => toggleUser(user.id, 'manage'),
      manageBg: managing ? 'rgba(247,241,230,0.15)' : 'transparent',
      msg: () => toggleUser(user.id, 'message'),
      managing,
      messaging,
      canSuspend: !self,
      suspendLabel: user.suspended ? 'REINSTATE' : 'SUSPEND',
      suspendColor: user.suspended ? COLORS.sage : COLORS.clayLight,
      toggleSuspend: async () => {
        if (user.suspended) return post(`u:${user.id}`, `/api/admin/users/${user.id}`, { action: 'reinstate' }, `${user.name} is reinstated.`);
        const reason = await ctx.ask({ title: `Suspend ${user.name}?`, body: 'They are signed out everywhere and their posts are hidden. The reason goes in the audit log.', placeholder: 'Reason', maxLength: 200, confirmLabel: 'Suspend', danger: true });
        if (reason) post(`u:${user.id}`, `/api/admin/users/${user.id}`, { action: 'suspend', reason }, `${user.name} is suspended.`);
        return undefined;
      },
      canRole: staff.isAdmin && !self,
      roleNote: self ? 'Another administrator has to change your own role.' : staff.isAdmin ? '' : 'Only administrators change roles.',
      roles: ROLES.map(([value, label]) => ({ value, label })),
      roleDraft: draft,
      setRole: (event) => set((current) => ({ ...current, roleDraft: { ...current.roleDraft, [user.id]: event.target.value } })),
      saveRole: () => post(`u:${user.id}`, `/api/admin/users/${user.id}`, { action: 'role', role: draft }, `${user.name}'s role is updated.`),
      resetPw: () => post(`u:${user.id}`, `/api/admin/users/${user.id}`, { action: 'reset' }, 'Password reset link sent.'),
      messageDraft: state.messageDraft,
      setMessage: (event) => set((current) => ({ ...current, messageDraft: event.target.value })),
      sendMsg: () => {
        if (state.messageDraft.trim().length < 2) return ctx.toast('Write the message first.', 'err');
        return ctx.run(`u:${user.id}`, () => ctx.api.post(`/api/admin/users/${user.id}`, { action: 'message', text: state.messageDraft.trim() }), { success: 'Sent to their inbox.', reloadAfter: false })
          .then((result) => result && set((current) => ({ ...current, openUser: null, messageDraft: '' })));
      },
    };
  });

  // ── Verification ──────────────────────────────────────────────────────
  const review = async (item, decision) => {
    let note;
    if (decision !== 'approve') {
      note = await ctx.ask({ title: decision === 'info' ? 'What is missing?' : 'Why is it not approved?', body: 'The provider reads this, so say exactly what to fix.', maxLength: 500, confirmLabel: decision === 'info' ? 'Ask for it' : 'Reject' , danger: decision === 'reject' });
      if (!note) return;
    }
    post(`v:${item.id}`, `/api/admin/verifications/${item.id}`, { decision, note }, decision === 'approve' ? `${item.name} is verified.` : 'The provider has been told.');
  };
  const verifications = (data.verifications || []).map((item) => ({
    ...item,
    checks: item.checks.map(([label, ok]) => ({ label: `${ok ? '✓' : '✕'} ${label}`, color: ok ? COLORS.sage : COLORS.clayLight })),
    documents: item.documents.map((id, index) => ({ href: `/api/files/${id}`, label: `FILE ${index + 1}` })),
    idHint: item.idNumberHint ? `ID ${item.idNumberHint}` : '',
    approve: () => review(item, 'approve'),
    askInfo: () => review(item, 'info'),
    reject: () => review(item, 'reject'),
  }));

  // ── Content ───────────────────────────────────────────────────────────
  const posts = (data.posts || []).map((item) => ({
    ...item,
    canFeature: item.kind === 'event',
    featBg: item.featured ? COLORS.clay : 'transparent',
    featFg: item.featured ? COLORS.ink : COLORS.clay,
    featLabel: item.featured ? 'FEATURED ✓' : 'FEATURE',
    feature: () => post(`p:${item.id}`, '/api/admin/content', { kind: item.kind, id: item.id, action: item.featured ? 'unfeature' : 'feature' }, item.featured ? 'No longer featured.' : 'Featured on the home page.'),
    hideLabel: item.hidden ? 'RESTORE' : 'HIDE',
    hide: async () => {
      if (item.hidden) return post(`p:${item.id}`, '/api/admin/content', { kind: item.kind, id: item.id, action: 'unhide' }, 'Visible again.');
      const reason = await ctx.ask({ title: `Hide “${item.title}”?`, body: 'It disappears from search and the feed. The reason goes in the audit log.', placeholder: 'Reason', maxLength: 200, confirmLabel: 'Hide', danger: true });
      if (reason) post(`p:${item.id}`, '/api/admin/content', { kind: item.kind, id: item.id, action: 'hide', reason }, 'Hidden.');
      return undefined;
    },
  }));

  // ── Settings ──────────────────────────────────────────────────────────
  const settings = (data.settings || []).map((item) => {
    const style = toggleStyle(item.on, { onBg: COLORS.clay, offBg: 'rgba(247,241,230,0.2)' });
    return {
      ...item,
      bg: style.bg,
      knobLeft: style.knobLeft,
      canToggle: staff.isAdmin,
      readOnly: !staff.isAdmin,
      state: item.on ? 'ON' : 'OFF',
      toggle: () => ctx.run(`s:${item.key}`, () => ctx.api.patch('/api/admin/settings', { key: item.key, value: !item.on }), { success: `${item.title}: ${item.on ? 'off' : 'on'}.` }),
    };
  });

  const badges = data.overview.badges;
  return {
    me: data.me,
    staffName: staff.name,
    staffInitials: data.me.initials,
    staffMeta: `${staff.role} · ${staff.twoFactor ? '2-STEP ON' : '2-STEP OFF'} · ACTIONS AUDIT-LOGGED`,
    menuOpen: state.menuOpen,
    toggleMenu: () => set((current) => ({ ...current, menuOpen: !current.menuOpen })),
    signOut: () => ctx.run('signout', async () => {
      await ctx.api.post('/api/auth/sign-out');
      window.location.assign('/');
    }, { reloadAfter: false }),

    navItems: NAV.map(([key, label, iconPath]) => ({
      label,
      iconPath,
      badge: badges[key] || null,
      go: () => go(key),
      bg: section === key ? COLORS.clay : 'transparent',
      fg: section === key ? COLORS.ink : COLORS.cream,
      current: section === key ? 'page' : 'false',
    })),

    isOverview: section === 'overview',
    kpis: data.overview.kpis.map((kpi) => ({ ...kpi, deltaColor: kpi.good === true ? COLORS.sage : kpi.good === false ? COLORS.clayLight : 'rgba(247,241,230,0.6)' })),
    attention: data.overview.attention.map((item) => ({ ...item, go: () => (item.href ? window.location.assign(item.href) : go(item.section)) })),
    allClear: data.overview.attention.length === 0,

    isModeration: section === 'moderation',
    reports,
    noReports: reports.length === 0,

    isCases: section === 'cases',
    cases,
    noCases: cases.length === 0,

    isUsers: section === 'users',
    users,
    noUsers: users.length === 0,
    search: state.search,
    setSearch: (event) => set((current) => ({ ...current, search: event.target.value })),
    searchKey: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        go('users', state.search.trim() ? `&q=${encodeURIComponent(state.search.trim())}` : '');
      }
    },

    isVerify: section === 'verify',
    verifications,
    noVerifications: verifications.length === 0,

    isContent: section === 'content',
    posts,

    isSettings: section === 'settings',
    settings,
    settingsNote: staff.isAdmin ? 'Changes apply within 30 seconds and are audit-logged.' : 'Only administrators can change these switches.',
  };
}
