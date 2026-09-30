// The frame shared by the browsing pages: the top bar, the icon rail on wide
// screens and the tab bar on phones. Bindings live under `shell`, supplied
// by shellValues() in src/design/pages/shared.js; its words come from
// src/design/i18n.js, so the frame follows the English / Kiswahili switch.

const icon = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  now: '<circle cx="12" cy="12" r="2"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
  categories: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  trending: '<path d="M12 3c.5 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.8 1.2 2.8 2.3 3.2C10.8 9 11 5.5 12 3z"/>',
  week: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/>',
  events: '<path d="M4 7.5V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 0 0-5Z"/><path d="M14 5v10"/>',
  tickets: '<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 6v2M14.5 11v2M14.5 16v2"/>',
  vendors: '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5V20h16V9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M10 20v-5h4v5"/>',
  star: '<path d="m12 3.5 2.4 5 5.4.6-4 3.7 1.1 5.4L12 15.5l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="currentColor" stroke="none"/>',
  saved: '<path d="M6.5 4h11v16l-5.5-3.8L6.5 20Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  me: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 6.5 8 6.5 8-6.5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 18a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.5M17.5 18a5.5 5.5 0 0 0-2.5-4.6"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 19h2M19 14h1"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  chat: '<path d="M5 5h14v10h-9l-4 4v-4H5z"/>',
  list: '<path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="m15 6-6 6 6 6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
};

