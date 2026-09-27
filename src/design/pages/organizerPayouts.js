// Organizer payouts: withdraw released ticket money and follow what is still
// held. Withdrawals are checked and sent by the server; with two-step
// verification on, a texted code is asked for first.

import { COLORS, withStepUp } from './shared';
import { CURRENCIES, formatMoney, parseMoneyInput } from '@/shared/money';

export const initialState = { open: false, amount: '', methodId: null };

export function stateFrom(data) {
  return { methodId: data.methods.find((method) => method.isDefault)?.id || data.methods[0]?.id || null };
}

const TONES = {
  in: { bg: '#E4EBDD', fg: '#3E5234' },
  out: { bg: COLORS.sand, fg: COLORS.ink },
  pending: { bg: '#FBEED8', fg: '#7A3E0F' },
  failed: { bg: '#F4D9D5', fg: COLORS.red },
};

export function values(state, set, ctx) {
  const { data } = state;
  const { currency } = data;
  const method = data.methods.find((item) => item.id === state.methodId);
  const minor = parseMoneyInput(state.amount, currency);
  const net = minor != null && data.fee != null ? minor - data.fee : null;

  const withdraw = async () => {
    if (!data.methods.length) return ctx.toast('Add a mobile money or bank account in Settings first.', 'err');
    if (minor == null || minor <= 0) return ctx.toast('Enter the amount to withdraw.', 'err');
    if (data.fee != null && minor <= data.fee) return ctx.toast(`Withdraw more than the ${data.feeLabel} fee.`, 'err');
    if (minor > data.available) return ctx.toast(`You have ${data.availableLabel} available.`, 'err');
    const sure = await ctx.ask({
      title: `Withdraw ${formatMoney(minor, currency)}?`,
      body: `${formatMoney(net, currency)} goes to ${method.label} after the ${data.feeLabel} fee. Finance sends withdrawals in the next payout batch.`,
      input: false,
      confirmLabel: 'Withdraw',
    });
    if (!sure) return undefined;
    return ctx.run('withdraw', () => withStepUp(ctx, (code) => ctx.api.post('/api/earnings/withdrawals', { currency, amount: state.amount, methodId: method.id, code }, { idempotent: true })), {
      success: (result) => (result ? `Withdrawal ${result.reference} requested. We will tell you when it is sent.` : null),
    }).then((result) => {
      if (result) set((current) => ({ ...current, open: false, amount: '' }));
    });
  };

  const hasMoney = data.available > 0;
  return {
    me: data.me,
    currency,
    currencyTabs: data.currencies.length > 1
      ? data.currencies.map((code) => ({ code, href: `/organizer-payouts?currency=${code}`, bg: code === currency ? COLORS.forest : COLORS.paper, fg: code === currency ? COLORS.cream : COLORS.ink }))
      : [],
    hasTabs: data.currencies.length > 1,

    flow: [
      { step: '1 · BUYERS PAY', label: 'Ticket + fee', desc: `Buyers pay the ${data.serviceFeePercent}% service fee on top of your price.`, bg: COLORS.paper, fg: COLORS.ink },
      { step: '2 · HELD', label: 'In escrow', desc: 'Refunds and open cases are paid from here first.', bg: COLORS.sand, fg: COLORS.ink },
      { step: '3 · RELEASED', label: `${data.releaseHours}h after`, desc: 'The event ends, and the full ticket price moves to your balance.', bg: COLORS.forest, fg: COLORS.cream },
      { step: '4 · WITHDRAW', label: 'To you', desc: data.feeLabel ? `Mobile money or bank, ${data.feeLabel} flat per withdrawal.` : 'Mobile money or bank.', bg: COLORS.clay, fg: COLORS.ink },
    ],

    availableLabel: data.availableLabel,
    lastRelease: data.lastRelease || 'released ticket money lands here',
    canWithdraw: hasMoney && data.fee != null,
    noWithdraw: !(hasMoney && data.fee != null),
    noWithdrawNote: data.fee == null ? `Withdrawals are not available in ${currency} yet.` : 'Nothing to withdraw yet.',
    toggleWithdraw: () => set((current) => ({ ...current, open: !current.open })),
    withdrawOpen: state.open,
    withdrawLabel: state.open ? 'Close' : 'Withdraw',
    amount: state.amount,
    setAmount: (event) => set((current) => ({ ...current, amount: event.target.value })),
    fillAll: () => set((current) => ({ ...current, amount: (data.available / 10 ** (CURRENCIES[currency]?.exponent ?? 2)).toFixed(CURRENCIES[currency]?.exponent ?? 2) })),
    netNote: net != null && net > 0 ? `${formatMoney(net, currency)} arrives after the ${data.feeLabel} fee` : `A flat ${data.feeLabel || '—'} fee per withdrawal`,
    methods: data.methods.map((item) => ({
      label: item.label,
      tag: item.isDefault ? 'DEFAULT' : '',
      pick: () => set((current) => ({ ...current, methodId: item.id })),
      border: item.id === state.methodId ? COLORS.clay : 'rgba(247,241,230,0.35)',
      bg: item.id === state.methodId ? 'rgba(217,122,59,0.2)' : 'transparent',
      on: item.id === state.methodId,
    })),
    hasMethods: data.methods.length > 0,
    noMethods: data.methods.length === 0,
    withdraw,
    sendLabel: state.busy?.withdraw ? 'Requesting…' : 'Request withdrawal',

    heldLabel: data.heldLabel,
    heldNote: data.heldCount
      ? `${data.heldCount} event${data.heldCount === 1 ? '' : 's'} waiting for release`
      : 'Nothing held right now',
    schedule: data.schedule.map((row) => ({ ...row, mark: row.frozen ? '!' : '◷', mBg: row.frozen ? COLORS.red : COLORS.forest, mFg: COLORS.cream })),
    hasSchedule: data.schedule.length > 0,
    noSchedule: data.schedule.length === 0,

    history: data.history.map((row) => ({ ...row, chipBg: TONES[row.tone].bg, chipFg: TONES[row.tone].fg, amountColor: row.tone === 'in' ? '#3E5234' : COLORS.ink })),
    hasHistory: data.history.length > 0,
    noHistory: data.history.length === 0,
    statementHref: `/api/earnings/statement?currency=${currency}`,
    hasEvents: data.hasEvents,
  };
}
