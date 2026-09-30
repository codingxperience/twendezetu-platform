// The points wallet: top up, send, cash out and harambee pools.

import { convert, formatMoney } from '@/shared/money';
import { COLORS, copyText, sentence, withStepUp } from './shared';

const CHIP_AMOUNTS = [100, 500, 1000];
const AVATAR_TONES = [COLORS.clay, COLORS.forest, COLORS.sage, COLORS.sand];

const ICON_TONES = {
  in: { bg: '#DDE5D3', fg: COLORS.forest, color: COLORS.forest },
  out: { bg: COLORS.sand, fg: COLORS.ink, color: COLORS.rust },
};

export const initialState = {
  panel: null,
  topUpUsd: null,
  recipient: '',
  sendNote: '',
  amount: '',
  cashAmount: '',
  methodId: null,
  newPoolOpen: false,
  poolName: '',
  poolGoal: '',
  chipFor: null,
  copied: null,
  paging: null,
};

export function stateFrom(data) {
  return { methodId: data.methods.find((method) => method.isDefault)?.id || data.methods[0]?.id || null };
}

export function onMount() {
  const pool = new URL(window.location.href).searchParams.get('pool');
  if (pool) document.getElementById(`pool-${pool}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const points = (value) => Number(value || 0).toLocaleString('en-US');
const wholePoints = (value) => {
  const number = Number(String(value).replace(/[,\s]/g, ''));
  return Number.isInteger(number) && number > 0 ? number : null;
};

export function values(state, set, ctx) {
  const { data } = state;
  const { limits } = data;
  const currency = data.me.currency || 'USD';
  const togglePanel = (panel) => set((current) => ({ ...current, panel: current.panel === panel ? null : panel, topUpUsd: null }));
  const field = (key) => (event) => set((current) => ({ ...current, [key]: event.target.value }));

  // What the balance is worth: exact in dollars, estimated elsewhere.
  const worth = ['USD', currency, 'KES', 'UGX']
    .filter((code, index, list) => list.indexOf(code) === index && data.rates[code])
    .slice(0, 3)
    .map((code) => (code === 'USD' ? formatMoney(data.balance, 'USD') : `≈ ${formatMoney(convert(data.balance, 'PTS', code, data.rates), code, { cents: false })}`))
    .join(' · ');

  // ── Top up ────────────────────────────────────────────────────────────
  const topUp = () =>
    ctx.run('topup', () => ctx.api.post('/api/wallet/top-ups', { usd: state.topUpUsd }, { idempotent: true }), {
      success: (result) => (result.mode === 'test' ? `Added ${points(result.points)} points (test mode — no card was charged).` : null),
    }).then((result) => {
      if (result && !result.redirectUrl) set((current) => ({ ...current, panel: null, topUpUsd: null }));
    });

  // ── Send ──────────────────────────────────────────────────────────────
  const send = async () => {
    const amount = wholePoints(state.amount);
    const recipient = state.recipient.trim();
    if (!recipient) return ctx.toast('Who is it for? Use their @handle or email.', 'err');
    if (!amount) return ctx.toast('Enter a whole number of points.', 'err');
    if (amount > data.balance) return ctx.toast(`You have ${points(data.balance)} points.`, 'err');
    const sure = await ctx.ask({
      title: `Send ${points(amount)} points?`,
      body: `${formatMoney(amount, 'USD')} of value to ${recipient}. Transfers between members are free and arrive straight away; they cannot be pulled back.`,
      input: false,
      confirmLabel: 'Send points',
    });
    if (!sure) return undefined;
    return ctx.run('send', () => withStepUp(ctx, (code) => ctx.api.post('/api/wallet/transfers', { recipient, points: amount, note: state.sendNote.trim() || undefined, code }, { idempotent: true })), {
      success: (result) => (result ? sentence(`Sent ${points(result.sent)} points to ${result.to}`) : null),
    }).then((result) => {
      if (result) set((current) => ({ ...current, panel: null, recipient: '', sendNote: '', amount: '' }));
    });
  };

  // ── Cash out ──────────────────────────────────────────────────────────
  const cashPoints = wholePoints(state.cashAmount);
  const method = data.methods.find((item) => item.id === state.methodId);
  const cashOut = async () => {
    if (!cashPoints || cashPoints <= limits.cashOutFee) return ctx.toast(`Cash out more than ${limits.cashOutFee} points (the flat fee).`, 'err');
    if (cashPoints > data.balance) return ctx.toast(`You have ${points(data.balance)} points.`, 'err');
    if (!method) return ctx.toast('Choose where the money goes.', 'err');
    const sure = await ctx.ask({
      title: `Cash out ${points(cashPoints)} points?`,
      body: `${formatMoney(cashPoints - limits.cashOutFee, 'USD')} of value goes to ${method.label} after the ${limits.cashOutFee}-point fee. Finance sends it in the next payout batch, in that account's local currency at the day's rate.`,
      input: false,
      confirmLabel: 'Cash out',
    });
    if (!sure) return undefined;
    return ctx.run('cashout', () => withStepUp(ctx, (code) => ctx.api.post('/api/wallet/cash-outs', { points: cashPoints, methodId: method.id, code }, { idempotent: true })), {
      success: (result) => (result ? `Cash-out ${result.reference} requested. We will tell you when it is sent.` : null),
    }).then((result) => {
      if (result) set((current) => ({ ...current, panel: null, cashAmount: '' }));
    });
  };

  // ── Activity ──────────────────────────────────────────────────────────
  // Earlier pages belong to the list they were loaded under; a refresh after
  // any money move starts the list again from the newest line.
  const pageKey = data.activity[0]?.id || 'empty';
  const paging = state.paging?.key === pageKey ? state.paging : { key: pageKey, items: [], cursor: data.nextCursor };
  const allActivity = [...data.activity, ...paging.items];
  const loadMore = () =>
    ctx.run('more', async () => {
      const { activity } = await ctx.api.get(`/api/wallet?cursor=${encodeURIComponent(paging.cursor)}`);
      set((current) => ({ ...current, paging: { key: pageKey, items: [...paging.items, ...activity.items], cursor: activity.nextCursor } }));
    }, { reloadAfter: false });

  // ── Pools ─────────────────────────────────────────────────────────────
  const createPool = () => {
    const title = state.poolName.trim();
    const goal = wholePoints(state.poolGoal);
    if (title.length < 3) return ctx.toast('Name the pool so people know what they are chipping in for.', 'err');
    if (!goal || goal < 100) return ctx.toast('Set a goal of at least 100 points.', 'err');
    return ctx.run('pool', async () => {
      const { pool } = await ctx.api.post('/api/pools', { title, goalPoints: goal });
      set((current) => ({ ...current, newPoolOpen: false, poolName: '', poolGoal: '' }));
      window.history.replaceState(null, '', pool.href);
      return pool;
    }, { success: 'Pool started. Share the link with the family group.' });
  };

  const pools = data.pools.map((pool) => {
    const highlighted = pool.slug === data.highlight;
    const shareUrl = `${data.appUrl}/points-wallet?pool=${pool.slug}`;
    const shareKey = `pool:${pool.slug}`;
    return {
      ...pool,
      anchor: `pool-${pool.slug}`,
      border: highlighted ? COLORS.clay : COLORS.forest,
      shadow: highlighted ? `6px 6px 0 ${COLORS.clay}` : 'none',
      raised: `${points(pool.raised)} pts`,
      goal: `${points(pool.goal)} pts`,
      pct: `${pool.pct}%`,
      barColor: pool.pct >= 100 ? COLORS.sage : COLORS.clay,
      statusBg: pool.status === 'FUNDED' ? '#DDE5D3' : pool.status === 'CLOSING SOON' ? '#FBEED8' : COLORS.paper,
      countLabel: pool.count === 1 ? '1 mchangiaji' : `${pool.count} wachangiaji`,
      contributors: pool.contributors.map((init, index) => {
        const bg = init.startsWith('+') ? COLORS.sand : AVATAR_TONES[index % AVATAR_TONES.length];
        return { init, bg, fg: bg === COLORS.sand ? COLORS.ink : COLORS.cream };
      }),
      canChip: pool.status === 'OPEN' || pool.status === 'CLOSING SOON',
      chipOpen: state.chipFor === pool.slug,
      chipLabel: state.chipFor === pool.slug ? 'Close' : 'Chip in',
      chipBg: state.chipFor === pool.slug ? COLORS.forest : COLORS.clay,
      chipFg: COLORS.cream,
      chipIn: () => set((current) => ({ ...current, chipFor: current.chipFor === pool.slug ? null : pool.slug })),
      chipAmts: CHIP_AMOUNTS.map((amount) => ({
        label: `${points(amount)} PTS`,
        give: () => {
          if (amount > data.balance) return ctx.toast(`You have ${points(data.balance)} points. Top up first.`, 'err');
          return ctx.run(`chip:${pool.slug}`, () => ctx.api.post(`/api/pools/${pool.slug}/contributions`, { points: amount }, { idempotent: true }), {
            success: (result) => (result.raisedPoints >= result.goalPoints ? 'Thank you! That filled the pool.' : `Thank you! ${points(amount)} points in.`),
          });
        },
      })),
      release: async () => {
        const sure = await ctx.ask({ title: `Release ${pool.raised} points?`, body: `Everything in "${pool.title}" moves to your wallet and the pool closes.`, input: false, confirmLabel: 'Release' });
        if (sure) ctx.run(`release:${pool.slug}`, () => ctx.api.post(`/api/pools/${pool.slug}/release`, undefined, { idempotent: true }), { success: (result) => (result.review ? 'Sent to the finance team for review. You will be told when it is released.' : `${points(result.released)} points are in your wallet.`) });
      },
      shareLabel: state.copied === shareKey ? '✓ LINK COPIED' : '⧉ SHARE LINK',
      share: () => {
        copyText(shareUrl);
        set((current) => ({ ...current, copied: shareKey }));
        window.setTimeout(() => set((current) => (current.copied === shareKey ? { ...current, copied: null } : current)), 1800);
      },
    };
  });

  return {
    me: data.me,
    balanceFmt: points(data.balance),
    balanceFmtSmall: points(data.balance),
    equivalents: worth,

    topUpOpen: state.panel === 'topup',
    sendOpen: state.panel === 'send',
    cashOpen: state.panel === 'cash',
    topUpBg: state.panel === 'topup' ? COLORS.clayLight : COLORS.clay,
    topUpFg: state.panel === 'topup' ? COLORS.ink : COLORS.cream,
    sendBg: state.panel === 'send' ? 'rgba(247,241,230,0.18)' : 'transparent',
    cashBg: state.panel === 'cash' ? 'rgba(247,241,230,0.18)' : 'transparent',
    toggleTopUp: () => togglePanel('topup'),
    toggleSend: () => togglePanel('send'),
    toggleCashOut: () => togglePanel('cash'),

    topUpOpts: limits.topUpOptions.map((usd) => ({ label: `$${usd}`, pts: `${points(usd * 100)} PTS`, buy: () => set((current) => ({ ...current, topUpUsd: usd })) })),
    topUpPending: Boolean(state.topUpUsd),
    topUpSummary: state.topUpUsd ? `Pay $${state.topUpUsd}.00 by card and get ${points(state.topUpUsd * 100)} points. No fee on top-ups.` : '',
    confirmTopUp: topUp,
    cancelTopUp: () => set((current) => ({ ...current, topUpUsd: null })),
    topUpNote: 'Paid by card on a secure Stripe page. Nothing is charged until you confirm there.',

    recipient: state.recipient,
    setRecipient: field('recipient'),
    sendNoteVal: state.sendNote,
    setSendNote: field('sendNote'),
    amount: state.amount,
    setAmount: field('amount'),
    confirmSend: send,
    sendNote: `They are told straight away. Free between members, up to ${points(limits.transferMax)} points at a time.`,

    noMethods: data.methods.length === 0,
    hasMethods: data.methods.length > 0,
    cashAmount: state.cashAmount,
    setCashAmount: field('cashAmount'),
    cashDests: data.methods.map((item) => ({
      label: item.label,
      selected: item.id === state.methodId,
      border: item.id === state.methodId ? COLORS.clayLight : 'rgba(247,241,230,0.4)',
      bg: item.id === state.methodId ? 'rgba(217,122,59,0.2)' : 'rgba(247,241,230,0.08)',
      pick: () => set((current) => ({ ...current, methodId: item.id })),
    })),
    cashConfirmLabel: cashPoints && method ? `Cash out ${points(cashPoints)} pts → ${method.label}` : 'Cash out',
    confirmCashOut: cashOut,
    cashNote: `Flat fee ${limits.cashOutFee} points. Finance sends cash-outs in the next payout batch, in your account's local currency at the day's rate.`,

    hasPending: data.pendingCashOuts.length > 0,
    pendingCashOuts: data.pendingCashOuts.map((payout) => ({ ...payout, pointsLabel: `${points(payout.points)} pts` })),

    activity: allActivity.map((item) => {
      const tone = item.amount > 0 ? ICON_TONES.in : ICON_TONES.out;
      return {
        ...item,
        iconBg: tone.bg,
        iconFg: tone.fg,
        color: tone.color,
        amount: `${item.amount > 0 ? '+' : '−'}${points(Math.abs(item.amount))}`,
      };
    }),
    noActivity: allActivity.length === 0,
    hasMore: Boolean(paging.cursor),
    noMore: !paging.cursor && allActivity.length > 0,
    activityCount: `${allActivity.length} MOVEMENT${allActivity.length === 1 ? '' : 'S'}`,
    loadMore,
    loadingMore: Boolean(state.busy?.more),

    newPoolOpen: state.newPoolOpen,
    newPoolBg: state.newPoolOpen ? COLORS.forest : COLORS.paper,
    newPoolFg: state.newPoolOpen ? COLORS.cream : COLORS.ink,
    toggleNewPool: () => set((current) => ({ ...current, newPoolOpen: !current.newPoolOpen })),
    poolName: state.poolName,
    setPoolName: field('poolName'),
    poolGoal: state.poolGoal,
    setPoolGoal: field('poolGoal'),
    createPool,
    pools,
    noPools: pools.length === 0,
    poolReviewNote: data.poolReview ? 'Pools over $1,000 are checked by the finance team before they are released.' : '',
  };
}
