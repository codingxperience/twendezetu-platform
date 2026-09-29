// The frame shared by the browsing pages: the top bar, the icon rail on wide
// screens and the tab bar on phones. Bindings live under `shell`, supplied
// by shellValues() in src/design/pages/shared.js.

const icon = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  week: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/>',
  events: '<path d="M4 7.5V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 0 0-5Z"/><path d="M14 5v10"/>',
  vendors: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.3c2.4-.2 4.3 1.3 5 4.2"/>',
  saved: '<path d="M6.5 4h11v16l-5.5-3.8L6.5 20Z"/>',
  tickets: '<path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 0 0-4V4H4Z"/><path d="M9 4v12" stroke-dasharray="2 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  me: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 6.5 8 6.5 8-6.5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
};

export function svg(name, size = 22) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[name]}</svg>`;
}

export const SITE_HEADER = `
  <header class="tz-top">
    <a href="/" class="tz-logo-link tz-top__logo" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
    <form class="tz-search" role="search" onSubmit="{{ shell.search }}">
      ${svg('search', 18)}
      <input type="search" name="q" value="{{ shell.q }}" placeholder="Search events and vendors" aria-label="Search events and vendors" autocomplete="off">
    </form>
    <nav class="tz-menus" aria-label="Main">
      <details class="tz-menu">
        <summary>Events</summary>
        <div class="tz-menu__panel">
          <a href="/events">All upcoming events</a>
          <a href="/events?when=week">This week</a>
          <a href="/events?when=weekend">This weekend</a>
          <a href="/events?price=free">Free events</a>
          <hr>
          <sc-for list="{{ shell.categories }}" as="c"><a href="{{ c.href }}">{{ c.label }}</a></sc-for>
        </div>
      </details>
      <details class="tz-menu">
        <summary>Vendors</summary>
        <div class="tz-menu__panel">
          <a href="/vendors">All vendors</a>
          <hr>
          <sc-for list="{{ shell.vendorCategories }}" as="c"><a href="{{ c.href }}">{{ c.label }}</a></sc-for>
          <hr>
          <a href="/create-event?kind=need">Post a need, get offers</a>
        </div>
      </details>
      <details class="tz-menu">
        <summary>For organizers</summary>
        <div class="tz-menu__panel">
          <a href="/create-event">Post an event</a>
          <a href="/create-event">Sell tickets</a>
          <a href="/organizer-analytics">Event analytics</a>
          <a href="/organizer-payouts">Payouts</a>
          <hr>
          <a href="/provider-verification">Become a vendor</a>
        </div>
      </details>
    </nav>
    <div class="tz-top__actions">
      <sc-if value="{{ shell.signedOut }}">
        <a href="/create-event" class="tz-button tz-button--outline tz-hide-sm">${svg('plus', 16)} Post an event</a>
        <a href="/sign-in?mode=register" class="tz-button tz-button--solid">Sign up</a>
        <a href="/sign-in" class="tz-link">Log in</a>
      </sc-if>
      <sc-if value="{{ shell.signedIn }}">
        <a href="/create-event" class="tz-button tz-button--outline tz-hide-sm">${svg('plus', 16)} Create</a>
        <a href="/my-twende?tab=notifications" class="tz-iconbtn" aria-label="{{ shell.bellLabel }}">${svg('bell')}<sc-if value="{{ shell.unread }}"><span class="tz-dot">{{ shell.unread }}</span></sc-if></a>
        <a href="/messages" class="tz-iconbtn tz-hide-sm" aria-label="Messages">${svg('mail')}</a>
        <details class="tz-menu tz-menu--account">
          <summary aria-label="Your account"><span class="tz-avatar">{{ shell.initials }}</span></summary>
          <div class="tz-menu__panel tz-menu__panel--right">
            <div class="tz-menu__who">{{ shell.name }}</div>
            <a href="/my-twende">My Twende</a>
            <a href="/my-twende?tab=upcoming">My tickets &amp; RSVPs</a>
            <a href="/my-twende?tab=saved">Saved events</a>
            <a href="/points-wallet">Points wallet</a>
            <sc-if value="{{ shell.isVendor }}"><a href="/provider-dashboard">Vendor dashboard</a></sc-if>
            <sc-if value="{{ shell.isStaff }}"><a href="/admin">Admin console</a></sc-if>
            <sc-if value="{{ shell.isFinance }}"><a href="/finance">Finance console</a></sc-if>
            <a href="/settings">Settings</a>
            <hr>
            <button type="button" onClick="{{ shell.signOut }}">Sign out</button>
          </div>
        </details>
      </sc-if>
    </div>
  </header>
