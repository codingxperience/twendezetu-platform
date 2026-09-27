// An event page: RSVP (members and guests), tickets, calendar, sharing.
// Serves both the standard event template and the bespoke flagship one.

import { COLORS, EMAIL_PATTERN, copyText, readPreference, shareLinks, writePreference } from './shared';

export const initialState = { rsvpStep: 'idle', gName: '', gEmail: '', gParty: 1, gError: null, copied: false, justRsvped: null };

export function stateFrom(data) {
  return { gName: data.me.name || '', gEmail: data.me.email || '', gParty: data.rsvp?.partySize || 1 };
}

function track(ctx, slug, kind) {
  ctx.api.post(`/api/events/${slug}/track`, { kind, source: ctx.params.src }).catch(() => {});
}

export function onMount(ctx, set) {
  const { slug } = ctx.params;
  track(ctx, slug, 'view');
  // A guest who RSVP'd on this device sees their confirmation again.
  try {
    const saved = JSON.parse(readPreference(`rsvp:${slug}`, 'null'));
    if (saved) set((state) => (state.data.rsvp ? state : { ...state, justRsvped: saved }));
  } catch {
    // Ignore unreadable local data.
  }
}

export function values(state, set, ctx) {
  const { data } = state;
  const { event } = data;
  const rsvp = data.rsvp || state.justRsvped;
  const rsvped = Boolean(rsvp);
  const party = state.gParty || 1;
  const signedIn = data.me.signedIn;
  const shareText = `${event.title} — ${event.date}, ${event.city}. Hii si ya kukosa!`;
  const shareUrl = data.shareUrl + (data.me.handle ? `?r=${data.me.handle}` : '');
  const links = shareLinks(shareUrl, shareText, event.title);
  const ticketsHref = `/checkout?event=${event.slug}${ctx.params.r ? `&r=${ctx.params.r}` : ''}${ctx.params.src ? `&src=${ctx.params.src}` : ''}`;

  const confirmRsvp = () => {
    const name = String(state.gName || '').trim();
    const email = String(state.gEmail || '').trim();
    if (!signedIn && !name) return set((current) => ({ ...current, gError: 'Please add your name.' }));
    if (!signedIn && !EMAIL_PATTERN.test(email)) return set((current) => ({ ...current, gError: 'That email does not look right — we need it for your invite.' }));
    return ctx.run('rsvp', async () => {
      const result = await ctx.api.post(`/api/events/${event.slug}/rsvp`, {
        ...(signedIn ? {} : { name, email }),
        partySize: party,
        ref: ctx.params.r || undefined,
        source: ctx.params.src || undefined,
      });
      const confirmed = { name: result.rsvp.name, email: signedIn ? data.me.email : email, partySize: result.rsvp.partySize };
      if (!signedIn) writePreference(`rsvp:${event.slug}`, JSON.stringify(confirmed));
      set((current) => ({ ...current, rsvpStep: 'done', gError: null, justRsvped: confirmed }));
      return result;
    }, { success: signedIn ? 'You are going. Reminders are set in My Twende.' : 'You are on the list. Check your email for the link to manage your RSVP.' });
  };

  const withdrawRsvp = () =>
    ctx.run('withdraw', async () => {
      if (data.rsvp?.manageToken) await ctx.api.delete(`/api/events/${event.slug}/rsvp?token=${encodeURIComponent(data.rsvp.manageToken)}`);
      else if (data.rsvp?.mine) await ctx.api.delete(`/api/rsvps/${data.rsvp.id}`);
      writePreference(`rsvp:${event.slug}`, 'null');
      set((current) => ({ ...current, justRsvped: null, rsvpStep: 'idle' }));
    }, { success: 'Your RSVP is cancelled. Thanks for letting the organizer know.' });

  const canCancel = Boolean(data.rsvp?.manageToken || data.rsvp?.mine);

  return {
    me: data.me,
    signInHref: `/sign-in?next=${encodeURIComponent(`/events/${event.slug}`)}`,
    bannerText: signedIn
      ? `Karibu, ${data.me.firstName}! RSVPs and tickets you get here show up in My Twende with reminders.`
      : 'Karibu! No account needed to explore, RSVP or buy a ticket. A free account keeps your reminders and tickets in one place.',
    title: event.title,
    category: event.category,
    dateLine: event.dateLine,
    city: event.city,
    venue: event.venue,
    price: event.price,
    priceHead: event.isFree ? 'Free entry' : event.price,
    going: event.going,
    img: event.img,
    organizer: event.organizer,
    organizerInitials: event.organizerInitials,
    description: event.description,
    badge: event.badge,
    isFree: event.isFree,
    isPaid: !event.isFree,
    closedNote: data.closedNote,
    canBuy: data.canBuy,
    canRsvp: data.canRsvp,
    ticketsHref,
    goTickets: () => {
      track(ctx, event.slug, 'cta');
      window.location.assign(ticketsHref);
    },
    schedule: data.schedule,

    rsvped,
    notRsvped: !rsvped,
    rsvpForm: state.rsvpStep === 'form' && !rsvped,
    rsvpLabel: state.rsvpStep === 'form' ? 'Finish below ↓' : 'RSVP — I am going',
    rsvpBg: state.rsvpStep === 'form' ? COLORS.forest : COLORS.clay,
    rsvpFg: state.rsvpStep === 'form' ? COLORS.cream : COLORS.forest,
    toggleRsvp: () => {
      if (state.rsvpStep === 'idle') track(ctx, event.slug, 'cta');
      if (signedIn && state.rsvpStep === 'idle') {
        set((current) => ({ ...current, rsvpStep: 'form' }));
        return;
      }
      set((current) => ({ ...current, rsvpStep: current.rsvpStep === 'idle' ? 'form' : 'idle', gError: null }));
    },
    gName: state.gName,
    setGName: (e) => set((current) => ({ ...current, gName: e.target.value, gError: null })),
    gEmail: state.gEmail,
    setGEmail: (e) => set((current) => ({ ...current, gEmail: e.target.value, gError: null })),
    gError: state.gError,
    partyOpts: [1, 2, 3, 4].map((count) => ({
      label: count === 4 ? '4+ GUESTS' : `${count} ${count === 1 ? 'GUEST' : 'GUESTS'}`,
      pick: () => set((current) => ({ ...current, gParty: count })),
      bg: party === count ? COLORS.forest : COLORS.paper,
      fg: party === count ? COLORS.cream : COLORS.ink,
    })),
    confirmRsvp,
    cancelRsvp: () => set((current) => ({ ...current, rsvpStep: 'idle', gError: null })),
    withdrawRsvp,
    canCancelRsvp: canCancel,
    gNameShown: String(rsvp?.name || state.gName || '').split(' ')[0] || 'rafiki',
    gEmailShown: rsvp?.email || state.gEmail,
    gPartyShown: (() => {
      const size = rsvp?.partySize || party;
      return size >= 4 ? `${size} guests` : `${size} ${size === 1 ? 'guest' : 'guests'}`;
    })(),
    rsvpHint: signedIn ? `RSVPing as ${data.me.name}. Reminders go to your notification settings.` : 'No password, no account — just your name and email. You can create an account later to keep everything in one place.',
    rsvpNote: signedIn
      ? `Reminders: ${data.rsvp?.reminders || '7d · 1d · 2h'}. Change them any time in My Twende.`
      : 'We emailed you a private link to change or cancel. Create a free account any time to keep reminders and tickets in one place.',
    afterRsvpHref: signedIn ? '/my-twende?tab=upcoming' : `/sign-in?mode=register&next=${encodeURIComponent(`/events/${event.slug}`)}`,
    afterRsvpLabel: signedIn ? 'SEE IT IN MY TWENDE →' : 'CREATE FREE ACCOUNT →',
    calendarHref: data.calendarHref,
    googleCalHref: data.googleCalendarHref,

    isOwner: data.isOwner,
    checkinHref: `/checkin?event=${event.slug}`,
    analyticsHref: `/organizer-analytics?event=${event.slug}`,
    messageOrganizer: () => {
      if (!signedIn) {
        window.location.assign(`/sign-in?next=${encodeURIComponent(`/events/${event.slug}`)}`);
        return;
      }
      ctx.run('thread', async () => {
        const { threadId } = await ctx.api.post(`/api/events/${event.slug}/thread`);
        window.location.assign(`/messages?thread=${threadId}`);
      }, { reloadAfter: false });
    },

    shareUrl,
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText(shareUrl);
      track(ctx, event.slug, 'share');
      set((current) => ({ ...current, copied: true }));
      window.setTimeout(() => set((current) => ({ ...current, copied: false })), 1800);
    },
    ...links,
    shareWa: () => {
      track(ctx, event.slug, 'share');
      window.open(links.waHref, '_blank', 'noopener');
    },
    shareFb: () => {
      track(ctx, event.slug, 'share');
      window.open(links.fbHref, '_blank', 'noopener');
    },
    similar: data.similar,
  };
}
