// Split pay. Each seat is paid on its own: members can use points or a card,
// people without an account pay by card. Money only moves on the server.

import { COLORS, EMAIL_PATTERN, copyText, shareLinks, withStepUp } from './shared';

export const initialState = { paying: null, email: '', copied: false, now: null };

export function onMount(ctx, set) {
  // The hold countdown ticks once a minute.
  set((state) => ({ ...state, now: Date.now() }));
  const timer = window.setInterval(() => set((state) => ({ ...state, now: Date.now() })), 60_000);
  return () => window.clearInterval(timer);
}

function timeLeft(expiresAt, now) {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return 'hold ended';
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `seats held ${hours ? `${hours}h ` : ''}${minutes}m more`;
}

const STATUS_NOTES = {
  COMPLETED: 'Everyone has paid. Every seat has its own QR ticket.',
  EXPIRED: 'The hold has ended. Everyone who paid keeps their ticket; unpaid seats go back on sale.',
  CANCELLED: 'The hold ended. Everyone who paid keeps their ticket; unpaid seats went back on sale.',
};

export function values(state, set, ctx) {
  const { data } = state;
  const split = data.split;

  if (!split) {
    return {
      me: data.me,
      viewing: false,
      listing: true,
      splits: data.splits.map((item) => ({ ...item, href: `/split-pay?split=${item.slug}`, progress: `${item.paid} of ${item.total} paid · ${item.status.toLowerCase()}` })),
      hasSplits: data.splits.length > 0,
      noSplits: data.splits.length === 0,
    };
  }

  const signedIn = data.me.signedIn;
  const share = shareLinks(data.link, `I've held you a seat at ${split.eventTitle}. Pay your share here:`, split.eventTitle);

  const settle = (result) => {
    if (result?.redirectUrl) {
      window.location.assign(result.redirectUrl);
      return null;
    }
    set((current) => ({ ...current, paying: null }));
    return result?.paid ? 'Paid. The QR ticket is on its way by email.' : null;
  };

  const pay = (position, channel) => {
    if (channel === 'CARD' && !signedIn && !EMAIL_PATTERN.test(state.email.trim())) return ctx.toast('Add your email so we can send the QR ticket.', 'err');
    const body = { channel, email: signedIn ? undefined : state.email.trim() };
    return ctx.run(`pay:${position}`, () => withStepUp(ctx, (code) => ctx.api.post(`/api/splits/${split.slug}/shares/${position}/pay`, { ...body, code }, { idempotent: true })), { success: settle });
  };

  const coverAll = async () => {
    const sure = await ctx.ask({
      title: `Cover the remaining ${split.remaining}?`,
      body: 'Every unpaid seat is paid from your Twende points and its QR ticket is issued. Nobody else is charged.',
      input: false,
      confirmLabel: 'Cover with points',
    });
    if (!sure) return;
    ctx.run('cover', () => withStepUp(ctx, (code) => ctx.api.post(`/api/splits/${split.slug}/cover`, { code }, { idempotent: true })), {
      success: (result) => (result ? `${result.covered} seat${result.covered === 1 ? '' : 's'} covered.` : null),
    });
  };

  const unpaid = split.total - split.paidCount;
  const myShare = split.shares.find((item) => item.mine && item.canPay);
  const statusNote = STATUS_NOTES[split.status] || '';

  return {
    me: data.me,
    viewing: true,
    listing: false,
    title: `${split.eventTitle} — ${split.total} tickets`,
    intro: split.isOrganizer
      ? `You are holding ${split.total} ${split.tierName} seats. Each person pays their own share from the link and gets their own QR ticket as soon as they do.`
      : `${split.organizerName} is holding ${split.total} ${split.tierName} seats. Pick yours below and pay your share; your QR ticket arrives as soon as you do.`,
    holdNote: `Seats are held for up to ${split.lifetimeHours} hours, or until the event starts.`,
    eventHref: `/events/${split.eventSlug}`,

    progressLabel: `${split.paidCount} of ${split.total} paid · ${split.collected} collected`,
    countdown: split.open ? (state.now ? timeLeft(split.expiresAt, state.now) : '') : split.status.toLowerCase(),
    pct: split.pct,
    closed: !split.open,
    isOpen: split.open,
    statusNote,

    guests: split.shares.map((item, index) => {
      const choosing = state.paying === item.position;
      return {
        ...item,
        share: split.share,
        unpaid: !item.paid,
        bg: item.paid ? '#E4EBDD' : item.mine ? '#FBEED8' : COLORS.paper,
        avBg: [COLORS.clay, COLORS.forest, COLORS.sage, COLORS.clayLight, COLORS.sand][index % 5],
        avFg: index % 5 === 1 ? COLORS.cream : COLORS.ink,
        remind: () => ctx.run(`remind:${item.position}`, () => ctx.api.post(`/api/splits/${split.slug}/shares/${item.position}/remind`), { success: 'Reminder sent.' }),
        remindLabel: state.busy?.[`remind:${item.position}`] ? 'SENDING…' : 'REMIND',
        showPay: item.canPay && !choosing,
        payLabel: item.mine ? 'PAY MY SEAT' : 'PAY THIS SEAT',
        pick: () => set((current) => ({ ...current, paying: item.position })),
        choosing,
        canPoints: signedIn,
        needsEmail: !signedIn,
        payPoints: () => pay(item.position, 'POINTS'),
        payCard: () => pay(item.position, 'CARD'),
        cancelPay: () => set((current) => ({ ...current, paying: null })),
        busy: Boolean(state.busy?.[`pay:${item.position}`]),
        email: state.email,
        setEmail: (event) => set((current) => ({ ...current, email: event.target.value })),
      };
    }),
    canCover: split.isOrganizer && split.open && unpaid > 0,
    coverAll,
    coverLabel: `COVER THE REMAINING ${split.remaining}`,
    hasMyShare: Boolean(myShare),
    payMine: () => myShare && set((current) => ({ ...current, paying: myShare.position })),

    link: data.link,
    copyLabel: state.copied ? 'LINK COPIED ✓' : 'COPY THE SPLIT LINK',
    copyShort: state.copied ? '✓' : 'COPY',
    copyLink: async () => {
      if (!(await copyText(data.link))) return ctx.toast('Copy failed. Select the link and copy it by hand.', 'err');
      set((current) => ({ ...current, copied: true }));
      window.setTimeout(() => set((current) => ({ ...current, copied: false })), 2000);
      return undefined;
    },
    waHref: share.waHref,
    smsHref: `sms:?&body=${encodeURIComponent(`Your seat at ${split.eventTitle}: ${data.link}`)}`,
  };
}