export function svg(name, size = 22) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[name]}</svg>`;
}

// The English / Kiswahili switch, in the account menu and the guest menu.
const LANGUAGE = `
            <div class="tz-lang">
              <span>{{ shell.t.language }}</span>
              <div class="tz-lang__pick" role="group" aria-label="{{ shell.t.language }}">
                <button type="button" aria-pressed="{{ shell.langEn }}" onClick="{{ shell.setEnglish }}">EN</button>
                <button type="button" aria-pressed="{{ shell.langSw }}" onClick="{{ shell.setSwahili }}">SW</button>
              </div>
            </div>`;

export const SITE_HEADER = `
  <header class="tz-top">
    <a href="/" class="tz-logo-link tz-top__logo" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
    <form class="tz-search" role="search" onSubmit="{{ shell.search }}">
      ${svg('search', 18)}
      <input type="search" name="q" value="{{ shell.q }}" placeholder="{{ shell.t.search }}" aria-label="{{ shell.t.search }}" autocomplete="off">
    </form>
    <sc-if value="{{ shell.hasCities }}">
      <details class="tz-menu tz-city tz-hide-sm">
        <summary aria-label="{{ shell.t.city }}">${svg('pin', 17)}<span>{{ shell.cityName }}</span></summary>
        <div class="tz-menu__panel">
          <sc-for list="{{ shell.cities }}" as="c"><button type="button" class="tz-city__item" aria-current="{{ c.current }}" onClick="{{ c.pick }}"><span>{{ c.label }}</span><span class="tz-city__count">{{ c.count }}</span></button></sc-for>
        </div>
      </details>
    </sc-if>
    <nav class="tz-menus" aria-label="Main">
      <details class="tz-menu">
        <summary>{{ shell.t.events }}</summary>
        <div class="tz-menu__panel">
          <a href="/events">{{ shell.t.allEvents }}</a>
          <a href="/events?when=week">{{ shell.t.thisWeek }}</a>
          <a href="/events?when=weekend">{{ shell.t.thisWeekend }}</a>
          <a href="/events?price=free">{{ shell.t.freeEvents }}</a>
          <hr>
          <sc-for list="{{ shell.categories }}" as="c"><a href="{{ c.href }}">{{ c.label }}</a></sc-for>
        </div>
      </details>
      <details class="tz-menu">
        <summary>{{ shell.t.vendors }}</summary>
        <div class="tz-menu__panel">
          <a href="/vendors">{{ shell.t.allVendors }}</a>
          <hr>
          <sc-for list="{{ shell.vendorCategories }}" as="c"><a href="{{ c.href }}">{{ c.label }}</a></sc-for>
          <hr>
          <a href="/create-event?kind=need">{{ shell.t.postNeedOffers }}</a>
          <a href="/provider-verification">{{ shell.t.becomeVendor }}</a>
        </div>
      </details>
      <details class="tz-menu">
        <summary>{{ shell.t.forOrganizers }}</summary>
        <div class="tz-menu__panel">
          <a href="/create-event">{{ shell.t.postEvent }}</a>
          <a href="/create-event">{{ shell.t.sellTickets }}</a>
          <a href="/organizer-analytics">{{ shell.t.analytics }}</a>
          <a href="/checkin">{{ shell.t.checkin }}</a>
          <a href="/organizer-payouts">{{ shell.t.payouts }}</a>
          <a href="/referral-rewards">{{ shell.t.referrals }}</a>
        </div>
      </details>
    </nav>
    <div class="tz-top__actions">
      <sc-if value="{{ shell.signedOut }}">
        <a href="/create-event" class="tz-button tz-button--outline tz-hide-sm">${svg('plus', 16)} {{ shell.t.postEvent }}</a>
        <a href="/sign-in?mode=register" class="tz-button tz-button--solid">{{ shell.t.signUp }}</a>
        <a href="/sign-in" class="tz-link tz-hide-sm">{{ shell.t.logIn }}</a>
        <details class="tz-menu tz-menu--burger">
          <summary aria-label="{{ shell.t.menu }}">${svg('burger', 24)}</summary>
          <div class="tz-menu__panel tz-menu__panel--right">
            <a href="/sign-in">{{ shell.t.logIn }}</a>
            <a href="/sign-in?mode=register">{{ shell.t.signUp }}</a>
            <a href="/vendors">{{ shell.t.allVendors }}</a>
            <a href="/create-event?kind=need">{{ shell.t.postNeed }}</a>
            <a href="/create-event">{{ shell.t.forOrganizers }}</a>
            <a href="/disputes">{{ shell.t.help }}</a>
            <a href="/mobile">{{ shell.t.app }}</a>
            <hr>${LANGUAGE}
          </div>
        </details>
      </sc-if>
      <sc-if value="{{ shell.signedIn }}">
        <a href="/create-event" class="tz-button tz-button--outline tz-hide-sm">${svg('plus', 16)} {{ shell.t.create }}</a>
        <a href="/my-twende?tab=notifications" class="tz-iconbtn" aria-label="{{ shell.bellLabel }}">${svg('bell')}<sc-if value="{{ shell.unread }}"><span class="tz-dot">{{ shell.unread }}</span></sc-if></a>
        <a href="/messages" class="tz-iconbtn tz-hide-sm" aria-label="{{ shell.t.messages }}">${svg('mail')}</a>
        <details class="tz-menu tz-menu--account">
          <summary aria-label="{{ shell.t.menu }}"><span class="tz-avatar">{{ shell.initials }}</span>${svg('burger', 22)}</summary>
          <div class="tz-menu__panel tz-menu__panel--right">
            <div class="tz-menu__who"><strong>{{ shell.name }}</strong><sc-if value="{{ shell.homeCity }}"><span>{{ shell.homeCity }}</span></sc-if></div>
            <a href="/my-twende">{{ shell.t.myTwende }}</a>
            <a href="/my-twende?tab=upcoming">{{ shell.t.myTickets }}</a>
            <a href="/my-twende?tab=saved">{{ shell.t.savedEvents }}</a>
            <a href="/messages">{{ shell.t.messages }}</a>
            <a href="/points-wallet">{{ shell.t.wallet }}</a>
            <sc-if value="{{ shell.isVendor }}"><a href="/provider-dashboard">{{ shell.t.vendorDashboard }}</a></sc-if>
            <sc-if value="{{ shell.isStaff }}"><a href="/admin">{{ shell.t.adminConsole }}</a></sc-if>
            <sc-if value="{{ shell.isFinance }}"><a href="/finance">{{ shell.t.financeConsole }}</a></sc-if>
            <a href="/settings">{{ shell.t.settings }}</a>
            <a href="/disputes">{{ shell.t.help }}</a>
            <hr>${LANGUAGE}
            <hr>
            <button type="button" class="tz-menu__signout" onClick="{{ shell.signOut }}">{{ shell.t.signOut }}</button>
          </div>
        </details>
      </sc-if>
    </div>
  </header>
