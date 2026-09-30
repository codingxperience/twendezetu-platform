// My Twende: the signed-in person's own space, inside the shared frame.
// Tabs: Upcoming (tickets, RSVPs, waitlists, wallet and invite link),
// Notifications (with email alert switches), My posts (events and needs,
// with the offers on each need), Saved, and Calendar.

import { myWords } from '../i18n';
import { COLORS, copyText, savedSet, saveToggler, shareLinks, shellValues, withStepUp } from './shared';

const TABS = ['upcoming', 'notifications', 'posts', 'saved', 'calendar'];

const REMINDER_OPTIONS = ['7d,1d,2h', '1d,2h', '1d', 'off'];

const STAGES = ['DRAFT', 'LIVE', 'OFFERS', 'ACCEPTED', 'DONE'];

const STATUS_TONES = {
  GOING: [COLORS.clay, COLORS.cream],
  INTERESTED: [COLORS.sand, COLORS.ink],
  'ON HOLD': [COLORS.sand, COLORS.ink],
  CANCELLED: [COLORS.red, COLORS.cream],
};

const STAGE_TONES = {
  DRAFT: [COLORS.sand, COLORS.ink],
  PAUSED: [COLORS.sand, COLORS.ink],
  LIVE: [COLORS.clay, COLORS.cream],
  'OFFERS IN': [COLORS.clay, COLORS.cream],
  ACCEPTED: [COLORS.forest, COLORS.cream],
  DONE: [COLORS.sage, COLORS.cream],
  CANCELLED: [COLORS.red, COLORS.cream],
};

// Each notification topic gets a round badge: two letters on a colour.
const TOPIC_BADGES = {
  REMINDERS: ['RE', COLORS.forest],
  OFFERS: ['OF', COLORS.clay],
  LEADS: ['LE', COLORS.clay],
  MONEY: ['$', COLORS.forest],
  SOCIAL: ['FR', COLORS.sage],
  NEWS: ['TZ', COLORS.forest],
};

export const initialState = { tab: 'upcoming', open: {}, copied: null, month: null, day: null, ticket: null, saved: null, unsaved: null };

export function stateFrom(data, params = {}) {
  // Old links to the For You tab land on Upcoming; For You lives on Home now.
  const tab = TABS.includes(params.tab) ? params.tab : 'upcoming';
  // The calendar opens on the month of the next thing on it, or this month.
  const next = data.calendar.map((entry) => entry.day).filter((day) => day >= data.today).sort()[0];
  return { tab, month: (next || data.today).slice(0, 7) };
}

