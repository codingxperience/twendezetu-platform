// My Twende: the signed-in person's own space.

import { COLORS, copyText, scrollShelf, sentence, shareLinks, withStepUp } from './shared';

const TABS = [
  ['foryou', 'For you'],
  ['upcoming', 'Upcoming'],
  ['posts', 'My posts'],
  ['saved', 'Saved'],
  ['calendar', 'Calendar'],
];

const REMINDER_OPTIONS = [
  ['7d,1d,2h', '7d · 1d · 2h'],
  ['1d,2h', '1d · 2h'],
  ['1d', '1d only'],
  ['off', 'Off'],
];

const STAGES = ['DRAFT', 'LIVE', 'OFFERS', 'ACCEPTED', 'DONE'];

const AVATAR_TONES = [
  { bg: COLORS.forest, fg: COLORS.cream },
  { bg: COLORS.clay, fg: COLORS.forest },
  { bg: COLORS.sand, fg: COLORS.ink },
  { bg: COLORS.sage, fg: COLORS.cream },
];

const STATUS_TONES = {
  GOING: { bg: COLORS.clay, fg: COLORS.ink },
  INTERESTED: { bg: COLORS.sand, fg: COLORS.ink },
  'ON HOLD': { bg: COLORS.sand, fg: COLORS.ink },
  CANCELLED: { bg: COLORS.red, fg: COLORS.cream },
};

