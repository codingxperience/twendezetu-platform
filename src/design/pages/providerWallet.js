// The business wallet: withdraw earnings, move them to points, read the ledger.

import { CURRENCIES, formatMoney, parseMoneyInput } from '@/shared/money';
import { COLORS, withStepUp } from './shared';

const FILTERS = [
  ['ALL', 'ALL'],
  ['JOBS', 'JOBS'],
  ['TICKETS', 'TICKETS'],
  ['ESCROW', 'ESCROW'],
  ['PAYOUTS', 'PAYOUTS'],
  ['FEES', 'FEES'],
];

export const initialState = { panel: null, confirming: false, wAmount: '', pAmount: '', methodId: null, filter: 'ALL' };

export function stateFrom(data) {
  return { methodId: data.methods.find((method) => method.isDefault)?.id || data.methods[0]?.id || null };
}

export function values(state, set, ctx) {
  const { data } = state;
  const { currency } = data;
  const exponent = CURRENCIES[currency]?.exponent ?? 2;
  const money = (minor) => formatMoney(minor, currency);
  const method = data.methods.find((item) => item.id === state.methodId);
  const wMinor = parseMoneyInput(state.wAmount, currency);
  const pMinor = parseMoneyInput(state.pAmount, currency);

  const openPanel = (panel) => set((current) => ({ ...current, panel: current.panel === panel ? null : panel, confirming: false }));

  const reviewWithdraw = () => {
    if (wMinor == null || wMinor <= 0) return ctx.toast('Enter the amount to withdraw.', 'err');
    if (data.fee != null && wMinor <= data.fee) return ctx.toast(`Withdraw more than the ${data.feeLabel} fee.`, 'err');
    if (wMinor > data.available) return ctx.toast(`You have ${data.availableLabel} available.`, 'err');
    if (!method) return ctx.toast('Choose where the money goes.', 'err');
    return set((current) => ({ ...current, confirming: true }));
  };

  const confirmWithdraw = () =>
    ctx.run('withdraw', () => withStepUp(ctx, (code) => ctx.api.post('/api/earnings/withdrawals', { currency, amount: state.wAmount, methodId: method.id, code }, { idempotent: true })), {
      success: (result) => (result ? `Withdrawal ${result.reference} requested. You will be told when it is sent.` : null),
    }).then((result) => {
      if (result) set((current) => ({ ...current, panel: null, confirming: false, wAmount: '' }));
    });

  const confirmPoints = async () => {
    if (pMinor == null || pMinor <= 0) return ctx.toast('Enter the amount to move.', 'err');
    if (pMinor > data.available) return ctx.toast(`You have ${data.availableLabel} available.`, 'err');
    const sure = await ctx.ask({
      title: `Move ${money(pMinor)} to points?`,
      body: 'It leaves your business earnings and lands in your personal points wallet, ready to spend on tickets, bookings or pools. There is no fee, and it cannot be moved back.',
      input: false,
      confirmLabel: 'Move to points',
    });
    if (!sure) return undefined;
    return ctx.run('points', () => withStepUp(ctx, (code) => ctx.api.post('/api/earnings/points', { currency, amount: state.pAmount, code }, { idempotent: true })), {
      success: (result) => (result ? `${result.points.toLocaleString('en-US')} points are in your wallet.` : null),
    }).then((result) => {
      if (result) set((current) => ({ ...current, panel: null, pAmount: '' }));
    });
  };

  const rates = data.pointsPerUnit;
  const activity = data.activity.filter((row) => state.filter === 'ALL' || row.type === state.filter);
  const change = data.monthChange;

  return {
    me: data.me,
    businessUpper: data.businessName.toUpperCase(),
    currency,
    availFmt: data.availableLabel,
    availNote: data.availableUsd ? `≈ ${data.availableUsd} · after the platform fee` : 'after the platform fee',
    hasOtherBalances: data.otherBalances.length > 0,
    otherBalances: data.otherBalances.join(' · '),
    escrowLabel: data.escrowLabel,
    escrowNote: data.escrowCount ? `${data.escrowCount} ${data.escrowCount === 1 ? 'job' : 'jobs'} · released after the job` : 'nothing held right now',
    monthLabel: data.monthLabel,
    monthNote: `${data.monthJobs} ${data.monthJobs === 1 ? 'release' : 'releases'}${change == null ? '' : ` · ${change >= 0 ? '+' : ''}${change}% vs ${data.lastMonthName.toLowerCase()}`}`,

    withdrawOpen: state.panel === 'withdraw' && !state.confirming,
    confirmOpen: state.panel === 'withdraw' && state.confirming,
    pointsOpen: state.panel === 'points',
    toggleWithdraw: () => openPanel('withdraw'),
    toPoints: () => openPanel('points'),
    wAmount: state.wAmount,
    setWAmount: (event) => set((current) => ({ ...current, wAmount: event.target.value })),
    noMethods: data.methods.length === 0,
    destinations: data.methods.map((item) => ({
      label: item.label,
      selected: item.id === state.methodId,
      border: item.id === state.methodId ? COLORS.clayLight : 'rgba(247,241,230,0.4)',
      bg: item.id === state.methodId ? 'rgba(217,122,59,0.2)' : 'rgba(247,241,230,0.08)',
      pick: () => set((current) => ({ ...current, methodId: item.id })),
    })),
    reviewWithdraw,
    confirmSummary: wMinor && method ? `${money(wMinor)} out of your earnings. ${method.label} receives ${money(wMinor - (data.fee || 0))} after the ${data.feeLabel} fee.` : '',
    confirmNote: `Finance sends withdrawals in the next payout batch · with two-step verification on, we text you a code first`,
    confirmWithdraw,
    cancelWithdraw: () => set((current) => ({ ...current, confirming: false })),

    pAmount: state.pAmount,
    setPAmount: (event) => set((current) => ({ ...current, pAmount: event.target.value })),
    pointsPreview: pMinor && rates ? `≈ ${Math.floor((pMinor / 10 ** exponent) * rates).toLocaleString('en-US')} points at today's rate (1 point = 1 US cent). No fee.` : '1 point = 1 US cent at today\'s rate. No fee.',
    confirmPoints,

    hasPending: data.pending.length > 0,
    pending: data.pending,
    commission: `${data.fees.commissionPercent}%`,
    membershipFee: data.fees.membership,
    withdrawFee: data.feeLabel || '—',

    filters: FILTERS.map(([key, label]) => ({ label, selected: state.filter === key, bg: state.filter === key ? COLORS.forest : COLORS.paper, fg: state.filter === key ? COLORS.cream : COLORS.ink, pick: () => set((current) => ({ ...current, filter: key })) })),
    activity: activity.map((row) => ({
      ...row,
      iconBg: row.in === true ? '#DCE8D9' : row.in === false ? COLORS.sand : '#FBEED8',
      color: row.in === true ? COLORS.forest : row.in === false ? COLORS.rust : COLORS.muted,
    })),
    noActivity: activity.length === 0,
    emptyText: state.filter === 'ALL' ? 'Nothing yet. When a booking you completed is released from escrow, the money shows up here.' : 'Nothing of this kind yet.',
    shownCount: `${activity.length} ${activity.length === 1 ? 'ENTRY' : 'ENTRIES'}`,
    statementHref: `/api/earnings/statement?currency=${currency}`,
  };
}
