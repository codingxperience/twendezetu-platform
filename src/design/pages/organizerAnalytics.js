// Organizer analytics. Figures come from the server; the page refreshes them
// every half minute while it is open and visible.

import { COLORS } from './shared';

const REFRESH_MS = 30_000;

export const initialState = {};

export function onMount(ctx) {
  const timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') ctx.reload().catch(() => {});
  }, REFRESH_MS);
  return () => window.clearInterval(timer);
}

const FUNNEL_COLORS = [COLORS.forest, COLORS.sage, COLORS.clayLight, COLORS.clay];
const KPI_TONES = [
  { bg: COLORS.paper, fg: COLORS.ink },
  { bg: COLORS.paper, fg: COLORS.ink },
  { bg: COLORS.forest, fg: COLORS.cream },
  { bg: COLORS.clay, fg: COLORS.ink },
];

export function values(state, set, ctx) {
  const { data } = state;
  const analytics = data.analytics;
  const slug = analytics?.event.slug;

  return {
    me: data.me,
    hasEvent: Boolean(analytics),
    noEvents: !analytics,
    events: data.events,
    eventSlug: slug || '',
    pickEvent: (event) => ctx.navigate(`/organizer-analytics?event=${encodeURIComponent(event.target.value)}`),
    checkinHref: slug ? `/checkin?event=${slug}` : '/checkin',
    hasDoor: Boolean(analytics && !analytics.event.isFree),
    eventHref: slug ? `/events/${slug}` : '/',
    editHref: slug ? `/create-event?edit=${slug}` : '/create-event',

    title: analytics?.event.title || '',
    eventMeta: analytics ? `${analytics.event.date}${analytics.event.status === 'PUBLISHED' ? '' : ` · ${analytics.event.status}`}` : '',
    kpis: (analytics?.kpis || []).map((kpi, index) => ({ ...kpi, ...KPI_TONES[index] })),

    funnel: (analytics?.funnel || []).map((row, index) => ({ ...row, color: FUNNEL_COLORS[index] })),
    funnelNote: analytics?.funnelNote || '',

    sources: analytics?.sources || [],
    hasSources: Boolean(analytics?.sources.length),
    noSources: !analytics?.sources.length,
    referrers: analytics?.referrers || [],
    hasReferrers: Boolean(analytics?.referrers.length),
    noReferrers: !analytics?.referrers.length,

    isPaid: Boolean(analytics && !analytics.event.isFree),
    weekSales: analytics?.sales.week || '',
    salesBars: (analytics?.sales.bars || []).map((bar) => ({ ...bar, color: bar.peak ? COLORS.clay : 'rgba(247,241,230,0.35)' })),
    salesPeak: analytics?.sales.peak ? `BEST DAY: ${analytics.sales.peak}` : 'NO SALES IN THE LAST 8 DAYS',
    salesTerms: analytics?.sales.terms || '',

    tiers: (analytics?.tiers || []).map((tier) => ({ ...tier, color: tier.soldOut ? COLORS.red : tier.share >= 0.8 ? COLORS.clay : COLORS.forest })),
    hasTiers: Boolean(analytics?.tiers.length),
    tierNote: analytics?.tierNote || '',
  };
}
