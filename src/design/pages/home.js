// The home page: sections of events first, vendors second. Signed-in members
// get their own sections on top and three views: For You, Following, New.

import { eventPrice, scrollShelf, shellValues } from './shared';

export const initialState = { tab: 'forYou' };

const TABS = [
  ['forYou', 'For You'],
  ['following', 'Following'],
  ['fresh', 'New'],
];

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/(^|[\s&/-])(\p{L})/gu, (match, space, letter) => space + letter.toUpperCase());
}

function eventCards(events, currency, rates) {
  return events.map((event) => ({
    href: event.href,
    img: event.img,
    when: event.when || '',
    price: eventPrice(event, currency, rates),
    rank: event.rank || '',
    organizer: event.organizer,
    organizerVerified: event.organizerVerified,
    title: event.title,
    meta: `${event.date} · ${event.city}`,
    cat: event.cat,
    goingLabel: event.going > 0 ? `${event.going} going` : '',
  }));
}

// One section. `kind` picks the layout; everything else is shared.
function section(kind, { key, title, note = '', href = '', ...rest }) {
  const scrollId = `tz-shelf-${key}`;
  const scrolls = kind === 'events' || kind === 'needs';
  return {
    key,
    title,
    note,
    href,
    plainTitle: !href,
    scrollId,
    scrolls,
    prev: () => scrollShelf(scrollId, -1),
    next: () => scrollShelf(scrollId, 1),
    isEvents: kind === 'events',
    isVendors: kind === 'vendors',
    isFaces: kind === 'faces',
    isList: kind === 'list',
    isNeeds: kind === 'needs',
    isEmpty: kind === 'empty',
    ...rest,
  };
}

function publicSections(data, cards) {
  const list = [];
  if (data.thisWeek.length) {
    list.push(section('events', { key: 'week', title: data.thisWeekTitle, note: 'Tonight, this weekend and the days ahead', href: '/events?when=week', events: cards(data.thisWeek) }));
  }
  if (data.trending.length) {
    list.push(section('events', { key: 'trending', title: data.trendingTitle, note: 'Most RSVPs and tickets in the last two weeks', href: '/events?sort=trending', events: cards(data.trending) }));
  }
  if (data.vendors.length) {
    list.push(
      section('vendors', {
        key: 'vendors',
        title: 'Vendors to book',
        note: 'DJs, caterers, tents, drivers and photographers, verified by us',
        href: '/vendors',
        vendors: data.vendors.map((vendor) => ({
          href: `/vendors/${vendor.slug}`,
          img: vendor.img,
          name: vendor.name,
          verified: vendor.verified,
          sub: [titleCase(vendor.cat), titleCase(vendor.city), vendor.rating === 'NEW' ? 'New' : `★ ${vendor.rating}`].join(' · '),
        })),
      }),
    );
  }
  for (const shelf of data.categories) {
    list.push(section('events', { key: `cat-${shelf.key.toLowerCase()}`, title: shelf.title, note: shelf.note, href: `/events?category=${shelf.key}`, events: cards(shelf.events) }));
  }
  for (const chart of data.cityCharts) {
    list.push(section('events', { key: `city-${chart.city.replace(/\W+/g, '-').toLowerCase()}`, title: `Top in ${chart.city}`, note: `The most popular events in ${chart.city} right now`, href: `/events?city=${encodeURIComponent(chart.city)}`, events: cards(chart.events) }));
  }
  if (data.staffPicks.length) {
    list.push(section('events', { key: 'picks', title: 'Staff picks', note: 'Chosen by the Twendezetu team', events: cards(data.staffPicks) }));
  }
  if (data.needs.length) {
    list.push(
      section('needs', {
        key: 'needs',
        title: 'Vendors wanted',
        note: 'Organizers looking for help. Vendors reply with offers from their dashboard',
        needs: data.needs.map((need) => ({
          href: '/provider-dashboard',
          category: need.category,
          title: need.title,
          meta: need.meta,
          offers: need.offers === 1 ? '1 offer so far' : `${need.offers} offers so far`,
        })),
      }),
    );
  }
  if (!list.length) {
    list.push(section('empty', { key: 'none', title: 'Nothing on yet', emptyText: 'No upcoming events have been posted yet.', emptyHref: '/create-event', emptyLink: 'Post the first one →' }));
  }
  return list;
}

