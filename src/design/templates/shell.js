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
  // Menu icons
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  tag: '<path d="M3.5 12.5v-8a1 1 0 0 1 1-1h8l8 8-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  grill: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8.5 18.5 7 21.5M15.5 18.5l1.5 3M9 3c-1 1.5 1 2.5 0 4.5M13 3c-1 1.5 1 2.5 0 4.5M17 3c-1 1.5 1 2.5 0 4.5"/>',
  music: '<path d="M9 18V5.5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16.5" r="2.5"/>',
  rings: '<circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/><path d="m10.5 4.5 1.5-2 1.5 2-1.5 2z"/>',
  church: '<path d="M12 2.5v5M9.5 5h5"/><path d="M5 21v-9l7-4 7 4v9z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7.5 4 2.9-1.5 4.6h-5L8 10.4z"/><path d="M12 3v4.5M16 10.4l4.4-1.5M14.5 15l2.7 3.8M9.5 15l-2.7 3.8M8 10.4 3.6 8.9"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>',
  utensils: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3"/><path d="M17.5 21V3c-2 1-3.5 3.5-3.5 7.5h3.5"/>',
  tent: '<path d="M12 3.5 2.5 20.5h19z"/><path d="M8.5 20.5 12 13l3.5 7.5"/>',
  car: '<path d="M4 16.5v-4.5l2-5h12l2 5v4.5z"/><path d="M4 12h16"/><circle cx="8" cy="16.5" r="2"/><circle cx="16" cy="16.5" r="2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  megaphone: '<path d="M4 10v4h3l8 4.5v-13L7 10z"/><path d="M18 9a4 4 0 0 1 0 6M7 14l1 5h2.5l-1-4.2"/>',
  badge: '<path d="m12 2.8 2.3 1.7 2.8-.2.9 2.7 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.7-2.8-.2L12 21.2l-2.3-1.7-2.8.2-.9-2.7-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.7 2.8.2z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
  plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8.5 16v-4M12.5 16V8M16.5 16v-6"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v.01M18 14.5v.01"/>',
  gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8.5h14V12M12 8v12.5"/><path d="M12 8C10 4 6.5 4.5 7.5 7c.4 1 2.5 1 4.5 1zM12 8c2-4 5.5-3.5 4.5-1-.4 1-2.5 1-4.5 1z"/>',
  wallet: '<path d="M4 7a2 2 0 0 1 2-2h11v4"/><path d="M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
  dashboard: '<rect x="3.5" y="3.5" width="7" height="8" rx="1"/><rect x="13.5" y="3.5" width="7" height="5" rx="1"/><rect x="13.5" y="11.5" width="7" height="9" rx="1"/><rect x="3.5" y="14.5" width="7" height="6" rx="1"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.5M12 16.5v.01"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  signIn: '<path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 16l4-4-4-4M14 12H4"/>',
  signOut: '<path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M15 16l4-4-4-4M19 12H9"/>',
  userPlus: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M19 8v6M16 11h6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
};

