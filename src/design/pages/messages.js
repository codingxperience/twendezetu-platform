// Messages: masked conversations, formal offers and the bookings they lead to.

import { COLORS, sentence, withStepUp } from './shared';

const POLL_MS = 8000;

const REPORT_REASONS = [
  ['OFF_PLATFORM_PAYMENT', 'Asked me to pay outside Twendezetu'],
  ['SCAM', 'Looks like a scam'],
  ['HARASSMENT', 'Harassment or abuse'],
  ['IMPERSONATION', 'Pretending to be someone else'],
  ['SPAM', 'Spam'],
  ['OTHER', 'Something else'],
];

const OFFER_STATUS = {
  ACCEPTED: '✓ ACCEPTED',
  DECLINED: 'DECLINED',
  WITHDRAWN: 'WITHDRAWN BY THE VENDOR',
  EXPIRED: 'EXPIRED',
  COUNTERED: 'COUNTER-OFFER SENT · WAITING FOR A REVISED PRICE',
};

const BOOKING_TONES = {
  PENDING_PAYMENT: COLORS.sand,
  ESCROWED: COLORS.clayLight,
  RELEASED: '#C9D3BF',
  DISPUTED: '#F2C9C2',
  CANCELLED: COLORS.sand,
  REFUNDED: COLORS.sand,
};

export const initialState = { draft: '', counterFor: null, counterVal: '', reportOpen: false, mobileView: 'list' };

export function stateFrom(data, params = {}) {
  return { mobileView: params.thread && data.active ? 'thread' : 'list' };
}

function scrollToLatest() {
  window.requestAnimationFrame(() => {
    const scroller = document.getElementById('message-scroll');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
}

function currentThreadParam() {
  return new URL(window.location.href).searchParams.get('thread');
}

// A fingerprint of what is on screen, so polling only re-renders on change.
function fingerprint(data) {
  const last = data.active?.messages.at(-1);
  return [data.threads.map((thread) => `${thread.id}:${thread.time}:${thread.unread}`).join('|'), last?.id, data.booking?.status, data.active?.messages.map((m) => m.offer?.status).join('')].join('#');
}

async function fetchView(ctx, threadId) {
  return ctx.api.get(`/api/views/messages${threadId ? `?thread=${encodeURIComponent(threadId)}` : ''}`);
}

export function onMount(ctx, set) {
  scrollToLatest();

  // New messages arrive by polling while the tab is visible.
  let last = null;
  const poll = async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      const fresh = await fetchView(ctx, currentThreadParam());
      const print = fingerprint(fresh);
      if (print === last) return;
      last = print;
      set((state) => {
        if (fingerprint(state.data) === print) return state;
        const grew = (fresh.active?.messages.length || 0) > (state.data.active?.messages.length || 0) && fresh.active?.id === state.data.active?.id;
        if (grew) scrollToLatest();
        return { ...state, data: fresh };
      });
    } catch {
      // A missed poll is harmless; the next one catches up.
    }
  };
  const timer = window.setInterval(poll, POLL_MS);
  document.addEventListener('visibilitychange', poll);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', poll);
  };
}

