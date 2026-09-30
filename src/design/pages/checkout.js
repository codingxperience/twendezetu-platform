// Ticket checkout. Totals shown here use the same formula as the server
// (src/server/services/checkout.js); the server recomputes everything when
// the order is placed, so the browser can never set a price.

import { convert, formatMoney, percentOf } from '@/shared/money';
import { COLORS, EMAIL_PATTERN, nextCurrency, withStepUp } from './shared';

export const initialState = {
  qty: {},
  method: 'CARD',
  currency: null,
  promoValue: '',
  promo: null,
  promoMessage: null,
  buyerName: '',
  buyerEmail: '',
  payError: null,
  group: false,
  guests: ['', ''],
  result: null,
  waitlisted: {},
};

export function stateFrom(data, params = {}) {
  const firstOpen = data.tiers.find((tier) => tier.kind === 'ONLINE' && tier.remaining !== 0);
  return {
    qty: firstOpen ? { [firstOpen.id]: 1 } : {},
    currency: data.event.currency,
    buyerName: data.me.name || '',
    buyerEmail: data.me.email || '',
    promoValue: params.promo || '',
    result: data.order ? { ...data.order, fromReturn: true } : null,
    method: data.paymentMode === 'unavailable' && data.me.signedIn ? 'POINTS' : 'CARD',
  };
}

function discountFor(promo, subtotal) {
  if (!promo || subtotal < promo.minSubtotalMinor) return 0;
  return promo.kind === 'PERCENT' ? percentOf(subtotal, promo.value) : Math.min(promo.value, subtotal);
}