`;

// [key, href, word, icon]. The last two carry a filled round badge.
const RAIL = [
  ['home', '/', 'home', 'home'],
  ['now', '/#now', 'now', 'now'],
  ['events', '/events', 'categories', 'categories'],
  ['trending', '/events?sort=trending', 'trending', 'trending'],
  ['tickets', '{{ shell.myEventsHref }}', 'myEvents', 'tickets'],
  ['vendors', '/vendors', 'vendors', 'vendors'],
];

const TABS = [
  ['home', '/', 'home', 'home'],
  ['events', '/events', 'events', 'events'],
  ['post', '/create-event', 'post', 'plus'],
  ['vendors', '/vendors', 'vendors', 'vendors'],
  ['me', '{{ shell.meHref }}', 'me', 'me'],
];

export const SITE_RAIL = `
  <nav class="tz-rail" aria-label="Shortcuts">
    ${RAIL.map(([key, href, word, name]) => `<a href="${href}" class="tz-rail__item" aria-current="{{ shell.current.${key} }}">${svg(name)}<span>{{ shell.t.${word} }}</span></a>`).join('\n    ')}
    <a href="{{ shell.organizerHref }}" class="tz-rail__item" aria-current="{{ shell.current.organizers }}"><span class="tz-rail__badge tz-rail__badge--maroon">${svg('star', 14)}</span><span>{{ shell.t.forOrganizers }}</span></a>
    <a href="/provider-verification" class="tz-rail__item"><span class="tz-rail__badge tz-rail__badge--forest">${svg('plus', 14)}</span><span>{{ shell.t.becomeVendor }}</span></a>
    <sc-if value="{{ shell.railFaces.length }}">
      <div class="tz-rail__rule"></div>
      <sc-for list="{{ shell.railFaces }}" as="f"><a href="{{ f.href }}" class="tz-rail__face" title="{{ f.name }}" aria-label="{{ f.name }}">{{ f.initials }}</a></sc-for>
    </sc-if>
  </nav>
`;

export const SITE_TABBAR = `
  <nav class="tz-tabbar" aria-label="Sections">
    ${TABS.map(([key, href, word, name]) => `<a href="${href}" class="tz-tabbar__item${key === 'post' ? ' tz-tabbar__item--post' : ''}" aria-current="{{ shell.current.${key} }}">${svg(name)}<span>{{ shell.t.${word} }}</span></a>`).join('\n    ')}
  </nav>
`;

export const SITE_FOOTER = `
  <footer class="tz-foot">
    <img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--sm">
    <nav aria-label="Footer">
      <a href="/events">{{ shell.t.events }}</a>
      <a href="/vendors">{{ shell.t.vendors }}</a>
      <a href="/create-event">{{ shell.t.postEvent }}</a>
      <a href="/provider-verification">{{ shell.t.becomeVendor }}</a>
      <a href="/disputes">{{ shell.t.help }}</a>
      <a href="/mobile">{{ shell.t.app }}</a>
      <a href="/settings">{{ shell.t.settings }}</a>
    </nav>
    <p>{{ shell.t.footerCities }}</p>
  </footer>
