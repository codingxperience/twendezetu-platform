// The home page: events first, vendors second. Signed-out visitors get the
// hero and the public sections; members get their own sections on top and
// three views: For You, Following and Just posted. Every section heading
// carries a small kicker in the other language, the way the design does.

import { words } from '../i18n';
import { eventCardValues, saveToggler, savedSet, scrollShelf, shareLink, shellValues, vendorCardValues } from './shared';

export const initialState = { tab: 'forYou', saved: null, unsaved: null, following: null, ticketOpen: false };

// Round initials take these colours in turn: forest, maroon, sage, deep maroon.
const FACE_COLOURS = [
  ['#1F3A38', '#F7F1E6'],
  ['#820101', '#F7F1E6'],
  ['#7B8B6E', '#14201F'],
  ['#5C0000', '#F7F1E6'],
];

// Followed organizers start from the server and change here as people tap,
// so the Follow buttons answer at once.
export function stateFrom(data) {
  return { following: new Set(data.personal?.followingOrganizers || []) };
}

// "Lincoln Park · Jersey City, NJ", without saying the same place twice.
function placeLabel(venue, city) {
  if (!venue || String(city).includes(venue)) return city;
  if (String(venue).includes(city)) return venue;
  return `${venue} · ${city}`;
}

function cityOnly(city) {
  return String(city || '').split(' · ').pop().split(', ')[0];
}

// One section. `kind` picks the layout; everything else is shared.
function section(t, kind, { key, kicker = '', title, note = '', href = '', action = null, ...rest }) {
  const scrollId = `tz-shelf-${key}`;
  return {
    key,
    kicker,
    title,
    note,
    href,
    plainTitle: !href,
    seeAll: t.seeAll,
    action,
    scrollId,
    scrolls: ['events', 'live', 'vendors'].includes(kind),
    backLabel: t.scrollBack,
    onLabel: t.scrollOn,
    prev: () => scrollShelf(scrollId, -1),
    next: () => scrollShelf(scrollId, 1),
    isEvents: kind === 'events',
    isLive: kind === 'live',
    isVendors: kind === 'vendors',
    isFollow: kind === 'follow',
    isFaces: kind === 'faces',
    isList: kind === 'list',
    isEmpty: kind === 'empty',
    ...rest,
  };
}

