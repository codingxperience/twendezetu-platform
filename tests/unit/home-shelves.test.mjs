import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ||= 'postgresql://test@localhost:5432/unused';
process.env.AUTH_SECRET ||= 'test-secret-that-is-long-enough-for-config';
const { whenBadge } = await import('../../src/shared/format.js');
const { whenWindow } = await import('../../src/server/services/events.js');
const { publicShelves } = await import('../../src/server/views/home-shelves.js');

const NOW = new Date('2026-09-29T10:00:00Z'); // a Tuesday

let serial = 0;
function event({ days, category = 'MUSIC', city = 'Nairobi, KE', going = 0, featured = false }) {
  serial += 1;
  return {
    id: `e${serial}`,
    title: `Event ${serial}`,
    category,
    city,
    going,
    featured,
    timezone: 'Africa/Nairobi',
    startsAt: new Date(NOW.getTime() + days * 86_400_000).toISOString(),
    publishedAt: new Date(NOW.getTime() - serial * 60_000).toISOString(),
  };
}

test('day badges follow the event’s own time zone', () => {
  assert.equal(whenBadge('2026-09-29T17:00:00Z', 'Africa/Nairobi', NOW), 'TODAY');
  assert.equal(whenBadge('2026-09-30T17:00:00Z', 'Africa/Nairobi', NOW), 'TOMORROW');
  assert.equal(whenBadge('2026-10-03T17:00:00Z', 'Africa/Nairobi', NOW), null);
  assert.equal(whenBadge('2026-09-29T09:00:00Z', 'Africa/Nairobi', NOW), 'ON NOW');
  // 10 pm in New York on the 29th is still "today" there.
  assert.equal(whenBadge('2026-09-30T02:00:00Z', 'America/New_York', NOW), 'TODAY');
});

test('"this weekend" is the coming Friday to Sunday, or what is left of it', () => {
  const tuesday = whenWindow('weekend', NOW);
  assert.equal(tuesday.from.toISOString(), '2026-10-02T00:00:00.000Z');
  assert.equal(tuesday.to.toISOString(), '2026-10-05T00:00:00.000Z');
  const saturday = whenWindow('weekend', new Date('2026-10-03T15:00:00Z'));
  assert.equal(saturday.from.toISOString(), '2026-10-03T15:00:00.000Z');
  assert.equal(saturday.to.toISOString(), '2026-10-05T00:00:00.000Z');
  assert.equal(whenWindow('nonsense', NOW), null);
});

test('a quiet week widens the first row to the coming month', () => {
  const quiet = publicShelves({ events: [event({ days: 2 }), event({ days: 12 }), event({ days: 20 }), event({ days: 60 })], interest: {}, vendors: [], needs: [] }, { now: NOW });
  assert.equal(quiet.thisWeekTitle, 'Coming up soon');
  assert.equal(quiet.thisWeek.length, 3);

  const busy = publicShelves({ events: [1, 2, 3, 4, 5].map((days) => event({ days })), interest: {}, vendors: [], needs: [] }, { now: NOW });
  assert.equal(busy.thisWeekTitle, 'Happening this week');
  const starts = busy.thisWeek.map((e) => Date.parse(e.startsAt));
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b), 'soonest first');
});

test('trending ranks recent RSVPs and tickets, and uses the member’s city when it can', () => {
  const events = [
    event({ days: 5, city: 'Newark, NJ', going: 300 }),
    event({ days: 6, city: 'Kampala, UG', going: 10 }),
    event({ days: 7, city: 'Kampala, UG', going: 5 }),
    event({ days: 8, city: 'Kampala, UG', going: 2 }),
    event({ days: 9, city: 'Kampala, UG', going: 1 }),
  ];
  const interest = { [events[3].id]: 40 };
  const everywhere = publicShelves({ events, interest, vendors: [], needs: [] }, { now: NOW });
  assert.equal(everywhere.trendingTitle, 'Trending now');
  assert.equal(everywhere.trending[0].id, events[3].id, 'recent interest beats an all-time count');

  const kampala = publicShelves({ events, interest, vendors: [], needs: [] }, { city: 'Kampala, UG', now: NOW });
  assert.equal(kampala.trendingTitle, 'Trending in Kampala, UG');
  assert.ok(kampala.trending.every((e) => e.city === 'Kampala, UG'));
});

test('category rows come in order of how many people are going, and empty ones are left out', () => {
  const events = [event({ days: 3, category: 'FAITH', going: 10 }), event({ days: 4, category: 'SPORTS', going: 200 }), event({ days: 5, category: 'SPORTS', going: 5 })];
  const { categories } = publicShelves({ events, interest: {}, vendors: [], needs: [] }, { now: NOW });
  assert.deepEqual(categories.map((c) => c.key), ['SPORTS', 'FAITH']);
  assert.equal(categories[0].title, 'Sports & fitness');
});

test('city charts need at least three events and number them', () => {
  const events = [
    ...[1, 2, 3].map((days) => event({ days, city: 'Boston, MA', going: days * 10 })),
    ...[1, 2].map((days) => event({ days, city: 'Kigali, RW' })),
  ];
  const { cityCharts } = publicShelves({ events, interest: {}, vendors: [], needs: [] }, { now: NOW });
  assert.deepEqual(cityCharts.map((c) => c.city), ['Boston, MA']);
  assert.deepEqual(cityCharts[0].events.map((e) => e.rank), [1, 2, 3]);
  assert.equal(cityCharts[0].events[0].going, 30);
});