`;

const TICK = '<svg class="tz-tick" width="14" height="14" viewBox="0 0 24 24" aria-label="Verified" role="img"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#F7F1E6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// One event card, led by its date. `v` is the loop variable it is rendered
// inside; its values come from eventCardValues() in pages/shared.js. The
// image carries RSVP / tickets, save and share on hover (always shown on
// touch screens).
export function eventCard(v) {
  return `<div class="tz-ecard">
    <div class="tz-ecard__art">
      <a href="{{ ${v}.href }}" class="tz-ecard__img" tabindex="-1" aria-hidden="true"><img src="{{ ${v}.img }}" alt="" loading="lazy"></a>
      <span class="tz-ecard__price">{{ ${v}.price }}</span>
      <sc-if value="{{ ${v}.rank }}"><span class="tz-ecard__rank">{{ ${v}.rank }}</span></sc-if>
      <div class="tz-ecard__over">
        <a href="{{ ${v}.ctaHref }}" class="tz-ecard__cta">{{ ${v}.cta }}</a>
        <span class="tz-ecard__acts">
          <button type="button" class="tz-round" aria-label="{{ ${v}.saveLabel }}" aria-pressed="{{ ${v}.savedPressed }}" onClick="{{ ${v}.toggleSave }}">${svg('heart', 16)}</button>
          <button type="button" class="tz-round" aria-label="{{ ${v}.shareLabel }}" onClick="{{ ${v}.share }}">${svg('share', 16)}</button>
        </span>
      </div>
    </div>
    <div class="tz-ecard__body">
      <div class="tz-datebox" data-today="{{ ${v}.today }}"><span>{{ ${v}.dow }}</span><strong>{{ ${v}.day }}</strong><span>{{ ${v}.mon }}</span></div>
      <div class="tz-ecard__text">
        <a href="{{ ${v}.href }}" class="tz-ecard__title">{{ ${v}.title }}</a>
        <div class="tz-ecard__by"><span>{{ ${v}.organizer }}</span><sc-if value="{{ ${v}.organizerVerified }}">${TICK}</sc-if></div>
      </div>
    </div>
    <div class="tz-chips"><sc-for list="{{ ${v}.chips }}" as="c"><a href="{{ c.href }}" class="tz-chip">{{ c.label }}</a></sc-for></div>
  </div>`;
}

// A live event: wide picture, LIVE flag and how many are through the door.
export function liveCard(v) {
  return `<div class="tz-live">
    <a href="{{ ${v}.href }}" class="tz-live__art">
      <img src="{{ ${v}.img }}" alt="" loading="lazy">
      <span class="tz-live__flag"><span class="tz-pulse"></span>{{ ${v}.liveLabel }}</span>
      <sc-if value="{{ ${v}.hereLabel }}"><span class="tz-live__here">${svg('people', 13)}{{ ${v}.hereLabel }}</span></sc-if>
    </a>
    <div class="tz-ecard__by tz-live__by"><span class="tz-mini-avatar">{{ ${v}.organizerInitials }}</span><span>{{ ${v}.organizer }}</span><sc-if value="{{ ${v}.organizerVerified }}">${TICK}</sc-if></div>
    <a href="{{ ${v}.href }}" class="tz-ecard__title">{{ ${v}.title }}</a>
    <div class="tz-chips"><sc-for list="{{ ${v}.chips }}" as="c"><a href="{{ c.href }}" class="tz-chip">{{ c.label }}</a></sc-for></div>
  </div>`;
}

// One vendor as a square card: photo, rating, trade, name, jobs and rate.
export function vendorCard(v) {
  return `<div class="tz-vcard">
    <a href="{{ ${v}.href }}" class="tz-vcard__art"><img src="{{ ${v}.img }}" alt="" loading="lazy"><span class="tz-ecard__price">{{ ${v}.ratingLabel }}</span></a>
    <div class="tz-vcard__cat">{{ ${v}.catLabel }}</div>
    <a href="{{ ${v}.href }}" class="tz-vcard__name"><span>{{ ${v}.name }}</span><sc-if value="{{ ${v}.verified }}">${TICK}</sc-if></a>
    <div class="tz-vcard__sub">{{ ${v}.sub }}</div>
    <div class="tz-chips"><sc-for list="{{ ${v}.chips }}" as="c"><a href="{{ c.href }}" class="tz-chip">{{ c.label }}</a></sc-for></div>
  </div>`;
}

// One vendor in a compact row (events page search results).
export function vendorTile(v) {
  return `<div class="tz-person">
    <a href="{{ ${v}.href }}"><img class="tz-person__img" src="{{ ${v}.img }}" alt="" loading="lazy"></a>
    <a href="{{ ${v}.href }}" class="tz-person__text" style="color: inherit; text-decoration: none;">
      <div class="tz-person__name"><span>{{ ${v}.name }}</span><sc-if value="{{ ${v}.verified }}">${TICK}</sc-if></div>
      <div class="tz-person__sub">{{ ${v}.sub }}</div>
    </a>
    <a href="{{ ${v}.href }}" class="tz-button tz-button--dark">Contact</a>
  </div>`;
}

// A section heading: a small kicker in the other language, the title in
// Anton capitals, a note, then an action, arrows and "See all".
export function sectionHead(s) {
  return `<div class="tz-shelf__head">
    <div class="tz-shelf__words">
      <sc-if value="{{ ${s}.kicker }}"><div class="tz-kicker">{{ ${s}.kicker }}</div></sc-if>
      <sc-if value="{{ ${s}.href }}"><a href="{{ ${s}.href }}" class="tz-shelf__title">{{ ${s}.title }}</a></sc-if>
      <sc-if value="{{ ${s}.plainTitle }}"><h2 class="tz-shelf__title">{{ ${s}.title }}</h2></sc-if>
      <sc-if value="{{ ${s}.note }}"><p class="tz-shelf__note">{{ ${s}.note }}</p></sc-if>
    </div>
    <div class="tz-arrows">
      <sc-if value="{{ ${s}.action }}"><a href="{{ ${s}.action.href }}" class="tz-shelf__action">{{ ${s}.action.label }}</a></sc-if>
      <sc-if value="{{ ${s}.scrolls }}"><button type="button" onClick="{{ ${s}.prev }}" aria-label="{{ ${s}.backLabel }}">${svg('left', 20)}</button><button type="button" onClick="{{ ${s}.next }}" aria-label="{{ ${s}.onLabel }}">${svg('right', 20)}</button></sc-if>
      <sc-if value="{{ ${s}.href }}"><a href="{{ ${s}.href }}" class="tz-seeall">{{ ${s}.seeAll }}</a></sc-if>
    </div>
  </div>`;
}