export function svg(name, size = 22) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[name]}</svg>`;
}

// One menu entry: an icon and a label bound to `label` (a path under shell).
function item(href, name, label, extra = '') {
  return `<a href="${href}"${extra}>${svg(name, 18)}<span>{{ ${label} }}</span></a>`;
}

const EVENT_CATEGORIES = [
  ['NYAMA_CHOMA', 'grill'],
  ['MUSIC', 'music'],
  ['COMMUNITY', 'people'],
  ['WEDDINGS', 'rings'],
  ['FAITH', 'church'],
  ['SPORTS', 'ball'],
];

const VENDOR_CATEGORIES = [
  ['MUSIC_DJS', 'headphones'],
  ['CATERING', 'utensils'],
  ['TENTS_EQUIPMENT', 'tent'],
  ['TRANSPORT', 'car'],
  ['PHOTOGRAPHY', 'camera'],
  ['DECOR_MC', 'mic'],
];

// The English / Kiswahili switch, in the account menu and the guest menu.
const LANGUAGE = `
            <div class="tz-lang">
              <span class="tz-lang__label">${svg('globe', 18)}{{ shell.t.language }}</span>
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
        <summary aria-label="{{ shell.t.city }}">${svg('pin', 17)}<span class="tz-city__name">{{ shell.cityName }}</span></summary>
        <div class="tz-menu__panel">
          <sc-for list="{{ shell.cities }}" as="c"><button type="button" class="tz-city__item" aria-current="{{ c.current }}" onClick="{{ c.pick }}">${svg('pin', 18)}<span>{{ c.label }}</span><span class="tz-city__count">{{ c.count }}</span></button></sc-for>
        </div>
      </details>
    </sc-if>
    <nav class="tz-menus" aria-label="Main">
      <details class="tz-menu">
        <summary>{{ shell.t.events }}</summary>
        <div class="tz-menu__panel">
          ${item('/events', 'events', 'shell.t.allEvents')}
          ${item('/events?when=week', 'week', 'shell.t.thisWeek')}
          ${item('/events?when=weekend', 'sun', 'shell.t.thisWeekend')}
          ${item('/events?price=free', 'tag', 'shell.t.freeEvents')}
          <hr>
          ${EVENT_CATEGORIES.map(([key, name]) => item(`/events?category=${key}`, name, `shell.t.catTitle.${key}`)).join('\n          ')}
        </div>
      </details>
      <details class="tz-menu">
        <summary>{{ shell.t.vendors }}</summary>
        <div class="tz-menu__panel">
          ${item('/vendors', 'vendors', 'shell.t.allVendors')}
          <hr>
          ${VENDOR_CATEGORIES.map(([key, name]) => item(`/vendors?category=${key}`, name, `shell.vendorLabels.${key}`)).join('\n          ')}
          <hr>
          ${item('/create-event?kind=need', 'megaphone', 'shell.t.postNeedOffers')}
          ${item('/provider-verification', 'badge', 'shell.t.becomeVendor')}
        </div>
      </details>
      <details class="tz-menu">
        <summary>{{ shell.t.forOrganizers }}</summary>
        <div class="tz-menu__panel">
          ${item('/create-event', 'plusCircle', 'shell.t.postEvent')}
          ${item('/create-event', 'tickets', 'shell.t.sellTickets')}
          ${item('/organizer-analytics', 'chart', 'shell.t.analytics')}
          ${item('/checkin', 'scan', 'shell.t.checkin')}
          ${item('/organizer-payouts', 'cash', 'shell.t.payouts')}
          ${item('/referral-rewards', 'gift', 'shell.t.referrals')}
        </div>
      </details>
    </nav>
    <div class="tz-top__actions">
      <sc-if value="{{ shell.signedOut }}">
        <a href="/create-event" class="tz-button tz-button--outline tz-top__post" aria-label="{{ shell.t.postEvent }}">${svg('plus', 16)}<span>{{ shell.t.postEvent }}</span></a>
        <a href="/sign-in?mode=register" class="tz-button tz-button--solid">{{ shell.t.signUp }}</a>
        <a href="/sign-in" class="tz-link tz-top__login">{{ shell.t.logIn }}</a>
        <details class="tz-menu tz-menu--burger">
          <summary aria-label="{{ shell.t.menu }}">${svg('burger', 24)}</summary>
          <div class="tz-menu__panel tz-menu__panel--right">
            ${item('/sign-in', 'signIn', 'shell.t.logIn')}
            ${item('/sign-in?mode=register', 'userPlus', 'shell.t.signUp')}
            <hr>
            ${item('/events', 'events', 'shell.t.allEvents')}
            ${item('/vendors', 'vendors', 'shell.t.allVendors')}
            ${item('/create-event?kind=need', 'megaphone', 'shell.t.postNeed')}
            ${item('/create-event', 'plusCircle', 'shell.t.postEvent')}
            ${item('/provider-verification', 'badge', 'shell.t.becomeVendor')}
            <hr>
            ${item('/disputes', 'help', 'shell.t.help')}
            ${item('/mobile', 'phone', 'shell.t.app')}
            <hr>${LANGUAGE}
          </div>
        </details>
      </sc-if>
      <sc-if value="{{ shell.signedIn }}">
        <a href="/create-event" class="tz-button tz-button--outline tz-top__post" aria-label="{{ shell.t.create }}">${svg('plus', 16)}<span>{{ shell.t.create }}</span></a>
        <a href="/my-twende?tab=notifications" class="tz-iconbtn" aria-label="{{ shell.bellLabel }}">${svg('bell')}<sc-if value="{{ shell.unread }}"><span class="tz-dot">{{ shell.unread }}</span></sc-if></a>
        <a href="/messages" class="tz-iconbtn tz-hide-sm" aria-label="{{ shell.t.messages }}">${svg('mail')}</a>
        <details class="tz-menu tz-menu--account">
          <summary aria-label="{{ shell.t.menu }}"><span class="tz-avatar">{{ shell.initials }}</span>${svg('burger', 22)}</summary>
          <div class="tz-menu__panel tz-menu__panel--right">
            <div class="tz-menu__who"><strong>{{ shell.name }}</strong><sc-if value="{{ shell.homeCity }}"><span>{{ shell.homeCity }}</span></sc-if></div>
            ${item('/my-twende', 'me', 'shell.t.myTwende')}
            ${item('/my-twende?tab=upcoming', 'tickets', 'shell.t.myTickets')}
            ${item('/my-twende?tab=saved', 'saved', 'shell.t.savedEvents')}
            ${item('/messages', 'mail', 'shell.t.messages')}
            ${item('/points-wallet', 'wallet', 'shell.t.wallet')}
            <sc-if value="{{ shell.isVendor }}">${item('/provider-dashboard', 'dashboard', 'shell.t.vendorDashboard')}</sc-if>
            <sc-if value="{{ shell.isStaff }}">${item('/admin', 'shield', 'shell.t.adminConsole')}</sc-if>
            <sc-if value="{{ shell.isFinance }}">${item('/finance', 'cash', 'shell.t.financeConsole')}</sc-if>
            <div class="tz-menu__more">
              <hr>
              ${item('/events', 'events', 'shell.t.allEvents')}
              ${item('/vendors', 'vendors', 'shell.t.allVendors')}
              ${item('/organizer-analytics', 'chart', 'shell.t.forOrganizers')}
            </div>
            <hr>
            ${item('/settings', 'gear', 'shell.t.settings')}
            ${item('/disputes', 'help', 'shell.t.help')}
            <hr>${LANGUAGE}
            <hr>
            <button type="button" class="tz-menu__signout" onClick="{{ shell.signOut }}">${svg('signOut', 18)}<span>{{ shell.t.signOut }}</span></button>
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