const STAGE_TONES = {
  DRAFT: { bg: COLORS.sand, fg: COLORS.ink },
  PAUSED: { bg: COLORS.sand, fg: COLORS.ink },
  LIVE: { bg: COLORS.clay, fg: COLORS.ink },
  'LIVE ON THE GUIDE': { bg: COLORS.clay, fg: COLORS.ink },
  'OFFERS IN': { bg: COLORS.clay, fg: COLORS.ink },
  ACCEPTED: { bg: COLORS.forest, fg: COLORS.cream },
  DONE: { bg: COLORS.sage, fg: COLORS.cream },
  CANCELLED: { bg: COLORS.red, fg: COLORS.cream },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const initialState = { tab: 'foryou', open: {}, copied: null, bellOpen: false, profileOpen: false, month: null, day: null };

export function stateFrom(data, params = {}) {
  const tab = TABS.some(([key]) => key === params.tab) ? params.tab : 'foryou';
  // The calendar opens on the month of the next thing on it, or this month.
  const next = data.calendar.map((entry) => entry.day).filter((day) => day >= data.today).sort()[0];
  return { tab, month: (next || data.today).slice(0, 7) };
}

function monthGrid(month, entries, today, selectedDay, pick) {
  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const byDay = new Map();
  for (const entry of entries) {
    if (!entry.day.startsWith(month)) continue;
    byDay.set(entry.day, [...(byDay.get(entry.day) || []), entry]);
  }
  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push({ num: '', label: '', bg: COLORS.sand, fg: COLORS.ink, outline: 'none', aria: 'No date', pick: () => {} });
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${month}-${String(day).padStart(2, '0')}`;
    const onDay = byDay.get(key) || [];
    const first = onDay[0];
    const tone = !first ? { bg: COLORS.paper, fg: COLORS.ink } : first.kind === 'event' ? { bg: COLORS.clay, fg: COLORS.ink } : { bg: COLORS.forest, fg: COLORS.cream };
    const outline = key === selectedDay ? `3px solid ${COLORS.ink}` : key === today ? `3px solid ${COLORS.clay}` : 'none';
    cells.push({
      num: day,
      label: first ? `${first.short}${onDay.length > 1 ? ` +${onDay.length - 1}` : ''}`.toUpperCase() : '',
      ...tone,
      outline,
      aria: `${day} ${MONTHS[monthIndex - 1]}${onDay.length ? `: ${onDay.map((entry) => entry.title).join(', ')}` : ''}`,
      pick: () => pick(onDay.length ? key : null),
    });
  }
  while (cells.length % 7) cells.push({ num: '', label: '', bg: COLORS.sand, fg: COLORS.ink, outline: 'none', aria: 'No date', pick: () => {} });
  return { cells, byDay };
}

function shiftMonth(month, delta) {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function longDate(day) {
  const [year, month, date] = day.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, date)).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  return `${weekday} ${date} ${MONTHS[month - 1]}`.toUpperCase();
}

export function values(state, set, ctx) {
  const { data } = state;
  const toggleOpen = (key) => set((current) => ({ ...current, open: { ...current.open, [key]: !current.open[key] } }));
  const flashCopied = (key) => {
    set((current) => ({ ...current, copied: key }));
    window.setTimeout(() => set((current) => (current.copied === key ? { ...current, copied: null } : current)), 1800);
  };
  const patchData = (change) => set((current) => ({ ...current, data: { ...current.data, ...change(current.data) } }));

  const goTab = (tab) => {
    set((current) => ({ ...current, tab, bellOpen: false, profileOpen: false }));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  };

  // ── Header ────────────────────────────────────────────────────────────
  const toggleBell = () => {
    const opening = !state.bellOpen;
    set((current) => ({ ...current, bellOpen: opening, profileOpen: false }));
    if (opening && data.me.unread > 0) {
      ctx.api
        .post('/api/notifications', {})
        .then(() => patchData((current) => ({ me: { ...current.me, unread: 0 } })))
        .catch(() => {});
    }
  };

  const signOut = () =>
    ctx.run('signout', async () => {
      await ctx.api.post('/api/auth/sign-out');
      window.location.assign('/');
    }, { reloadAfter: false });

  // ── For you ───────────────────────────────────────────────────────────
  const followProvider = (provider) =>
    ctx.run(`follow:${provider.slug}`, async () => {
      const result = await ctx.api.post(`/api/providers/${provider.slug}/follow`);
      patchData((current) => ({ providers: current.providers.map((item) => (item.slug === provider.slug ? { ...item, following: result.following } : item)) }));
      return result;
    }, { reloadAfter: false, success: (result) => sentence(`${result.following ? 'Following' : 'Unfollowed'} ${provider.name}`) });

  // ── Upcoming ──────────────────────────────────────────────────────────
  const upcoming = data.upcoming.map((ev) => {
    const tone = STATUS_TONES[ev.status] || STATUS_TONES.GOING;
    const qrOpen = Boolean(state.open[`qr:${ev.rsvpId}`]);
    const links = shareLinks(ev.link, `${ev.title} — ${ev.date}, ${ev.city}. Twende pamoja!`, ev.title);
    return {
      ...ev,
      badge: ev.status,
      badgeBg: tone.bg,
      hasTickets: ev.tickets.length > 0,
      tickets: ev.tickets.map((ticket) => ({
        ...ticket,
        heading: ticket.used ? 'Already scanned' : 'Show at the door',
        opacity: ticket.used ? 0.45 : 1,
      })),
      qrOpen,
      qrLabel: ev.tickets.length > 1 ? `▣ ${ev.tickets.length} TICKETS` : '▣ TICKET',
      qrBg: qrOpen ? COLORS.forest : COLORS.cream,
      qrFg: qrOpen ? COLORS.cream : COLORS.ink,
      toggleQr: () => toggleOpen(`qr:${ev.rsvpId}`),
      referOpen: Boolean(state.open[`refer:${ev.rsvpId}`]),
      refer: () => toggleOpen(`refer:${ev.rsvpId}`),
      copy: () => {
        copyText(ev.link);
        ctx.toast('Link copied. Anyone who RSVPs through it counts as your referral.');
      },
      shareWa: () => window.open(links.waHref, '_blank', 'noopener'),
      shareFb: () => window.open(links.fbHref, '_blank', 'noopener'),
      shareEm: () => window.location.assign(links.emHref),
      calLabel: ev.calendarAdded ? '✓ IN YOUR CALENDAR' : '＋ ADD TO CALENDAR',
      calBg: ev.calendarAdded ? COLORS.forest : COLORS.cream,
      calFg: ev.calendarAdded ? COLORS.cream : COLORS.ink,
      toggleCal: () => {
        // The .ics file opens in the phone or laptop calendar; downloading it
        // again (another device) is always allowed.
        window.location.assign(ev.calendarHref);
        if (!ev.calendarAdded) {
          ctx.run(`cal:${ev.rsvpId}`, () => ctx.api.patch(`/api/rsvps/${ev.rsvpId}`, { calendarAdded: true }));
        }
      },
      editOpen: Boolean(state.open[`remind:${ev.rsvpId}`]),
      editLabel: state.open[`remind:${ev.rsvpId}`] ? 'DONE' : 'CHANGE',
      toggleEdit: () => toggleOpen(`remind:${ev.rsvpId}`),
      reminderOpts: REMINDER_OPTIONS.map(([plan, label]) => ({
        label: label.toUpperCase(),
        bg: ev.reminderPlan === plan ? COLORS.forest : COLORS.paper,
        fg: ev.reminderPlan === plan ? COLORS.cream : COLORS.ink,
        pick: () =>
          ctx.run(`remind:${ev.rsvpId}`, () => ctx.api.patch(`/api/rsvps/${ev.rsvpId}`, { reminderPlan: plan }), {
            success: plan === 'off' ? 'Reminders are off for this event.' : `Reminders set: ${label}.`,
          }),
      })),
    };
  });

  const waitlist = data.waitlist.map((entry) => ({
    ...entry,
    status: entry.notified ? 'SEATS BACK' : `#${entry.position} IN LINE`,
    note: entry.notified
      ? 'A seat came back and we told you. Seats are not held, so it goes to whoever checks out first.'
      : 'When a seat frees up — a refund, an expired hold, an unpaid group split — we tell people in the order they joined. Seats are not held, so move quickly when you hear from us.',
    ctaLabel: entry.notified ? 'CHECK OUT NOW →' : 'VIEW TICKETS',
    ctaBg: entry.notified ? COLORS.clay : COLORS.cream,
    leave: async () => {
      const sure = await ctx.ask({ title: 'Leave this waitlist?', body: `You will stop hearing about seats for ${entry.title}.`, input: false, confirmLabel: 'Leave waitlist', danger: true });
      if (sure) ctx.run(`waitlist:${entry.id}`, () => ctx.api.delete(`/api/waitlist/${entry.id}`), { success: 'You left the waitlist.' });
    },
  }));

  const activeNeeds = data.activeNeeds.map((need) => ({
    ...need,
    offersLabel: need.status === 'ACCEPTED' ? 'ACCEPTED' : `${need.offerCount} OFFER${need.offerCount === 1 ? '' : 'S'}`,
    offers: need.offers.map((offer) => ({
      ...offer,
      opacity: need.status === 'ACCEPTED' && !offer.accepted ? 0.55 : 1,
      accept: async () => {
        const sure = await ctx.ask({
          title: `Accept ${offer.name}'s offer?`,
          body: `${offer.price} for "${need.title}". The other offers on this need are declined and each provider is told. You pay into escrow next; ${offer.name} is only paid after the job.`,
          input: false,
          confirmLabel: 'Accept offer',
        });
        if (!sure) return;
        ctx.run(`accept:${offer.id}`, () => ctx.api.post(`/api/offers/${offer.id}`, { action: 'accept' }, { idempotent: true }), {
          success: (result) => `Accepted. Booking ${result.reference} is ready to pay into escrow.`,
        });
      },
      pay: () =>
        ctx.run(
          `pay:${offer.bookingId}`,
          () => withStepUp(ctx, (code) => ctx.api.post(`/api/bookings/${offer.bookingId}/pay`, { channel: 'CARD', code }, { idempotent: true })),
          { success: (result) => (result?.mode === 'test' ? 'Paid into escrow (test mode — no card was charged).' : result ? 'Paid into escrow.' : null) },
        ),
    })),
  }));

  // ── Posts ─────────────────────────────────────────────────────────────
  const posts = data.posts.map((post) => {
    const tone = STAGE_TONES[post.stage] || STAGE_TONES.LIVE;
    const shareKey = `share:${post.id}`;
    const statusUrl = post.kind === 'NEED' ? `/api/needs/${post.id}/status` : `/api/events/${post.slug}/status`;
    const setStatus = (action, body = {}, success) => ctx.run(`status:${post.id}`, () => ctx.api.post(statusUrl, { action, ...body }), { success });
    return {
      ...post,
      noHref: !post.href,
      stageBg: tone.bg,
      stageFg: tone.fg,
      pipeline: STAGES.map((label, index) => ({
        label,
        bg: index < post.stageIndex ? COLORS.forest : index === post.stageIndex ? COLORS.clay : COLORS.paper,
        fg: index <= post.stageIndex ? COLORS.ink : COLORS.muted,
      })),
      hasOffers: post.offers > 0,
      hasAnalytics: post.kind === 'EVENT' && post.status !== 'DRAFT',
      pauseLabel: post.paused ? 'RESUME' : 'PAUSE',
      pauseBg: post.paused ? COLORS.clay : COLORS.cream,
      pause: () =>
        post.kind === 'NEED'
          ? setStatus(post.paused ? 'resume' : 'pause', {}, post.paused ? 'Your need is live again.' : 'Paused. Providers cannot send new offers until you resume.')
          : setStatus(post.paused ? 'publish' : 'pause', {}, post.paused ? 'Back on the guide.' : 'Paused. The event is off the guide until you resume.'),
      publish: () => setStatus('publish', {}, 'Published. It is on the guide now.'),
      shareLabel: state.copied === shareKey ? '✓ LINK COPIED' : '⧉ SHARE',
      share: () => {
        copyText(post.shareUrl);
        flashCopied(shareKey);
      },
      closeLabel: post.kind === 'NEED' ? 'CLOSE' : post.status === 'DRAFT' ? 'DELETE DRAFT' : 'CANCEL EVENT',
      close: async () => {
        if (post.kind === 'NEED') {
          const sure = await ctx.ask({ title: 'Close this need?', body: 'Open offers are declined and each provider is told. This cannot be undone.', input: false, confirmLabel: 'Close need', danger: true });
          if (sure) setStatus('close', {}, 'Closed.');
          return;
        }
        if (post.status === 'DRAFT') {
          const sure = await ctx.ask({ title: 'Delete this draft?', body: 'It was never published, so nobody else has seen it.', input: false, confirmLabel: 'Delete draft', danger: true });
          if (sure) setStatus('archive', {}, 'Draft deleted.');
          return;
        }
        const reason = await ctx.ask({
          title: 'Cancel this event?',
          body: 'Everyone who RSVP’d is told, and every ticket is refunded in full, fees included. Tell them why.',
          placeholder: 'e.g. The venue flooded — we will announce a new date.',
          maxLength: 300,
          confirmLabel: 'Cancel event and refund',
        });
        if (reason) setStatus('cancel', { reason }, 'Cancelled. Refunds and notices are on their way.');
      },
    };
  });

  // ── Calendar ──────────────────────────────────────────────────────────
  const { cells, byDay } = monthGrid(state.month, data.calendar, data.today, state.day, (day) => set((current) => ({ ...current, day })));
  const onSelected = state.day ? byDay.get(state.day) || [] : [];
  const selected = onSelected[0];

  // ── Right rail ────────────────────────────────────────────────────────
  const prefToggle = (key, label, save) => ({
    label,
    on: data.prefs[key],
    bg: data.prefs[key] ? COLORS.clay : COLORS.sand,
    knobLeft: data.prefs[key] ? '26px' : '2px',
    toggle: () => {
      if (state.busy?.[`pref:${key}`]) return;
      const next = !data.prefs[key];
      patchData((current) => ({ prefs: { ...current.prefs, [key]: next } }));
      ctx.run(`pref:${key}`, () => save(next), { reloadAfter: false }).then((result) => {
        if (result === undefined) patchData((current) => ({ prefs: { ...current.prefs, [key]: !next } }));
      });
    },
  });
  const channelPref = (topic) => (enabled) => ctx.api.patch('/api/account/notifications', { topic, channel: 'email', enabled });

  const { referral, wallet } = data;

  return {
    me: data.me,
    roleLine: data.roleLine,
    summary: data.summary,
    bellBadge: data.me.unread > 0,
    bellOpen: state.bellOpen,
    toggleBell,
    profileOpen: state.profileOpen,
    toggleProfile: () => set((current) => ({ ...current, profileOpen: !current.profileOpen, bellOpen: false })),
    notices: data.notices.map((notice) => ({ ...notice, body: notice.title, bg: notice.unread ? '#FBEED8' : COLORS.paper })),
    noNotices: data.notices.length === 0,
    signOut,

    tabs: TABS.map(([key, label]) => ({ label, go: () => goTab(key), bg: state.tab === key ? COLORS.forest : COLORS.paper, fg: state.tab === key ? COLORS.cream : COLORS.ink })),
    showForYou: state.tab === 'foryou',
    showUpcoming: state.tab === 'upcoming',
    showPosts: state.tab === 'posts',
    showSaved: state.tab === 'saved',
    showCalendar: state.tab === 'calendar',

    fyFeatured: data.featured,
    fyExplore: data.explore,
    fyOrganizers: data.organizers.map((organizer, index) => ({ ...organizer, ...AVATAR_TONES[index % AVATAR_TONES.length] })),
    noOrganizers: data.organizers.length === 0,
    fyEvents: data.followedEvents,
    hasFollowedEvents: data.followedEvents.length > 0,
    fyShelfId: 'followed-shelf',
    fyPrev: () => scrollShelf('followed-shelf', -1),
    fyNext: () => scrollShelf('followed-shelf', 1),
    fyNeeds: data.nearbyNeeds,
    hasNeeds: data.nearbyNeeds.length > 0,
    fyFollow: data.providers.map((provider, index) => ({
      ...provider,
      ...AVATAR_TONES[(index + 1) % AVATAR_TONES.length],
      href: `/providers/${provider.slug}`,
      btnLabel: provider.following ? '✓ FOLLOWING' : '+ FOLLOW',
      btnBg: provider.following ? COLORS.forest : COLORS.clay,
      btnFg: provider.following ? COLORS.cream : COLORS.ink,
      toggle: () => followProvider(provider),
    })),
    hasFollowCards: data.providers.length > 0,

    upcoming,
    noUpcoming: upcoming.length === 0,
    waitlist,
    activeNeeds,

    referralHeadline: referral.friends ? `${referral.friends} friend${referral.friends === 1 ? '' : 's'} joined via your links` : 'Bring your people',
    referralLink: referral.link,
    copyLabel: state.copied === 'referral' ? '✓ COPIED' : 'COPY',
    copyRef: () => {
      copyText(referral.link);
      flashCopied('referral');
    },
    referralCta: referral.points ? `🎁 ${referral.points.toLocaleString('en-US')} PTS EARNED · SEE REWARDS →` : '🎁 HOW REFERRAL POINTS WORK →',
    walletPoints: wallet.points.toLocaleString('en-US'),
    walletValue: wallet.value,
    prefs: [
      prefToggle('reminders', 'Event reminders by email', channelPref('REMINDERS')),
      prefToggle('offers', 'Offers & replies by email', channelPref('OFFERS')),
      prefToggle('social', 'Referrals & comments by email', channelPref('SOCIAL')),
      prefToggle('digest', 'Weekly digest', (enabled) => ctx.api.put('/api/account/notifications', { weeklyDigest: enabled })),
    ],

    myPosts: posts,
    noPosts: posts.length === 0,
    saved: data.saved.map((event) => ({ ...event, action: event.isFree ? 'free RSVP' : event.price.toLowerCase() })),
    noSaved: data.saved.length === 0,

    monthName: (() => {
      const [year, month] = state.month.split('-').map(Number);
      return `${MONTHS[month - 1]} ${year}`;
    })(),
    prevMonth: () => set((current) => ({ ...current, month: shiftMonth(current.month, -1), day: null })),
    nextMonth: () => set((current) => ({ ...current, month: shiftMonth(current.month, 1), day: null })),
    monthDays: cells,
    calendarNote: 'Add any event to Google, Apple or Outlook from its calendar button',
    selectedEvent: Boolean(selected),
    selDate: selected ? longDate(state.day) : '',
    selTitle: selected?.title || '',
    selMeta: selected ? `${selected.meta}${onSelected.length > 1 ? ` · and ${onSelected.slice(1).map((entry) => entry.title).join(', ')}` : ''}` : '',
    selHref: selected?.href || '#',
    clearSel: () => set((current) => ({ ...current, day: null })),
  };
}
