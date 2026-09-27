// The event guide.

import { COLORS, eventPrice, nextCurrency, readPreference, scrollShelf, writePreference } from './shared';

export const initialState = { cat: 'All', lang: 'en', currency: null };

const CATEGORY_KEYS = new Set(['NYAMA_CHOMA', 'MUSIC', 'COMMUNITY', 'WEDDINGS', 'FAITH', 'SPORTS']);

export function stateFrom(data, params = {}) {
  return { currency: data.me.currency || 'USD', cat: CATEGORY_KEYS.has(params.cat) ? params.cat : 'All' };
}

export function onMount(ctx, set) {
  const currency = readPreference('currency', null);
  const lang = readPreference('lang', null);
  if (currency || lang) set((state) => ({ ...state, ...(currency ? { currency } : {}), ...(lang ? { lang } : {}) }));
}

const SERVICES = [
  { href: '/providers?category=PHOTOGRAPHY', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80', kicker: 'WITH SPECIAL CARE', title: 'Weddings & harusi', desc: 'Venues, convoys, caterers and photographers who shoot like family.' },
  { href: '/?cat=NYAMA_CHOMA', img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1400&q=80', kicker: 'THAT WON’T BE FORGOTTEN', title: 'Community & cookouts', desc: 'Nyama choma festivals, harambees, faith gatherings — every rika.' },
  { href: '/providers?category=MUSIC_DJS', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&q=80', kicker: 'FIND YOUR VIBE', title: 'Music & DJs', desc: 'Bongo flava, amapiano, gospel — book the set or sell the tickets.' },
  { href: '/create-event?kind=need', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1400&q=80', kicker: 'MASKED & MATCHED', title: 'The needs board', desc: 'Drivers, tents, chefs, escorts — post the need, compare the offers.' },
];

const PROCESS = {
  en: [
    { num: '01', title: 'Post', desc: 'An event or a need — free, in minutes. Your contacts are masked from day one.' },
    { num: '02', title: 'Share', desc: 'Every post gets a link built for WhatsApp and Facebook. Your circle spreads it for you.' },
    { num: '03', title: 'Match', desc: 'Providers in that city get notified and respond with offers, in-platform.' },
    { num: '04', title: 'Gather', desc: 'RSVP and tickets sync to calendars with reminders — 7 days, 1 day, 2 hours before.' },
    { num: '05', title: 'Settle', desc: 'Pay online, at the door, or pool points across borders. Fees only when money moves.' },
  ],
  sw: [
    { num: '01', title: 'Tangaza', desc: 'Tukio au hitaji — bure, kwa dakika chache. Mawasiliano yako yamefichwa tangu mwanzo.' },
    { num: '02', title: 'Sambaza', desc: 'Kila tangazo lina link ya WhatsApp na Facebook. Mtandao wako unakusambazia.' },
    { num: '03', title: 'Unganishwa', desc: 'Watoa huduma wa mji huo wanapata taarifa na kujibu na ofa, ndani ya jukwaa.' },
    { num: '04', title: 'Kusanyika', desc: 'RSVP na tiketi zinaingia kalenda zenye vikumbusho — siku 7, siku 1, saa 2 kabla.' },
    { num: '05', title: 'Lipana', desc: 'Lipa mtandaoni, mlangoni, au changishana pointi kuvuka mipaka. Ada ni pale pesa inapohamia tu.' },
  ],
};

function card(event, currency, rates) {
  return { ...event, price: eventPrice(event, currency, rates) };
}

export function values(state, set, ctx) {
  const { data } = state;
  const currency = state.currency || 'USD';
  const sw = state.lang === 'sw';
  const events = data.events.map((event) => card(event, currency, data.rates));
  const pickCategory = (key) => set((current) => ({ ...current, cat: key }));
  const shown = state.cat === 'All' ? events : events.filter((event) => event.category === state.cat);
  const featured = data.featured ? card(data.featured, currency, data.rates) : null;

  const shelves = data.categories
    .filter((category) => category.count > 0)
    .map((category) => {
      const scrollId = `tw-shelf-${category.key.toLowerCase()}`;
      const list = events.filter((event) => event.category === category.key);
      return {
        label: category.label,
        count: `${list.length} event${list.length === 1 ? '' : 's'}`,
        scrollId,
        prev: () => scrollShelf(scrollId, -1),
        next: () => scrollShelf(scrollId, 1),
        jump: () => pickCategory(category.key),
        events: list,
      };
    });

  const explore = events.filter((event) => event.slug !== featured?.slug).slice(0, 6);

  return {
    me: data.me,
    isEn: !sw,
    isSw: sw,
    langLabel: sw ? 'SW → EN' : 'EN → SW',
    toggleLang: () => {
      const lang = sw ? 'en' : 'sw';
      writePreference('lang', lang);
      set((current) => ({ ...current, lang }));
    },
    currency,
    cycleCurrency: () => {
      const next = nextCurrency(currency);
      writePreference('currency', next);
      set((current) => ({ ...current, currency: next }));
      if (data.me.signedIn) ctx.api.patch('/api/account/profile', { currency: next }).catch(() => {});
    },
    cityLabel: (data.city || 'Nairobi · Kampala · Dar · Kigali · NY/NJ').toUpperCase(),
    eventCount: shown.length,
    isAll: state.cat === 'All',
    isFiltered: state.cat !== 'All',
    featured: featured
      ? { ...featured, going: `${featured.going} going`, kicker: '[Tukio kuu — featured this month]', badge: featured.badge || 'FEATURED' }
      : { href: '/create-event', img: '', title: 'Post the first event', city: '', date: '', price: '', going: '', badge: 'NEW', blurb: 'The guide is empty right now. Be the first to post.', kicker: '[Karibu]' },
    explore,
    shelves,
    services: SERVICES,
    process: PROCESS[sw ? 'sw' : 'en'],
    categories: [{ key: 'All', label: 'All', count: events.length }, ...data.categories]
      .map((category) => {
        const active = state.cat === category.key;
        return {
          label: `${category.label} (${category.count})`,
          pick: () => pickCategory(category.key),
          bg: active ? COLORS.forest : COLORS.cream,
          fg: active ? COLORS.cream : COLORS.ink,
        };
      })
      .concat({
        label: 'Needs board ↓',
        pick: () => {
          const board = document.querySelector('[data-needs-board]');
          if (board) window.scrollTo({ top: board.offsetTop - 80, behavior: 'smooth' });
        },
        bg: COLORS.clay,
        fg: COLORS.ink,
      }),
    events: shown.slice(0, 48),
    moreStories: data.stories,
    needs: data.needs,
  };
}