function faceSection(mine) {
  if (!mine.favourites.length) {
    return section('empty', {
      key: 'faces',
      title: 'Your organizers & vendors',
      emptyText: 'Follow organizers and vendors you like and their news shows up here first.',
      emptyHref: '/vendors',
      emptyLink: 'Find vendors to follow →',
    });
  }
  return section('faces', {
    key: 'faces',
    title: 'Your organizers & vendors',
    faces: mine.favourites.map((face) => ({ ...face, noImg: !face.img })),
  });
}

function personalSections(mine, tab, cards) {
  const list = [];
  const moreFrom = mine.moreFrom.map((group) =>
    section('events', { key: `more-${group.slug}`, title: `More from ${group.name}`, href: `/events?organizer=${group.slug}`, events: cards(group.events) }),
  );

  if (tab === 'following') {
    list.push(faceSection(mine));
    if (mine.fromFollowed.length) list.push(section('events', { key: 'followed', title: 'From organizers you follow', events: cards(mine.fromFollowed) }));
    list.push(...moreFrom);
    return list;
  }

  list.push(faceSection(mine));
  if (mine.comingUp.length) {
    list.push(
      section('list', {
        key: 'coming',
        title: 'Coming up for you',
        note: 'Your tickets and RSVPs',
        href: '/my-twende?tab=upcoming',
        items: mine.comingUp.map((event) => ({
          href: event.href,
          img: event.img,
          organizer: event.organizer,
          title: event.title,
          meta: `${event.when || event.date} · ${event.kind === 'TICKET' ? 'Ticket' : 'RSVP'}`,
        })),
      }),
    );
  }
  if (mine.fromFollowed.length) list.push(section('events', { key: 'followed', title: 'From organizers you follow', events: cards(mine.fromFollowed) }));
  list.push(...moreFrom);
  if (mine.saved.length) list.push(section('events', { key: 'saved', title: 'Saved for later', href: '/my-twende?tab=saved', events: cards(mine.saved) }));
  return list;
}

export function values(state, set, ctx) {
  const { data } = state;
  const currency = data.me.signedIn ? data.me.currency : null;
  const cards = (events) => eventCards(events, currency, data.rates);

  const mine = data.personal;
  let sections;
  if (!mine) {
    sections = publicSections(data, cards);
  } else if (state.tab === 'fresh') {
    sections = [
      section('events', { key: 'fresh', title: 'Just posted', note: 'The newest events on Twendezetu', href: '/events?sort=new', events: cards(data.fresh) }),
      ...publicSections(data, cards).filter((item) => item.key === 'week'),
    ];
  } else if (state.tab === 'following') {
    sections = personalSections(mine, 'following', cards);
  } else {
    sections = [...personalSections(mine, 'forYou', cards), ...publicSections(data, cards)];
  }

  const next = mine?.nextUp;
  return {
    shell: shellValues(data.me, ctx, { active: 'home' }),
    signedIn: data.me.signedIn,
    signedOut: !data.me.signedIn,
    tabs: TABS.map(([key, label]) => ({
      label,
      pressed: state.tab === key ? 'true' : 'false',
      pick: () => set((current) => ({ ...current, tab: key })),
    })),
    sections,
    nextUp: next
      ? {
          img: next.img,
          title: next.title,
          meta: `${next.when ? `${next.when.charAt(0)}${next.when.slice(1).toLowerCase()}` : next.date} · ${next.time}`,
          label: next.kind === 'TICKET' ? 'YOUR NEXT EVENT · TICKET' : 'YOUR NEXT EVENT · RSVP',
          href: next.kind === 'TICKET' ? '/my-twende?tab=upcoming' : next.href,
          cta: next.kind === 'TICKET' ? 'Show ticket' : 'View event',
        }
      : null,
  };
}
