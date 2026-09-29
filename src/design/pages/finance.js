// The finance console. Figures come straight from the ledger; every action
// (releasing escrow, approving a batch, recording a transfer) is checked and
// audit-logged on the server.

import { COLORS } from './shared';

const RANGE_LABELS = { '7d': 'LAST 7 DAYS', '30d': 'LAST 30 DAYS', '90d': 'LAST 90 DAYS' };
const STREAM_COLORS = [COLORS.clay, COLORS.sage, COLORS.clayLight, COLORS.sand, COLORS.cream];
const TYPE_ICONS = { TICKETS: ['T', COLORS.clay], BOOKINGS: ['B', COLORS.sage], MEMBERSHIPS: ['M', COLORS.clayLight], POINTS: ['P', COLORS.sand], PAYOUTS: ['↗', COLORS.cream], REFUNDS: ['R', COLORS.red], OTHER: ['·', COLORS.sand] };
const STATUS_COLORS = { REFUNDED: COLORS.clayLight, 'IN ESCROW': '#E8C872', SETTLED: COLORS.sage };

export const initialState = { menuOpen: false };

export function values(state, set, ctx) {
  const { data } = state;
  const query = (changes) => {
    const next = { range: data.range, filter: data.filter, ...changes };
    return `/finance?range=${next.range}&filter=${next.filter}`;
  };
  const act = (key, path, body, success) => ctx.run(key, () => ctx.api.post(path, body, { idempotent: true }), { success });

  const approveBatch = async () => {
    const sure = await ctx.ask({
      title: `Approve ${data.payouts.count} withdrawal${data.payouts.count === 1 ? '' : 's'}?`,
      body: `${data.payouts.byCurrency.map((row) => row.label).join(' · ')} (about ${data.payouts.total}). Approved withdrawals are then sent from the mobile money and bank accounts, and each one is marked sent with its transfer reference.`,
      input: false,
      confirmLabel: 'Approve the batch',
    });
    if (sure) act('batch', '/api/finance/payouts', undefined, (result) => `Batch ${result.reference} approved: ${result.count} withdrawals.`);
  };

  return {
    me: data.me,
    staffName: data.staff.name,
    staffInitials: data.me.initials,
    staffMeta: `${data.staff.role} · ${data.staff.twoFactor ? '2-STEP ON' : '2-STEP OFF'} · ACTIONS AUDIT-LOGGED`,
    isAdmin: data.staff.isAdmin,
    menuOpen: state.menuOpen,
    toggleMenu: () => set((current) => ({ ...current, menuOpen: !current.menuOpen })),
    signOut: () => ctx.run('signout', async () => {
      await ctx.api.post('/api/auth/sign-out');
      window.location.assign('/');
    }, { reloadAfter: false }),
    exportHref: `/api/finance/ledger?range=${data.range}&filter=${data.filter}`,

    ranges: Object.entries(RANGE_LABELS).map(([key]) => ({
      label: key.toUpperCase(),
      go: () => ctx.navigate(query({ range: key })),
      bg: key === data.range ? COLORS.cream : 'transparent',
      fg: key === data.range ? COLORS.ink : COLORS.cream,
    })),
    rangeLabel: RANGE_LABELS[data.range],

    kpis: data.kpis.map((kpi, index) => ({ ...kpi, bg: index === 1 ? COLORS.clay : COLORS.forest, fg: index === 1 ? COLORS.ink : COLORS.cream })),
    streams: data.streams.map((stream, index) => ({ ...stream, color: STREAM_COLORS[index % STREAM_COLORS.length] })),
    noStreams: data.streams.length === 0,

    ledgerFilters: data.filters.map((key) => ({
      label: key,
      go: () => ctx.navigate(query({ filter: key })),
      bg: key === data.filter ? COLORS.ink : 'transparent',
      fg: key === data.filter ? COLORS.cream : COLORS.ink,
    })),
    ledger: data.ledger.map((row) => {
      const [icon, iconBg] = TYPE_ICONS[row.type] || TYPE_ICONS.OTHER;
      return { ...row, icon, iconBg, statusColor: STATUS_COLORS[row.status] || COLORS.cream };
    }),
    noLedger: data.ledger.length === 0,

    heldBookings: data.held.bookings,
    heldNote: `${data.held.bookingCount} booking${data.held.bookingCount === 1 ? '' : 's'} held until the job is confirmed · ${data.held.tickets} of ticket money waiting for events to end`,
    escrow: data.escrow.map((row) => ({
      ...row,
      held: !row.releasable,
      release: async () => {
        const sure = await ctx.ask({
          title: `Release ${row.local} now?`,
          body: 'The vendor is paid straight away, less the booking commission. Only release early when the customer has confirmed the job some other way.',
          input: false,
          confirmLabel: 'Release',
        });
        if (sure) act(`e:${row.id}`, `/api/finance/escrow/${row.id}/release`, undefined, 'Released to the vendor.');
      },
    })),
    noEscrow: data.escrow.length === 0,

    payoutTotal: data.payouts.total,
    payoutCount: data.payouts.count,
    payoutBreakdown: data.payouts.byCurrency.map((row) => row.label).join(' · ') || 'nothing waiting',
    canApprove: data.payouts.count > 0,
    approveBatch,
    approveLabel: data.payouts.count ? `Approve batch (${data.payouts.count})` : 'Queue is clear',
    approveBg: data.payouts.count ? COLORS.sage : 'rgba(247,241,230,0.2)',

    queue: data.queue.map((payout) => ({
      ...payout,
      approved: payout.status === 'APPROVED',
      statusLabel: payout.status === 'APPROVED' ? 'TO SEND' : 'WAITING FOR BATCH',
      statusColor: payout.status === 'APPROVED' ? '#E8C872' : 'rgba(247,241,230,0.6)',
      markSent: async () => {
        const reference = await ctx.ask({ title: `Mark ${payout.reference} as sent`, body: `${payout.net} to ${payout.destination}. Add the reference from the mobile money or bank statement.`, placeholder: 'Transfer reference', maxLength: 80, confirmLabel: 'Mark sent' });
        if (reference) act(`p:${payout.id}`, `/api/finance/payouts/${payout.id}`, { action: 'paid', externalRef: reference }, 'Marked sent. The member has been told.');
      },
      markFailed: async () => {
        const reason = await ctx.ask({ title: `Return ${payout.reference}?`, body: 'The full amount, fee included, goes back to their balance and they are asked to check their payout details.', placeholder: 'What went wrong', maxLength: 200, confirmLabel: 'Return it', danger: true });
        if (reason) act(`p:${payout.id}`, `/api/finance/payouts/${payout.id}`, { action: 'failed', reason }, 'Returned to their balance.');
      },
    })),
    noQueue: data.queue.length === 0,

    pools: data.pools.map((pool) => ({
      ...pool,
      release: async () => {
        const sure = await ctx.ask({ title: `Release ${pool.points} points?`, body: `“${pool.title}” by ${pool.creator}, from ${pool.contributors} contributor${pool.contributors === 1 ? '' : 's'}. The points move to the creator's wallet and the pool closes.`, input: false, confirmLabel: 'Release' });
        if (sure) act(`pool:${pool.slug}`, `/api/finance/pools/${pool.slug}/release`, undefined, 'Pool released.');
      },
    })),
    hasPools: data.pools.length > 0,
    noPools: data.pools.length === 0,

    pointsLiability: `${data.pointsLiability.usd} owed to members as ${data.pointsLiability.points} points in wallets and pools (1 point = 1 US cent).`,
    currencies: data.currencies,
    noCurrencies: data.currencies.length === 0,

    activeMemberships: data.memberships.active.toLocaleString('en-US'),
    renewSoon: data.memberships.renewSoon.toLocaleString('en-US'),
    lapsed: data.memberships.lapsed.toLocaleString('en-US'),
    canRemind: data.memberships.renewSoon > 0,
    remindLabel: `SEND RENEWAL REMINDERS (${data.memberships.renewSoon}) →`,
    remind: () => act('remind', '/api/finance/renewal-reminders', undefined, (result) => `${result.queued} reminder${result.queued === 1 ? '' : 's'} queued. Anyone reminded this month is skipped.`),
  };
}
