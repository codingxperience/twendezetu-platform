// The public sections of the home page, built from upcoming event cards and
// recent interest. Pure: the loader in home.js supplies the rows.

import { EVENT_CATEGORIES, EVENT_CATEGORY_ORDER, whenBadge } from '../../shared/format.js';

const DAY = 24 * 60 * 60 * 1000;

// Section titles for each category, in the words people use for them.
export const CATEGORY_SHELVES = Object.freeze({
  MUSIC: { title: 'Music & DJ nights', note: 'Concerts, club nights and live sets' },
  NYAMA_CHOMA: { title: 'Nyama choma & cookouts', note: 'Grills, picnics and food festivals' },
  COMMUNITY: { title: 'Community gatherings', note: 'Harambees, meet-ups and association events' },
  WEDDINGS: { title: 'Weddings & ruracio', note: 'Celebrations open to guests' },
  FAITH: { title: 'Faith & worship', note: 'Services, crusades and choir events' },
  SPORTS: { title: 'Sports & fitness', note: 'Tournaments, runs and watch parties' },
});

export function byStart(a, b) {
  return Date.parse(a.startsAt) - Date.parse(b.startsAt);
}

function byInterest(interest) {
  return (a, b) => (interest[b.id] || 0) - (interest[a.id] || 0) || b.going - a.going || byStart(a, b);
}

// Shelves shared by both versions of the page.
export function publicShelves({ events, interest, vendors, needs }, { city = null, now = new Date() } = {}) {
  const withBadge = events.map((event) => ({ ...event, when: whenBadge(event.startsAt, event.timezone, now) }));
  const weekEnd = now.getTime() + 7 * DAY;

  // A quiet week widens to the next month, so the first row is never bare.
  let thisWeek = withBadge.filter((event) => Date.parse(event.startsAt) <= weekEnd).sort(byStart);
  let thisWeekTitle = 'Happening this week';
  if (thisWeek.length < 4) {
    thisWeek = withBadge.filter((event) => Date.parse(event.startsAt) <= now.getTime() + 30 * DAY).sort(byStart);
    thisWeekTitle = 'Coming up soon';
  }
  thisWeek = thisWeek.slice(0, 18);

  const inCity = city ? withBadge.filter((event) => event.city.toLowerCase() === city.toLowerCase()) : [];
  const trendingPool = inCity.length >= 4 ? inCity : withBadge;
  const trending = [...trendingPool].filter((event) => (interest[event.id] || 0) > 0 || event.going > 0).sort(byInterest(interest)).slice(0, 18);

  const categories = EVENT_CATEGORY_ORDER.map((key) => {
    const list = withBadge.filter((event) => event.category === key).sort(byInterest(interest));
    const pull = list.reduce((sum, event) => sum + event.going + (interest[event.id] || 0), 0);
    return { key, label: EVENT_CATEGORIES[key], ...CATEGORY_SHELVES[key], count: list.length, pull, events: list.slice(0, 18) };
  })
    .filter((shelf) => shelf.events.length)
    // The categories people are going to most come first.
    .sort((a, b) => b.pull - a.pull);

  const cityCounts = new Map();
  for (const event of withBadge) cityCounts.set(event.city, (cityCounts.get(event.city) || 0) + 1);
  const cityCharts = [...cityCounts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => ({
      city: name,
      events: withBadge
        .filter((event) => event.city === name)
        .sort(byInterest(interest))
        .slice(0, 12)
        .map((event, index) => ({ ...event, rank: index + 1 })),
    }));

  const staffPicks = withBadge.filter((event) => event.featured).slice(0, 18);
  const fresh = withBadge
    .filter((event) => event.publishedAt)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 18);

  return {
    thisWeek,
    thisWeekTitle,
    trending,
    trendingTitle: trendingPool === inCity ? `Trending in ${inCity[0].city}` : 'Trending now',
    categories,
    cityCharts,
    staffPicks,
    fresh,
    vendors,
    needs,
    total: events.length,
  };
}