export function values(state, set, ctx) {
  const { data } = state;
  const { active, booking } = data;

  const load = async (threadId, { scroll = true } = {}) => {
    const fresh = await fetchView(ctx, threadId);
    set((current) => ({ ...current, data: fresh }));
    if (scroll) scrollToLatest();
    return fresh;
  };

  const openThread = (thread) =>
    ctx.run(`open:${thread.id}`, async () => {
      const url = new URL(window.location.href);
      url.searchParams.set('thread', thread.id);
      window.history.replaceState(null, '', url);
      set((current) => ({ ...current, mobileView: 'thread', counterFor: null, counterVal: '', reportOpen: false }));
      await load(thread.id);
    }, { reloadAfter: false });

  const refresh = () => load(active?.id, { scroll: true });

  // ── Composer ──────────────────────────────────────────────────────────
  const send = () => {
    const text = state.draft.trim();
    if (!text || !active) return;
    ctx.run('send', async () => {
      const { message } = await ctx.api.post(`/api/threads/${active.id}/messages`, { text });
      set((current) => ({ ...current, draft: '' }));
      await refresh();
      if (message.flagged) ctx.toast('Sent. Remember: payments outside Twendezetu are not protected.', 'err', 6000);
      else if (message.redacted) ctx.toast('Sent. Contact details were hidden until an offer is accepted.');
    }, { reloadAfter: false });
  };

  const attach = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file || !active) return;
    input.value = '';
    if (file.size > 4 * 1024 * 1024) {
      ctx.toast('Files can be at most 4 MB.', 'err');
      return;
    }
    ctx.run('attach', async () => {
      const uploaded = await ctx.api.upload(file, 'MESSAGE');
      await ctx.api.post(`/api/threads/${active.id}/messages`, { fileId: uploaded.file.id });
      await refresh();
    }, { reloadAfter: false, success: 'Attachment sent.' });
  };

  // ── Offers ────────────────────────────────────────────────────────────
  const offerAction = (offer, body, success) =>
    ctx.run(`offer:${offer.id}`, async () => {
      const result = await ctx.api.post(`/api/offers/${offer.id}`, body, { idempotent: true });
      set((current) => ({ ...current, counterFor: null, counterVal: '' }));
      await refresh();
      return result;
    }, { reloadAfter: false, success });

  const isPoster = Boolean(active?.isPoster);
  const composerOffer = active?.messages.find((message) => message.offer?.id === state.counterFor)?.offer || null;
  const sendCounter = () => {
    if (!composerOffer) return;
    const value = state.counterVal.trim();
    if (!value) {
      ctx.toast(isPoster ? 'Say what you would accept.' : 'Enter your new price.', 'err');
      return;
    }
    if (isPoster) offerAction(composerOffer, { action: 'counter', note: value }, 'Counter-offer sent.');
    else offerAction(composerOffer, { action: 'revise', price: value }, 'Revised price sent.');
  };

  // Only the newest card for an offer is live; earlier cards are history
  // (a revised price posts a fresh card) and read as plain messages.
  const latestCard = new Map();
  for (const message of active?.messages || []) if (message.offer) latestCard.set(message.offer.id, message.id);

  const messages = (active?.messages || []).map((message) => {
    const mine = message.mine;
    const bubble = {
      who: message.who,
      time: message.time,
      text: message.text,
      align: mine ? 'end' : 'start',
      metaAlign: mine ? 'right' : 'left',
      bg: mine ? COLORS.forest : COLORS.paper,
      fg: mine ? COLORS.cream : COLORS.ink,
    };
    if (message.kind === 'NOTICE') return { ...bubble, isWarn: true };
    if (message.file) {
      return { ...bubble, isFile: true, isImage: message.file.image, isDocument: !message.file.image, fileHref: message.file.href, fileName: message.file.name };
    }
    if (!message.offer || latestCard.get(message.offer.id) !== message.id) return { ...bubble, isText: true };

    const offer = message.offer;
    const open = ['OPEN', 'COUNTERED'].includes(offer.status);
    return {
      ...bubble,
      isOffer: true,
      offerRef: offer.reference,
      offerTitle: offer.title,
      offerPrice: offer.price,
      offerNote: offer.note,
      canRespond: offer.canRespond,
      canCounter: offer.canRespond && offer.status === 'OPEN',
      canWithdraw: offer.canWithdraw,
      offerDone: !open || (offer.status === 'COUNTERED' && isPoster),
      offerStatus: OFFER_STATUS[offer.status] || offer.status,
      composerOpen: state.counterFor === offer.id,
      accept: async () => {
        const sure = await ctx.ask({
          title: `Accept ${offer.price}?`,
          body: `${offer.title}. Other offers on your need are declined and each vendor is told. You then pay into escrow; the vendor is only paid after the job.`,
          input: false,
          confirmLabel: 'Accept offer',
        });
        if (sure) offerAction(offer, { action: 'accept' }, (result) => `Accepted. Booking ${result.reference} is ready to pay into escrow.`);
      },
      counter: () => set((current) => ({ ...current, counterFor: current.counterFor === offer.id ? null : offer.id, counterVal: '' })),
      decline: async () => {
        const sure = await ctx.ask({ title: 'Decline this offer?', body: 'The vendor is told. You cannot undo this.', input: false, confirmLabel: 'Decline', danger: true });
        if (sure) offerAction(offer, { action: 'decline' }, 'Offer declined.');
      },
      withdraw: async () => {
        const sure = await ctx.ask({ title: 'Withdraw your offer?', body: 'The poster is told and cannot accept it any more.', input: false, confirmLabel: 'Withdraw', danger: true });
        if (sure) offerAction(offer, { action: 'withdraw' }, 'Offer withdrawn.');
      },
    };
  });

  // ── Booking ───────────────────────────────────────────────────────────
  const bookingAction = (key, call, success) =>
    ctx.run(key, async () => {
      const result = await call();
      if (!result) return undefined;
      if (result.redirectUrl) return result;
      await refresh();
      return result;
    }, { reloadAfter: false, success });

  const pay = (channel) =>
    bookingAction(
      `pay:${channel}`,
      () => withStepUp(ctx, (code) => ctx.api.post(`/api/bookings/${booking.id}/pay`, { channel, code }, { idempotent: true })),
      (result) => (result?.mode === 'test' ? 'Paid into escrow (test mode — no card was charged).' : result?.points ? `Paid with ${result.points.toLocaleString('en-US')} points. The money is held in escrow.` : 'Paid into escrow.'),
    );

  let contactLine = 'Masked. Keep talking here — the platform relays every message.';
  if (active?.revealed && active.contacts) contactLine = [active.contacts.phone, active.contacts.email].filter(Boolean).join(' · ');
  else if (booking && !active?.revealed) contactLine = 'Kept masked at the poster’s request. Everything still works here, including payment.';

  const moneyLine = !booking
    ? ''
    : {
        PENDING_PAYMENT: `${booking.amount} to pay. Nothing is paid out until the job is done.`,
        ESCROWED: `${booking.amount} held by Twendezetu. Released ${booking.releaseHours} hours after the job${booking.releaseOn ? ` (from ${booking.releaseOn})` : ''} unless someone raises a problem.`,
        RELEASED: sentence(`${booking.amount} paid to ${booking.providerName}`),
        DISPUTED: `${booking.amount} frozen in escrow while the dispute is decided.`,
        CANCELLED: 'Cancelled before any money moved.',
        REFUNDED: `${booking.amount} refunded.`,
      }[booking.status];

  return {
    me: data.me,
    mobileView: state.mobileView,
    backToList: () => set((current) => ({ ...current, mobileView: 'list' })),
    noThreads: data.threads.length === 0,
    threads: data.threads.map((thread) => {
      const current = thread.id === active?.id;
      return {
        ...thread,
        current,
        bg: current ? COLORS.forest : COLORS.paper,
        fg: current ? COLORS.cream : COLORS.ink,
        metaColor: current ? COLORS.clayLight : '#A85A23',
        previewColor: current ? 'rgba(247,241,230,0.8)' : COLORS.muted,
        unread: thread.unread && !current,
        open: () => openThread(thread),
      };
    }),

    hasActive: Boolean(active),
    noActive: !active,
    activeInitials: active?.initials || '',
    activeName: active?.name || '',
    activeNameUpper: (active?.name || '').toUpperCase(),
    activeSub: active?.sub || '',
    activeRe: active?.subject || '',
    maskLabel: active?.revealed ? 'CONTACTS SHARED' : 'MASKED',
    maskBg: active?.revealed ? '#C9D3BF' : '#FBEED8',
    routingNote: active?.revealed
      ? 'Contacts are shared in this conversation. Keep paying through Twendezetu: escrow only protects payments made here.'
      : 'Routed through Twendezetu. Names, emails and phones are hidden on both sides until an offer is accepted. Payments outside the platform are not protected.',
    canDispute: Boolean(booking?.canDispute),
    disputeHref: booking ? `/disputes?booking=${booking.id}` : '#',
    reportOpen: state.reportOpen,
    toggleReport: () => set((current) => ({ ...current, reportOpen: !current.reportOpen })),
    reportReasons: REPORT_REASONS.map(([reason, label]) => ({
      label,
      pick: async () => {
        set((current) => ({ ...current, reportOpen: false }));
        let detail;
        if (reason === 'OTHER') {
          detail = await ctx.ask({ title: 'What happened?', body: 'A sentence or two helps the trust team act quickly.', maxLength: 1000, confirmLabel: 'Send report' });
          if (!detail) return;
        }
        ctx.run('report', () => ctx.api.post('/api/reports', { targetType: 'THREAD', targetId: active.id, reason, detail }), {
          reloadAfter: false,
          success: 'Reported. The trust team will review this conversation.',
        });
      },
    })),

    messages,
    composerLabel: isPoster ? '[YOUR COUNTER-OFFER]' : '[YOUR REVISED PRICE]',
    composerHint: isPoster
      ? 'Say what you would accept. The vendor can answer with a revised price.'
      : 'Your new total for the whole job, in the same currency as your offer.',
    composerPlaceholder: isPoster ? 'e.g. Could you do it for 650,000 with pickup at 7am?' : 'e.g. 700,000',
    composerAction: isPoster ? 'Send counter' : 'Send price',
    counterVal: state.counterVal,
    setCounterVal: (event) => set((current) => ({ ...current, counterVal: event.target.value })),
    counterKey: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendCounter();
      }
      if (event.key === 'Escape') set((current) => ({ ...current, counterFor: null }));
    },
    sendCounter,
    closeCounter: () => set((current) => ({ ...current, counterFor: null, counterVal: '' })),

    hasBooking: Boolean(booking),
    booking: booking || {},
    bookingTone: booking ? BOOKING_TONES[booking.status] : COLORS.sand,
    bookingLine: booking ? [booking.title, booking.when, booking.amount].filter(Boolean).join(' · ').toUpperCase() : '',
    contactLine,
    moneyLine,
    payBooking: () => pay('CARD'),
    payWithPoints: () => pay('POINTS'),
    confirmDone: async () => {
      const sure = await ctx.ask({
        title: `Release ${booking.amount} to ${booking.providerName}?`,
        body: 'Only do this once the job is done. The money leaves escrow straight away and cannot be pulled back.',
        input: false,
        confirmLabel: 'Release payment',
      });
      if (sure) bookingAction('confirm', () => ctx.api.post(`/api/bookings/${booking.id}/complete`, undefined, { idempotent: true }), 'Released. Thank you — leave a review to help others.');
    },
    cancelBooking: async () => {
      const sure = await ctx.ask({ title: 'Cancel this booking?', body: 'Nothing has been paid, so nothing moves. The need reopens for other offers.', input: false, confirmLabel: 'Cancel booking', danger: true });
      if (sure) bookingAction('cancel', () => ctx.api.post(`/api/bookings/${booking.id}/cancel`), 'Booking cancelled.');
    },
    reviewHref: booking ? `/vendors/${booking.providerSlug}?review=${booking.id}#reviews` : '#',

    draft: state.draft,
    setDraft: (event) => set((current) => ({ ...current, draft: event.target.value })),
    send,
    sending: Boolean(state.busy?.send),
    attach,
  };
}