function monthGrid(month, entries, today, selectedDay, pick, names) {
  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const byDay = new Map();
  for (const entry of entries) {
    if (!entry.day.startsWith(month)) continue;
    byDay.set(entry.day, [...(byDay.get(entry.day) || []), entry]);
  }
  const blank = { num: '', label: '', bg: COLORS.sand, fg: COLORS.ink, ring: 'none', aria: '', pick: () => {} };
  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push(blank);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${month}-${String(day).padStart(2, '0')}`;
    const onDay = byDay.get(key) || [];
    const top = onDay[0];
    const [bg, fg] = !top ? [COLORS.paper, COLORS.ink] : top.kind === 'event' ? [COLORS.clay, COLORS.cream] : [COLORS.forest, COLORS.cream];
    cells.push({
      num: day,
      label: top ? `${top.short}${onDay.length > 1 ? ` +${onDay.length - 1}` : ''}`.toUpperCase() : '',
      bg,
      fg,
      ring: key === selectedDay ? `inset 0 0 0 3px ${COLORS.ink}` : key === today ? `inset 0 0 0 3px ${COLORS.clay}` : 'none',
      aria: `${day} ${names[monthIndex - 1]}${onDay.length ? `: ${onDay.map((entry) => entry.title).join(', ')}` : ''}`,
      pick: () => pick(onDay.length ? key : null),
    });
  }
  while (cells.length % 7) cells.push(blank);
  return { cells, byDay };
}

function shiftMonth(month, delta) {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function cityOnly(city) {
  return String(city || '').split(' · ').pop().split(', ')[0];
}

// "Lincoln Park · Jersey City, NJ", without saying the same place twice.
function placeLabel(venue, city) {
  if (!venue || String(city).includes(venue)) return city;
  if (String(venue).includes(city)) return venue;
  return `${venue} · ${city}`;
}

export function values(state, set, ctx) {
  const { data } = state;
  const { me } = data;
  const t = myWords(me.locale);
  const toggleOpen = (key) => set((current) => ({ ...current, open: { ...current.open, [key]: !current.open[key] } }));
  const flashCopied = (key) => {
    set((current) => ({ ...current, copied: key }));
    window.setTimeout(() => set((current) => (current.copied === key ? { ...current, copied: null } : current)), 1800);
  };
  const patchData = (change) => set((current) => ({ ...current, data: { ...current.data, ...change(current.data) } }));

  const goTab = (tab) => {
    set((current) => ({ ...current, tab, day: null }));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0 });
  };

  // ── Notifications ─────────────────────────────────────────────────────
  const unread = data.notices.filter((notice) => notice.unread).length;
  const markRead = (ids) =>
    ctx.api
      .post('/api/notifications', ids ? { ids } : {})
      .then(() =>
        patchData((current) => {
          const read = (notice) => !ids || ids.includes(notice.id);
          const notices = current.notices.map((notice) => (read(notice) ? { ...notice, unread: false } : notice));
          // Marking all clears the bell; marking some takes those off it.
          const left = ids ? Math.max(0, current.me.unread - current.notices.filter((notice) => notice.unread && read(notice)).length) : 0;
          return { notices, me: { ...current.me, unread: left } };
        }),
      )
      .catch(() => {});

  // ── Upcoming ──────────────────────────────────────────────────────────
  const upcoming = data.upcoming.map((ev) => {
    const [bg, fg] = STATUS_TONES[ev.status] || STATUS_TONES.GOING;
    const links = shareLinks(ev.link, `${ev.title} — ${ev.date}, ${cityOnly(ev.city)}. Twende pamoja!`, ev.title);
    const copyKey = `refer:${ev.rsvpId}`;
    const editOpen = Boolean(state.open[`remind:${ev.rsvpId}`]);
    return {
      ...ev,
      when: ev.date,
      place: placeLabel(ev.venue, ev.city),
      statusLabel: t.status[ev.status] || ev.status,
      statusBg: bg,
      statusFg: fg,
      hasTickets: ev.tickets.length > 0,
      noTickets: ev.tickets.length === 0,
      getLabel: ev.isFree ? t.viewEvent : t.getTickets,
      qrLabel: ev.tickets.length > 1 ? t.showTickets(ev.tickets.length) : t.showTicket,
      openTicket: () => set((current) => ({ ...current, ticket: { rsvpId: ev.rsvpId, index: 0 } })),
      calPressed: ev.calendarAdded ? 'true' : 'false',
      calLabel: ev.calendarAdded ? t.inCalendar : t.addCalendar,
      toggleCal: () => {
        // The .ics file opens in the phone or laptop calendar; downloading it
        // again (another device) is always allowed.
        window.location.assign(ev.calendarHref);
        if (!ev.calendarAdded) {
          ctx.run(`cal:${ev.rsvpId}`, () => ctx.api.patch(`/api/rsvps/${ev.rsvpId}`, { calendarAdded: true }), { success: t.calendarSaved });
        }
      },
      referOpen: state.open[copyKey] ? 'true' : '',
      toggleRefer: () => toggleOpen(copyKey),
      copyLabel: state.copied === copyKey ? t.copied : t.copy,
      copy: () => {
        copyText(ev.link);
        flashCopied(copyKey);
        ctx.toast(t.referCopied);
      },
      ...links,
      disputeHref: ev.disputeHref || '/disputes',
      editOpen,
      editLabel: editOpen ? t.done : t.change,
      toggleEdit: () => toggleOpen(`remind:${ev.rsvpId}`),
      reminders: t.plans[ev.reminderPlan] || ev.reminders,
      reminderOpts: REMINDER_OPTIONS.map((plan) => ({
        label: t.plans[plan],
        pressed: ev.reminderPlan === plan ? 'true' : 'false',
        pick: () =>
          ctx.run(`remind:${ev.rsvpId}`, () => ctx.api.patch(`/api/rsvps/${ev.rsvpId}`, { reminderPlan: plan }), {
            success: plan === 'off' ? t.remindersOff : t.remindersSet(t.plans[plan]),
          }),
      })),
    };
  });

  const waitlist = data.waitlist.map((entry) => ({
    ...entry,
    status: entry.notified ? t.seatsBack : t.inLine(entry.position),
    since: t.joined(entry.since.toLowerCase()),
    note: entry.notified ? t.waitNotified : t.waitNote,
    ctaLabel: entry.notified ? t.checkOutNow : t.viewTickets,
    ctaClass: entry.notified ? 'tz-btn tz-btn--maroon tz-btn--sm' : 'tz-btn tz-btn--sm',
    leave: async () => {
      const sure = await ctx.ask({ title: t.leaveTitle, body: t.leaveBody(entry.title), input: false, confirmLabel: t.leaveWaitlist, danger: true });
      if (sure) ctx.run(`waitlist:${entry.id}`, () => ctx.api.delete(`/api/waitlist/${entry.id}`), { success: t.leftWaitlist });
    },
  }));

  // The ticket being shown at the door, if any.
  const ticketEvent = state.ticket ? data.upcoming.find((ev) => ev.rsvpId === state.ticket.rsvpId) : null;
  const ticketCount = ticketEvent?.tickets.length || 0;
  const shown = ticketCount ? ticketEvent.tickets[state.ticket.index % ticketCount] : null;
  const stepTicket = (delta) => set((current) => ({ ...current, ticket: { ...current.ticket, index: (current.ticket.index + delta + ticketCount) % ticketCount } }));

  // ── Posts ─────────────────────────────────────────────────────────────
  const posts = data.posts.map((post) => {
    const [stageBg, stageFg] = STAGE_TONES[post.stage] || STAGE_TONES.LIVE;
    const shareKey = `share:${post.id}`;
    const offersKey = `offers:${post.id}`;
    const statusUrl = post.kind === 'NEED' ? `/api/needs/${post.id}/status` : `/api/events/${post.slug}/status`;
    const setStatus = (action, body = {}, success) => ctx.run(`status:${post.id}`, () => ctx.api.post(statusUrl, { action, ...body }), { success });
    const offerList = post.offerList || [];
    const accepted = offerList.some((offer) => offer.accepted);
    const offersOpen = Boolean(state.open[offersKey]) && offerList.length > 0;
    return {
      ...post,
      kindLabel: post.kind === 'NEED' ? t.kindNeed : t.kindEvent,
      noHref: !post.href,
      stageLabel: t.stages[post.stage] || post.stage,
      stageBg,
      stageFg,
      pipeline: STAGES.map((stage, index) => ({
        label: t.pipeline[stage],
        bg: index < post.stageIndex ? COLORS.forest : index === post.stageIndex ? COLORS.clay : COLORS.sand,
        fg: index <= post.stageIndex ? COLORS.ink : '#8C7F6F',
      })),
      hasOffers: offerList.length > 0,
      offersOpen: offersOpen ? 'true' : '',
      offersLabel: offersOpen ? t.hideOffers : t.viewOffers(post.offers),
      toggleOffers: () => toggleOpen(offersKey),
      allOffersLabel: t.allOffers(post.offers),
      offerList: offerList.map((offer) => ({
        ...offer,
        jobsLabel: t.jobs(offer.jobs),
        opacity: accepted && !offer.accepted ? 0.55 : 1,
        accept: async () => {
          const sure = await ctx.ask({ title: t.acceptTitle(offer.name), body: t.acceptBody(offer.price, post.title, offer.name), input: false, confirmLabel: t.acceptOffer });
          if (!sure) return;
          ctx.run(`accept:${offer.id}`, () => ctx.api.post(`/api/offers/${offer.id}`, { action: 'accept' }, { idempotent: true }), {
            success: (result) => t.acceptedToast(result.reference),
          });
        },
        pay: () =>
          ctx.run(
            `pay:${offer.bookingId}`,
            () => withStepUp(ctx, (code) => ctx.api.post(`/api/bookings/${offer.bookingId}/pay`, { channel: 'CARD', code }, { idempotent: true })),
            { success: (result) => (result?.mode === 'test' ? t.paidTest : result ? t.paid : null) },
          ),
      })),
      hasAnalytics: post.kind === 'EVENT' && post.status !== 'DRAFT',
      pausedPressed: post.paused ? 'true' : 'false',
      pauseLabel: post.paused ? t.resume : t.pause,
      pause: () =>
        post.kind === 'NEED'
          ? setStatus(post.paused ? 'resume' : 'pause', {}, post.paused ? t.needLive : t.needPaused)
          : setStatus(post.paused ? 'publish' : 'pause', {}, post.paused ? t.eventLive : t.eventPaused),
      publish: () => setStatus('publish', {}, t.published),
      shareLabel: state.copied === shareKey ? t.linkCopied : t.share,
      share: () => {
        copyText(post.shareUrl);
        flashCopied(shareKey);
      },
      closeLabel: post.kind === 'NEED' ? t.closeNeed : post.status === 'DRAFT' ? t.deleteDraft : t.cancelEvent,
      close: async () => {
        if (post.kind === 'NEED') {
          const sure = await ctx.ask({ title: t.closeTitle, body: t.closeBody, input: false, confirmLabel: t.closeNeedConfirm, danger: true });
          if (sure) setStatus('close', {}, t.closed);
          return;
        }
        if (post.status === 'DRAFT') {
          const sure = await ctx.ask({ title: t.deleteTitle, body: t.deleteBody, input: false, confirmLabel: t.deleteDraft, danger: true });
          if (sure) setStatus('archive', {}, t.draftDeleted);
          return;
        }
        const reason = await ctx.ask({ title: t.cancelTitle, body: t.cancelBody, placeholder: t.cancelPlaceholder, maxLength: 300, confirmLabel: t.cancelConfirm });
        if (reason) setStatus('cancel', { reason }, t.cancelled);
      },
    };
  });

  // ── Saved ─────────────────────────────────────────────────────────────
  const savedNow = savedSet(state, data.saved.map((event) => event.slug));
  const toggleSave = saveToggler(me, set, ctx, { saved: t.savedBack, removed: t.removed });
  const saved = data.saved
    .filter((event) => savedNow.has(event.slug))
    .map((event) => {
      const [dow = '', dayMonth = ''] = event.date.split(' · ');
      const [day = '', mon = ''] = dayMonth.split(' ');
      return {
        href: event.href,
        img: event.img,
        title: event.title,
        price: event.isFree ? t.free : event.price,
        city: cityOnly(event.city),
        dow,
        day,
        mon,
        unsave: () => toggleSave(event),
      };
    });

  // ── Calendar ──────────────────────────────────────────────────────────
  const { cells, byDay } = monthGrid(state.month, data.calendar, data.today, state.day, (day) => set((current) => ({ ...current, day })), t.months);
  const onSelected = state.day ? byDay.get(state.day) || [] : [];
  const selected = onSelected[0];
  const selDate = (() => {
    if (!state.day) return '';
    const [year, month, date] = state.day.split('-').map(Number);
    const weekday = t.weekdaysLong[(new Date(Date.UTC(year, month - 1, date)).getUTCDay() + 6) % 7];
    return `${weekday} ${date} ${t.months[month - 1]}`.toUpperCase();
  })();

  // ── Email alerts ──────────────────────────────────────────────────────
  const prefToggle = (key, label, save) => ({
    label,
    checked: data.prefs[key] ? 'true' : 'false',
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
  const [year, monthNumber] = state.month.split('-').map(Number);

  return {
    shell: shellValues(me, ctx, {
      active: 'tickets',
      faces: data.organizers.map((organizer) => ({ name: organizer.name, initials: organizer.init, href: `/events?organizer=${organizer.slug}` })),
    }),
    t,
    tabs: TABS.map((key) => ({
      label: t.tabs[key],
      pressed: state.tab === key ? 'true' : 'false',
      count: key === 'notifications' && unread ? String(unread) : '',
      go: () => goTab(key),
    })),
    isUpcoming: state.tab === 'upcoming',
    isNotifications: state.tab === 'notifications',
    isPosts: state.tab === 'posts',
    isSaved: state.tab === 'saved',
    isCalendar: state.tab === 'calendar',

    upcoming,
    waitlist,
    noUpcoming: upcoming.length === 0 && waitlist.length === 0,
    walletPoints: wallet.points.toLocaleString('en-US'),
    walletValue: wallet.value,
    referralHeadline: referral.friends ? t.friendsJoined(referral.friends) : t.bringPeople,
    referralRule: t.referralRule(referral.joinPoints, referral.ticketPoints),
    referralLink: referral.link,
    copyRefLabel: state.copied === 'referral' ? t.copied : t.copy,
    copyRef: () => {
      copyText(referral.link);
      flashCopied('referral');
    },
    referralCta: referral.points ? t.pointsEarned(referral.points.toLocaleString('en-US')) : t.howReferrals,

    notices: data.notices.map((notice) => {
      const [icon, bg] = TOPIC_BADGES[notice.topic] || TOPIC_BADGES.NEWS;
      return {
        ...notice,
        icon,
        bg,
        unread: notice.unread ? 'true' : 'false',
        // Opening a notice marks it read on the way to where it points.
        open: (event) => {
          event.preventDefault();
          const go = () => window.location.assign(notice.href);
          if (notice.unread) markRead([notice.id]).finally(go);
          else go();
        },
      };
    }),
    noNotices: data.notices.length === 0,
    unreadNote: unread ? t.unread(unread) : t.caughtUp,
    markAllRead: () => markRead(null),
    prefs: [
      prefToggle('reminders', t.prefReminders, channelPref('REMINDERS')),
      prefToggle('offers', t.prefOffers, channelPref('OFFERS')),
      prefToggle('social', t.prefSocial, channelPref('SOCIAL')),
      prefToggle('digest', t.prefDigest, (enabled) => ctx.api.put('/api/account/notifications', { weeklyDigest: enabled })),
    ],

    posts,
    noPosts: posts.length === 0,

    saved,
    noSaved: saved.length === 0,

    weekdays: t.weekdays,
    monthName: `${t.months[monthNumber - 1]} ${year}`,
    prevMonth: () => set((current) => ({ ...current, month: shiftMonth(current.month, -1), day: null })),
    nextMonth: () => set((current) => ({ ...current, month: shiftMonth(current.month, 1), day: null })),
    monthDays: cells,
    hasSel: Boolean(selected),
    selDate,
    selTitle: selected?.title || '',
    selMeta: selected ? `${selected.meta}${onSelected.length > 1 ? ` · ${t.and} ${onSelected.slice(1).map((entry) => entry.title).join(', ')}` : ''}` : '',
    selHref: selected?.href || '#',
    clearSel: () => set((current) => ({ ...current, day: null })),

    ticketOpen: Boolean(shown),
    ticket: shown
      ? {
          code: `${t.ticketWord} ${shown.code} · ${shown.tier}`.toUpperCase(),
          title: ticketEvent.title,
          when: ticketEvent.date,
          venue: placeLabel(ticketEvent.venue, ticketEvent.city),
          holder: shown.holder,
          used: shown.used ? 'true' : 'false',
          heading: shown.used ? t.scanned : t.showAtDoor,
          opacity: shown.used ? 0.45 : 1,
          qrSrc: shown.qr,
          downloadName: `twendezetu-ticket-${shown.code}.svg`,
          many: ticketCount > 1,
          pos: t.ofTotal((state.ticket.index % ticketCount) + 1, ticketCount),
          prev: () => stepTicket(-1),
          next: () => stepTicket(1),
        }
      : null,
    closeTicket: () => set((current) => ({ ...current, ticket: null })),
  };
}

// Escape closes the ticket; the header bell opens the Notifications tab in
// place instead of reloading the page.
export function onMount(ctx, setState, root) {
  const onKey = (event) => {
    if (event.key === 'Escape') setState((current) => (current.ticket ? { ...current, ticket: null } : current));
  };
  const onBell = (event) => {
    const bell = event.target.closest?.('a[href="/my-twende?tab=notifications"]');
    if (!bell) return;
    event.preventDefault();
    setState((current) => ({ ...current, tab: 'notifications', day: null }));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'notifications');
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0 });
  };
  window.addEventListener('keydown', onKey);
  root.addEventListener('click', onBell);
  return () => {
    window.removeEventListener('keydown', onKey);
    root.removeEventListener('click', onBell);
  };
}