export function values(state, set, ctx) {
  const { data } = state;
  const { event } = data;
  const money = (minor) => formatMoney(minor, event.currency);
  const online = data.tiers.filter((tier) => tier.kind === 'ONLINE');
  const items = online.filter((tier) => state.qty[tier.id]).map((tier) => ({ tierId: tier.id, quantity: state.qty[tier.id] }));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = online.reduce((sum, tier) => sum + (state.qty[tier.id] || 0) * tier.priceMinor, 0);
  const discount = discountFor(state.promo, subtotal);
  const fee = state.method === 'DOOR' ? 0 : percentOf(subtotal - discount, data.feeBps);
  const total = subtotal - discount + fee;
  const displayCurrency = state.currency || event.currency;
  const alt = displayCurrency === event.currency ? (event.currency === 'USD' ? 'KES' : 'USD') : displayCurrency;
  const points = Math.ceil(convert(total, event.currency, 'PTS', data.rates));

  const setQty = (tier, delta) => () =>
    set((current) => {
      const next = Math.max(0, Math.min(10, (current.qty[tier.id] || 0) + delta));
      const totalOthers = Object.entries(current.qty).filter(([id]) => id !== tier.id).reduce((sum, [, value]) => sum + value, 0);
      if (tier.remaining != null && next > tier.remaining) return { ...current, payError: `Only ${tier.remaining} ${tier.name} left.` };
      if (next + totalOthers > 10) return { ...current, payError: 'You can buy up to 10 tickets at a time.' };
      return { ...current, qty: { ...current.qty, [tier.id]: next }, payError: null };
    });

  const tiers = data.tiers.map((tier) => {
    const soldOut = tier.kind === 'ONLINE' && tier.remaining === 0;
    const door = tier.kind === 'DOOR';
    const waitlisted = Boolean(state.waitlisted[tier.id]);
    return {
      name: tier.name,
      tag: tier.tag || (tier.remaining != null && tier.remaining > 0 && tier.remaining <= 10 ? `${tier.remaining} LEFT` : false),
      desc: door ? `${tier.desc} — not sold online.` : tier.desc,
      was: tier.compareAtMinor ? money(tier.compareAtMinor) : false,
      price: money(tier.priceMinor),
      qty: state.qty[tier.id] || 0,
      plus: setQty(tier, 1),
      minus: setQty(tier, -1),
      soldOut: soldOut,
      available: !soldOut && !door,
      opacity: soldOut || door ? 0.6 : 1,
      wlLabel: waitlisted ? '✓ ON WAITLIST' : 'JOIN WAITLIST',
      wlBg: waitlisted ? COLORS.sage : COLORS.clay,
      wlFg: COLORS.cream,
      waitlist: async () => {
        if (waitlisted) return;
        let email = data.me.email;
        if (!email) email = await ctx.ask({ title: 'Join the waitlist', body: `We'll email you if ${tier.name} tickets come back.`, placeholder: 'you@example.com', type: 'email', autoComplete: 'email' });
        if (!email) return;
        ctx.run(`wl-${tier.id}`, async () => {
          await ctx.api.post(`/api/events/${event.slug}/waitlist`, { tierId: tier.id, email: data.me.email ? undefined : email });
          set((current) => ({ ...current, waitlisted: { ...current.waitlisted, [tier.id]: true } }));
        }, { success: 'You are on the waitlist.', reloadAfter: false });
      },
    };
  });

  const mkMethod = (id, title, desc) => ({
    title,
    desc,
    pick: () => set((current) => ({ ...current, method: id, payError: null })),
    bg: state.method === id ? COLORS.forest : COLORS.paper,
    fg: state.method === id ? COLORS.cream : COLORS.ink,
    shadow: state.method === id ? `4px 4px 0 ${COLORS.clay}` : 'none',
  });
  const methods = [
    ...(data.paymentMode !== 'unavailable' ? [mkMethod('CARD', 'Pay online', data.paymentMode === 'test' ? 'Card (test mode — nothing is charged). Instant QR ticket.' : 'Card on a secure Stripe page. Instant QR ticket.')] : []),
    mkMethod('POINTS', 'Twende points', data.me.signedIn ? `You have ${data.points.toLocaleString('en-US')} points. This order needs ${points.toLocaleString('en-US')}.` : 'Sign in to use your wallet, or let family abroad top you up.'),
    mkMethod('DOOR', 'Pay at door', 'Reserve now, pay the organizer on arrival. No platform fee.'),
  ];

  const lines = online
    .filter((tier) => state.qty[tier.id])
    .map((tier) => ({ label: `${tier.name} × ${state.qty[tier.id]}`, amount: money(state.qty[tier.id] * tier.priceMinor) }));

  const applyPromo = () => {
    const code = state.promoValue.trim().toUpperCase();
    if (!code) return;
    if (!items.length) {
      set((current) => ({ ...current, payError: 'Pick a ticket first, then apply the code.' }));
      return;
    }
    ctx.run('promo', async () => {
      const quote = await ctx.api.post(`/api/events/${event.slug}/quote`, { items, promoCode: code, channel: state.method });
      set((current) => ({ ...current, promo: quote.promo, promoMessage: quote.promoMessage, payError: quote.promo ? null : quote.promoMessage }));
      return quote;
    }, { reloadAfter: false, success: (quote) => (quote.promo ? `Code ${quote.promo.code} applied.` : null) });
  };

  const pay = () => {
    if (!count) return set((current) => ({ ...current, payError: 'Pick at least one ticket above.' }));
    if (!data.me.signedIn && !state.buyerName.trim()) return set((current) => ({ ...current, payError: 'Add your name — it goes on the ticket.' }));
    if (!data.me.signedIn && !EMAIL_PATTERN.test(state.buyerEmail.trim())) return set((current) => ({ ...current, payError: 'We need a valid email to send your QR ticket.' }));
    if (state.method === 'POINTS' && !data.me.signedIn) {
      window.location.assign(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return undefined;
    }
    return ctx.run('pay', async () => {
      const result = await withStepUp(ctx, (code) =>
        ctx.api.post(`/api/events/${event.slug}/orders`, {
          items,
          promoCode: state.promo?.code,
          channel: state.method,
          buyerName: data.me.signedIn ? undefined : state.buyerName.trim(),
          buyerEmail: data.me.signedIn ? undefined : state.buyerEmail.trim(),
          guestNames: state.group ? state.guests.map((name) => name.trim()) : undefined,
          ref: ctx.params.r || undefined,
          source: ctx.params.src || undefined,
          code,
        }, { idempotent: true }),
      );
      if (!result) return undefined;
      if (result.order.redirectUrl) return { redirectUrl: result.order.redirectUrl };
      set((current) => ({ ...current, result: { ...result.order, email: data.me.email || state.buyerEmail.trim(), name: data.me.name || state.buyerName.trim() } }));
      // Keep the order in the address bar so a reload (or a bookmark) shows it again.
      const url = new URL(window.location.href);
      url.searchParams.set('order', result.order.reference);
      if (result.order.accessKey) url.searchParams.set('key', result.order.accessKey);
      window.history.replaceState(null, '', url);
      return result;
    }, { reloadAfter: false });
  };

  const result = state.result;
  const paid = Boolean(result && ['PAID', 'RESERVED'].includes(result.status));
  const firstName = String(result?.name || state.buyerName || 'friend').split(' ')[0];

  return {
    me: data.me,
    eventTitle: event.title,
    dateLine: event.dateLine,
    venue: event.venue,
    testMode: data.paymentMode === 'test',
    exitHref: `/events/${event.slug}`,
    signInHref: `/sign-in?next=${encodeURIComponent(`/checkout?event=${event.slug}`)}`,
    incentive: data.incentive,
    tiers,
    methods,
    lines: lines.length ? lines : [{ label: 'No tickets selected', amount: '—' }],
    feePct: `${data.feeBps / 100}%`,
    feeAmount: money(fee),
    promoApplied: discount > 0,
    promoAmount: money(discount),
    promoValue: state.promoValue,
    promoInput: (e) => set((current) => ({ ...current, promoValue: e.target.value, promo: null })),
    applyPromo,
    total: money(total),
    totalAlt: formatMoney(convert(total, event.currency, alt, data.rates), alt, { cents: false }),
    currency: displayCurrency,
    cycleCurrency: () => set((current) => ({ ...current, currency: nextCurrency(current.currency || event.currency) })),
    payLabel: state.method === 'DOOR' ? 'Reserve — pay at door →' : state.method === 'POINTS' ? `Pay ${points.toLocaleString('en-US')} points →` : `Pay ${money(total)} →`,
    pay,
    paying: Boolean(state.busy?.pay),
    notPaid: !paid,
    paid,
    groupOpen: state.group,
    groupBg: state.group ? COLORS.clay : COLORS.sand,
    groupKnob: state.group ? '26px' : '2px',
    toggleGroup: () => set((current) => ({ ...current, group: !current.group, guests: current.guests.length >= Math.max(2, count) ? current.guests : Array.from({ length: Math.max(2, count) }, (_v, i) => current.guests[i] || '') })),
    guestCount: Math.max(count, state.guests.filter((name) => name.trim()).length),
    guestRows: state.guests.map((name, index) => ({
      n: index + 1,
      name,
      ph: index === 0 ? 'Guest 1 (you)' : `Guest ${index + 1} — name for their QR`,
      set: (e) => set((current) => ({ ...current, guests: current.guests.map((guest, i) => (i === index ? e.target.value : guest)) })),
    })),
    splitPay: () => {
      if (!data.me.signedIn) {
        window.location.assign(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const tier = online.find((candidate) => state.qty[candidate.id]) || online[0];
      const guests = state.guests.slice(1).map((name) => name.trim()).filter(Boolean).map((name) => ({ name }));
      if (!guests.length) {
        set((current) => ({ ...current, payError: 'Name at least one other guest to split with.' }));
        return;
      }
      ctx.run('split', async () => {
        const { split } = await ctx.api.post('/api/splits', { eventSlug: event.slug, tierId: tier.id, guests });
        window.location.assign(split.href);
      }, { reloadAfter: false });
    },
    buyerName: state.buyerName,
    setBuyerName: (e) => set((current) => ({ ...current, buyerName: e.target.value, payError: null })),
    buyerEmail: state.buyerEmail,
    setBuyerEmail: (e) => set((current) => ({ ...current, buyerEmail: e.target.value, payError: null })),
    guestNote: data.me.signedIn
      ? `Signed in as ${data.me.name}. Tickets land in My Twende and your email.`
      : 'Welcome! No account needed — your QR tickets go to the email below.',
    buyerHint: data.me.signedIn ? 'Your tickets, QR codes and reminders sync to My Twende.' : 'We only use your email for the tickets and event updates.',
    payError: state.payError,
    paidTitle: result?.status === 'RESERVED' ? `✓ Reserved — Welcome, ${firstName}!` : `✓ Paid — Welcome, ${firstName}!`,
    ticketLine: result
      ? `ORDER ${result.reference}${result.tickets?.length ? ` · ${result.tickets.map((ticket) => ticket.code).join(' · ')}` : ''} · SENT TO ${String(result.email || '').toUpperCase()}`
      : '',
    paidTickets: (result?.tickets || []).map((ticket) => ({
      ...ticket,
      qr: `/api/tickets/${ticket.code}/qr${result.accessKey ? `?key=${encodeURIComponent(result.accessKey)}` : ''}`,
    })),
    afterNote: data.me.signedIn
      ? 'Tickets land in My Twende and your email, each with a QR for the door. Reminders go out before the event.'
      : 'Your tickets and their QR codes go to your email. Reminders go out before the event.',
    paidNote: result?.status === 'RESERVED'
      ? 'Your place is held. Pay the organizer at the gate — show your code on arrival.'
      : `Show the QR at the door. The money is held in platform escrow and released to the organizer after the event.${result?.mode === 'test' ? ' Test mode: no card was charged.' : ''}`,
  };
}