`;

const RAIL = [
  ['home', '/', 'Home', 'home'],
  ['week', '/events?when=week', 'This week', 'week'],
  ['events', '/events', 'Events', 'events'],
  ['vendors', '/vendors', 'Vendors', 'vendors'],
  ['saved', '/my-twende?tab=saved', 'Saved', 'saved'],
  ['tickets', '/my-twende?tab=upcoming', 'My tickets', 'tickets'],
];

const TABS = [
  ['home', '/', 'Home', 'home'],
  ['events', '/events', 'Events', 'events'],
  ['post', '/create-event', 'Post', 'plus'],
  ['vendors', '/vendors', 'Vendors', 'vendors'],
  ['me', '{{ shell.meHref }}', 'Me', 'me'],
];

export const SITE_RAIL = `
  <nav class="tz-rail" aria-label="Shortcuts">
    ${RAIL.map(([key, href, label, name]) => `<a href="${href}" class="tz-rail__item" aria-current="{{ shell.current.${key} }}">${svg(name)}<span>${label}</span></a>`).join('\n    ')}
  </nav>
`;

export const SITE_TABBAR = `
  <nav class="tz-tabbar" aria-label="Sections">
    ${TABS.map(([key, href, label, name]) => `<a href="${href}" class="tz-tabbar__item${key === 'post' ? ' tz-tabbar__item--post' : ''}" aria-current="{{ shell.current.${key} }}">${svg(name)}<span>${label}</span></a>`).join('\n    ')}
  </nav>
`;

export const SITE_FOOTER = `
  <footer class="tz-foot">
    <img src="/brand/mark.png" alt="" width="179" height="209" class="tz-foot__mark">
    <nav aria-label="Footer">
      <a href="/events">Events</a>
      <a href="/vendors">Vendors</a>
      <a href="/create-event">Post an event</a>
      <a href="/provider-verification">Become a vendor</a>
      <a href="/mobile">On your phone</a>
    </nav>
    <p>Nairobi · Kampala · Dar es Salaam · Kigali · NY/NJ</p>
  </footer>
`;


const TICK = '<svg class="tz-tick" width="13" height="13" viewBox="0 0 24 24" aria-label="Verified" role="img"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#F7F1E6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// One event card. `v` is the loop variable it is rendered inside.
export function eventCard(v) {
  return `<a href="{{ ${v}.href }}" class="tz-ecard">
    <div class="tz-ecard__art">
      <img src="{{ ${v}.img }}" alt="" loading="lazy">
      <sc-if value="{{ ${v}.when }}"><span class="tz-ecard__badge">{{ ${v}.when }}</span></sc-if>
      <span class="tz-ecard__price">{{ ${v}.price }}</span>
      <sc-if value="{{ ${v}.rank }}"><span class="tz-ecard__rank">{{ ${v}.rank }}</span></sc-if>
    </div>
    <div class="tz-ecard__by"><span>{{ ${v}.organizer }}</span><sc-if value="{{ ${v}.organizerVerified }}">${TICK}</sc-if></div>
    <div class="tz-ecard__title">{{ ${v}.title }}</div>
    <div class="tz-ecard__meta">{{ ${v}.meta }}</div>
    <div class="tz-chips"><span class="tz-pill">{{ ${v}.cat }}</span><sc-if value="{{ ${v}.goingLabel }}"><span class="tz-pill">{{ ${v}.goingLabel }}</span></sc-if></div>
  </a>`;
}

// One vendor in the "vendors to book" grid.
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

// A section heading with its note, arrows and "See all".
export function sectionHead(s) {
  return `<div class="tz-shelf__head">
    <div>
      <sc-if value="{{ ${s}.href }}"><a href="{{ ${s}.href }}" class="tz-shelf__title">{{ ${s}.title }}</a></sc-if>
      <sc-if value="{{ ${s}.plainTitle }}"><h2 class="tz-shelf__title">{{ ${s}.title }}</h2></sc-if>
      <sc-if value="{{ ${s}.note }}"><p class="tz-shelf__note">{{ ${s}.note }}</p></sc-if>
    </div>
    <div class="tz-arrows">
      <sc-if value="{{ ${s}.scrolls }}"><button type="button" onClick="{{ ${s}.prev }}" aria-label="Scroll back">‹</button><button type="button" onClick="{{ ${s}.next }}" aria-label="Scroll on">›</button></sc-if>
      <sc-if value="{{ ${s}.href }}"><a href="{{ ${s}.href }}" class="tz-seeall">See all</a></sc-if>
    </div>
  </div>`;
}