export function values(state, set, ctx) {
  const { data } = state;
  const { me } = data;
  const t = words(me.locale);
  const mine = data.personal;
  const currency = me.signedIn ? me.currency : null;
  const saved = savedSet(state, mine?.savedSlugs);
  const following = state.following || new Set();
  const kick = (key) => t.kick[key] || '';
  const toSignIn = () => ctx.navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);

  const onSave = saveToggler(me, set, ctx, t);

  const onFollow = (organizer) => {
    if (!me.signedIn) return toSignIn();
    return ctx.run(`follow:${organizer.slug}`, async () => {
      const result = await ctx.api.post(`/api/organizers/${organizer.slug}/follow`);
      set((current) => {
        const next = new Set(current.following);
        if (result.following) next.add(organizer.slug);
        else next.delete(organizer.slug);
        return { ...current, following: next };
      });
      return result;
    }, { reloadAfter: false, success: (result) => (result.following ? t.nowFollowing(organizer.name) : t.unfollowed(organizer.name)) });
  };

  const cards = (events) => events.map((event) => eventCardValues(event, { t, currency, rates: data.rates, saved, onSave, ctx }));

  const liveCards = (events) =>
    events.map((event) => ({
      href: event.href,
      img: event.img,
      title: event.title,
      liveLabel: t.live,
      hereLabel: event.here > 0 ? t.here(event.here) : '',
      organizer: event.organizer,
      organizerInitials: event.organizer
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      organizerVerified: event.organizerVerified,
      chips: [
        { label: cityOnly(event.city), href: `/events?city=${encodeURIComponent(event.city)}` },
        { label: t.catChip[event.category], href: `/events?category=${event.category}` },
      ],
    }));

  const organizerCards = (organizers) =>
    organizers.map((organizer, index) => {
      const on = following.has(organizer.slug);
      const [bg, fg] = FACE_COLOURS[index % FACE_COLOURS.length];
      return {
        href: `/events?organizer=${organizer.slug}`,
        name: organizer.name,
        initials: organizer.initials,
        verified: organizer.verified,
        bg,
        fg,
        followersLabel: t.followers(organizer.followers),
        upcomingLabel: t.upcoming(organizer.upcoming),
        pressed: on ? 'true' : 'false',
        buttonLabel: on ? t.following : t.follow,
        toggle: () => onFollow(organizer),
      };
    });

  // ── Sections anyone can see ───────────────────────────────────────────
  const liveSection = data.live.length ? section(t, 'live', { key: 'now', kicker: kick('now'), title: t.nowTitle, live: liveCards(data.live) }) : null;
  const weekSection = data.thisWeek.length
    ? section(t, 'events', { key: 'week', kicker: kick('week'), title: data.thisWeekWide ? t.soonTitle : t.weekTitle, note: t.weekNote, href: '/events?when=week', events: cards(data.thisWeek) })
    : null;
  const trendingSection = data.trending.length
    ? section(t, 'events', {
        key: 'trending',
        kicker: kick('trending'),
        title: t.trendingTitle(data.trendingCity ? cityOnly(data.trendingCity) : null),
        note: t.trendingNote,
        href: '/events?sort=trending',
        events: cards(data.trending),
      })
    : null;
  // Members see organizers they did not follow when the page loaded; one
  // they follow now stays put, showing "Following", until the next visit.
  const toFollow = mine ? data.organizers.filter((organizer) => !mine.followingOrganizers.includes(organizer.slug)) : data.organizers;
  const organizersSection = toFollow.length
    ? section(t, 'follow', { key: 'organizers', kicker: kick('organizers'), title: t.orgsTitle, note: t.orgsNote, organizers: organizerCards(toFollow.slice(0, 6)) })
    : null;
  const vendorsSection = data.vendors.length
    ? section(t, 'vendors', {
        key: 'vendors',
        kicker: kick('vendors'),
        title: t.vendorsTitle,
        note: t.vendorsNote,
        href: '/vendors',
        action: { label: t.postNeed, href: '/create-event?kind=need' },
        vendors: data.vendors.map((vendor) => vendorCardValues(vendor, { t, locale: me.locale })),
      })
    : null;
  const categorySections = data.categories.map((shelf) =>
    section(t, 'events', {
      key: `cat-${shelf.key}`,
      kicker: t.catKick[shelf.key],
      title: t.catTitle[shelf.key],
      note: t.catNote[shelf.key],
      href: `/events?category=${shelf.key}`,
      events: cards(shelf.events),
    }),
  );
  const citySections = data.cityCharts.slice(0, 1).map((chart) =>
    section(t, 'events', {
      key: `city-${chart.city.replace(/\W+/g, '-').toLowerCase()}`,
      kicker: kick('city'),
      title: t.topCity(cityOnly(chart.city)),
      note: t.topCityNote(cityOnly(chart.city)),
      href: `/events?city=${encodeURIComponent(chart.city)}`,
      events: cards(chart.events),
    }),
  );
  const picksSection = data.staffPicks.length ? section(t, 'events', { key: 'picks', kicker: kick('picks'), title: t.picksTitle, note: t.picksNote, events: cards(data.staffPicks) }) : null;
  const freeSection = data.free.length ? section(t, 'events', { key: 'free', kicker: kick('free'), title: t.freeTitle, note: t.freeNote, href: '/events?price=free', events: cards(data.free) }) : null;
  const needsSection = data.needs.length
    ? section(t, 'list', {
        key: 'needs',
        kicker: kick('needs'),
        title: t.needsTitle,
        note: t.needsNote,
        action: { label: t.postNeed, href: '/create-event?kind=need' },
        items: data.needs.map((need) => ({
          href: '/provider-dashboard',
          img: '',
          badge: String(need.offers),
          status: t.offers(need.offers),
          live: 'false',
          when: [need.category, need.meta].filter(Boolean).join(' · '),
          title: need.title,
        })),
      })
    : null;

  const publicSections = () => {
    const list = [
      liveSection,
      weekSection,
      trendingSection,
      organizersSection,
      categorySections[0],
      categorySections[1],
      vendorsSection,
      ...categorySections.slice(2),
      ...citySections,
      picksSection,
      freeSection,
      needsSection,
    ].filter(Boolean);
    if (!list.length) list.push(section(t, 'empty', { key: 'none', kicker: kick('none'), title: t.nothingTitle, emptyText: t.nothingText, emptyHref: '/create-event', emptyLink: t.nothingLink }));
    return list;
  };

  // ── A member's own sections ───────────────────────────────────────────
  const facesSection = () =>
    mine.favourites.length
      ? section(t, 'faces', {
          key: 'faces',
          kicker: kick('faces'),
          title: t.topOrgs,
          action: { label: t.findOrgs, href: '#organizers' },
          faces: mine.favourites.map((face, index) => ({ ...face, noImg: !face.img, bg: FACE_COLOURS[index % FACE_COLOURS.length][0], fg: FACE_COLOURS[index % FACE_COLOURS.length][1] })),
        })
      : section(t, 'empty', { key: 'faces', kicker: kick('faces'), title: t.topOrgs, emptyText: t.emptyFaces, emptyHref: '/vendors', emptyLink: t.emptyFacesLink });

  const followedSection = () => (mine.fromFollowed.length ? section(t, 'events', { key: 'followed', kicker: kick('followed'), title: t.followedTitle, events: cards(mine.fromFollowed) }) : null);
  const moreFromSections = () =>
    mine.moreFrom.map((group) =>
      section(t, 'events', { key: `more-${group.slug}`, kicker: kick('more'), title: t.moreFrom(group.name), href: `/events?organizer=${group.slug}`, events: cards(group.events) }),
    );
  const comingSection = () =>
    mine.comingUp.length
      ? section(t, 'list', {
          key: 'coming',
          kicker: kick('coming'),
          title: t.comingTitle,
          note: t.comingNote,
          action: { label: t.openMyTwende, href: '/my-twende?tab=upcoming' },
          items: mine.comingUp.map((event) => {
            const onNow = event.when === 'ON NOW';
            return {
              href: event.href,
              img: event.img,
              badge: '',
              status: onNow ? t.statusLive : event.kind === 'TICKET' ? t.statusTicket : t.statusRsvp,
              live: onNow ? 'true' : 'false',
              when: `${event.date} · ${cityOnly(event.city)}`,
              title: event.title,
            };
          }),
        })
      : null;
  const savedSection = () => (mine.saved.length ? section(t, 'events', { key: 'saved', kicker: kick('saved'), title: t.savedTitle, href: '/my-twende?tab=saved', events: cards(mine.saved) }) : null);

  let sections;
  if (!mine) {
    sections = publicSections();
  } else if (state.tab === 'fresh') {
    sections = [
      section(t, 'events', { key: 'fresh', kicker: kick('fresh'), title: t.newTitle, note: t.newNote, href: '/events?sort=new', events: cards(data.fresh) }),
      weekSection,
    ].filter(Boolean);
  } else if (state.tab === 'following') {
    sections = [facesSection(), followedSection(), ...moreFromSections()].filter(Boolean);
  } else {
    const own = [facesSection(), followedSection(), comingSection(), liveSection, ...moreFromSections(), savedSection()].filter(Boolean);
    sections = [...own, ...publicSections().filter((item) => item.key !== 'now')];
  }

  const next = mine?.nextUp;
  const place = data.city || data.trendingCity;

  return {
    shell: shellValues(me, ctx, {
      active: 'home',
      cities: data.cities,
      city: data.city,
      faces: mine ? mine.favourites.map((face) => ({ name: face.name, initials: face.initials, href: face.href })) : [],
    }),
    signedIn: me.signedIn,
    signedOut: !me.signedIn,
    hero: {
      kicker: `KARIBU — ${(place ? cityOnly(place) : t.everywhere).toUpperCase()}`,
      a: t.heroA,
      b: t.heroB,
      // Shown one at a time by a CSS cycle (tz-words in globals.css).
      words: t.heroWords.map((word, index) => ({ word, delay: `${index * 2.4}s` })),
      sub: t.heroSub,
      cta: t.heroCta,
      alt: t.heroAlt,
      chips: data.categories.map((shelf) => ({ label: t.catChip[shelf.key], href: `#cat-${shelf.key}` })),
    },
    greeting: t.greeting(me.firstName || ''),
    tabs: [
      ['forYou', t.tabForYou],
      ['following', t.tabFollowing],
      ['fresh', t.tabNew],
    ].map(([key, label]) => ({
      label,
      pressed: state.tab === key ? 'true' : 'false',
      pick: () => set((current) => ({ ...current, tab: key })),
    })),
    sections,
    nextUp: next
      ? {
          img: next.img,
          title: next.title,
          sub: `${next.when === 'ON NOW' ? t.onNow : next.date} · ${next.time} · ${placeLabel(next.venue, next.city)}`,
          label: next.kind === 'TICKET' ? t.nextLabelTicket : t.nextLabelRsvp,
          liveLabel: next.when === 'ON NOW' ? t.live : '',
          href: next.href,
          hasTicket: Boolean(next.kind === 'TICKET' && next.ticketCode),
          qrLabel: t.showQr,
          openTicket: () => set((current) => ({ ...current, ticketOpen: true })),
          mapsLabel: t.directions,
          mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${next.venue}, ${next.city}`)}`,
          calendarLabel: t.addCal,
          calendarHref: `/api/events/${next.slug}/calendar`,
          shareLabel: t.share,
          share: () => shareLink(ctx, t, next.href, next.title),
          myEventsLabel: t.myEvents,
        }
      : null,
    ticketOpen: Boolean(state.ticketOpen && next?.ticketCode),
    ticket: next?.ticketCode
      ? {
          code: t.ticketTitle(next.ticketCode),
          title: next.title,
          when: `${next.date} · ${next.time}`,
          where: placeLabel(next.venue, next.city),
          qrSrc: `/api/tickets/${encodeURIComponent(next.ticketCode)}/qr`,
          downloadName: `twendezetu-ticket-${next.ticketCode}.svg`,
          downloadLabel: t.downloadQr,
          closeLabel: t.close,
        }
      : null,
    closeTicket: () => set((current) => ({ ...current, ticketOpen: false })),
    keepOpen: (event) => event.stopPropagation(),
  };
}

// Escape closes the ticket.
export function onMount(ctx, setState) {
  const onKey = (event) => {
    if (event.key === 'Escape') setState((current) => (current.ticketOpen ? { ...current, ticketOpen: false } : current));
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
