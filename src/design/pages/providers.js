// The provider directory: category chips, search by name or city.

import { COLORS, shellValues } from './shared';

export const initialState = { q: '', city: '' };

export function stateFrom(data) {
  return { q: data.filters.q || '', city: data.filters.city || '' };
}

function href({ category, city, q }) {
  const query = new URLSearchParams(Object.entries({ category, city, q }).filter(([, value]) => value)).toString();
  return `/vendors${query ? `?${query}` : ''}`;
}

export function values(state, set, ctx) {
  const { data } = state;
  const { filters } = data;
  const active = data.categories.find((item) => item.code === filters.category);
  const count = data.providers.length;
  const where = [filters.city ? `in ${filters.city}` : null, filters.q ? `matching “${filters.q}”` : null].filter(Boolean).join(' ');
  return {
    shell: shellValues(state.data.me, ctx, { active: 'vendors' }),
    me: data.me,
    accountLabel: data.me.signedIn ? 'My Twende' : 'Sign in',
    title: active?.code ? active.label : 'The directory',
    q: state.q,
    setQ: (event) => set((current) => ({ ...current, q: event.target.value })),
    city: state.city,
    setCity: (event) => set((current) => ({ ...current, city: event.target.value })),
    search: () => window.location.assign(href({ category: filters.category, city: state.city.trim(), q: state.q.trim() })),
    cities: data.cities,
    categories: data.categories.map((item) => {
      const current = item.code === filters.category;
      return { ...item, current: current ? 'page' : 'false', href: href({ category: item.code, city: filters.city, q: filters.q }), bg: current ? COLORS.forest : COLORS.paper, fg: current ? COLORS.cream : COLORS.ink };
    }),
    filtered: Boolean(filters.category || filters.city || filters.q),
    resultLine: `${count} ${count === 1 ? 'VENDOR' : 'VENDORS'}${where ? ` ${where.toUpperCase()}` : ''}`,
    empty: count === 0,
    providers: data.providers.map((provider) => ({
      ...provider,
      meta: `${provider.rating === 'NEW' ? 'NEW' : `★ ${provider.rating}`} · ${provider.jobs} JOBS · ${provider.city}`,
      rateLabel: provider.rate === 'QUOTE' ? 'Priced per job' : provider.rate,
    })),
  };
}
