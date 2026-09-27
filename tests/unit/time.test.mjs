import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromZonedInput, toZonedInput } from '../../src/shared/time.js';

test('event times are read in the venue time zone', () => {
  assert.equal(fromZonedInput('2026-08-08T14:00', 'Africa/Nairobi').toISOString(), '2026-08-08T11:00:00.000Z');
  assert.equal(fromZonedInput('2026-08-08T14:00', 'America/New_York').toISOString(), '2026-08-08T18:00:00.000Z');
  assert.equal(fromZonedInput('2026-08-08T14:00', 'Africa/Kampala').toISOString(), '2026-08-08T11:00:00.000Z');
});

test('a time in the hour skipped by daylight saving moves forward', () => {
  // Clocks jump from 02:00 to 03:00 on 8 March 2026 in New York.
  const moved = fromZonedInput('2026-03-08T02:30', 'America/New_York');
  assert.equal(toZonedInput(moved, 'America/New_York'), '2026-03-08T03:30');
});

test('a time repeated when clocks go back takes the first one', () => {
  // 01:30 happens twice on 1 November 2026 in New York; the first is EDT.
  assert.equal(fromZonedInput('2026-11-01T01:30', 'America/New_York').toISOString(), '2026-11-01T05:30:00.000Z');
});

test('times survive a round trip through storage', () => {
  for (const zone of ['Africa/Nairobi', 'America/New_York', 'America/Chicago', 'Europe/London']) {
    const local = '2026-12-24T19:45';
    assert.equal(toZonedInput(fromZonedInput(local, zone), zone), local, zone);
  }
});

test('bad input gives null rather than a wrong date', () => {
  assert.equal(fromZonedInput('24/12/2026 7pm', 'Africa/Nairobi'), null);
  assert.equal(fromZonedInput('', 'Africa/Nairobi'), null);
});
