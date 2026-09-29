// The events page: filters are plain links, so every view has an address
// people can share, and the back button works as expected.

import { eventPrice, shellValues } from './shared';

const WHEN = [
  [undefined, 'Any time'],
  ['week', 'This week'],
  ['weekend', 'This weekend'],
  ['month', 'This month'],
];

const SORT = [
  ['soon', 'Soonest'],
  ['trending', 'Most popular'],
  ['new', 'Newest'],
];

const KEYS = ['q', 'category', 'city', 'when', 'price', 'organizer', 'sort'];

// The address for the current filters with some of them changed. Defaults
// are left out, and changing a filter goes back to the first page.
function hrefWith(query, changes = {}) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = next[key];
    if (value == null || value === '' || (key === 'sort' && value === 'soon')) continue;
    params.set(key, value);
  }
  if (changes.page) params.set('page', String(changes.page));
  const text = params.toString();
  return text ? `/events?${text}` : '/events';
}

function pill(query, key, value, label) {
  return { label, href: hrefWith(query, { [key]: value }), current: (query[key] || undefined) === value ? 'true' : 'false' };
}

export function values(state, set, ctx) {
  const { data } = state;
  const { query } = data;
  const currency = data.me.signedIn ? data.me.currency : null;
  const categoryTitle = data.categories.find((category) => category.key === query.category)?.title;

  const heading = query.q ? `Results for “${query.q}”` : data.organizer ? data.organizer.name : categoryTitle || (query.city ? `Events in ${query.city}` : 'Events');
  const count = `${data.total} upcoming event${data.total === 1 ? '' : 's'}`;
  const filtered = KEYS.some((key) => key !== 'sort' && query[key]);

  return {
    shell: shellValues(data.me, ctx, { active: query.when === 'week' ? 'week' : 'events', q: query.q || '' }),
    heading,
    summary: data.organizer ? `${count} from this organizer${data.organizer.followers ? ` · ${data.organizer.followers} follower${data.organizer.followers === 1 ? '' : 's'}` : ''}` : count,
    organizerVerified: Boolean(data.organizer?.verified),
    whenPills: WHEN.map(([value, label]) => pill(query, 'when', value, label)),
    categoryPills: [pill(query, 'category', undefined, 'All'), ...data.categories.map((category) => pill(query, 'category', category.key, category.title))],
    pricePills: [pill(query, 'price', undefined, 'Any price'), pill(query, 'price', 'free', 'Free')],
    sortPills: SORT.map(([value, label]) => ({ label, href: hrefWith(query, { sort: value }), current: query.sort === value ? 'true' : 'false' })),
    cityOptions: [{ value: '', label: 'All cities' }, ...data.cities.map((city) => ({ value: city.name, label: `${city.name} (${city.count})` }))],
    city: query.city || '',
    // Selects report both input and change; navigate once, on change.
    pickCity: (event) => {
      if (event.type === 'change') window.location.assign(hrefWith(query, { city: event.target.value || undefined }));
    },
    filtered,
    clearHref: query.q ? `/events?q=${encodeURIComponent(query.q)}` : '/events',
    vendors: data.vendors.map((vendor) => ({
      href: `/vendors/${vendor.slug}`,
      img: vendor.img,
      name: vendor.name,
      verified: vendor.verified,
      sub: `${vendor.city.charAt(0)}${vendor.city.slice(1).toLowerCase()} · ${vendor.rating === 'NEW' ? 'New' : `★ ${vendor.rating}`}`,
    })),
    hasVendors: data.vendors.length > 0,
    vendorsHref: query.q ? `/vendors?q=${encodeURIComponent(query.q)}` : '/vendors',
    events: data.events.map((event) => ({
      href: event.href,
      img: event.img,
      when: event.when || '',
      price: eventPrice(event, currency, data.rates),
      rank: '',
      organizer: event.organizer,
      organizerVerified: event.organizerVerified,
      title: event.title,
      meta: `${event.date} · ${event.city}`,
      cat: event.cat,
      goingLabel: event.going > 0 ? `${event.going} going` : '',
    })),
    hasEvents: data.events.length > 0,
    noEvents: data.events.length === 0,
    emptyText: data.organizer && !query.q ? `${data.organizer.name} has no upcoming events right now.` : 'No upcoming events match these filters.',
    hasMore: data.hasMore,
    moreHref: hrefWith(query, { page: query.page + 1 }),
  };
}
