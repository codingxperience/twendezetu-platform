import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, formatMoney, parseMoneyInput, percentOf, pointsFor, toMinor } from '../../src/shared/money.js';

const rates = { KES: 129.25, UGX: 3720, TZS: 2580, RWF: 1395 };

test('minor units follow each currency', () => {
  assert.equal(toMinor('26.25', 'USD'), 2625);
  assert.equal(toMinor(760000, 'UGX'), 760000);
  assert.throws(() => toMinor(1, 'EUR'), /Unsupported currency/);
});

test('percentages round half away from zero', () => {
  assert.equal(percentOf(2500, 500), 125);
  assert.equal(percentOf(3, 5000), 2);
  assert.equal(percentOf(-3, 5000), -2);
});

test('money is formatted the way people read it', () => {
  assert.equal(formatMoney(2625, 'USD'), '$26.25');
  assert.equal(formatMoney(-500, 'USD'), '−$5.00');
  assert.equal(formatMoney(760000, 'UGX'), 'UGX 760,000');
  assert.equal(formatMoney(100000, 'KES'), 'KES 1,000');
  assert.equal(formatMoney(4200, 'PTS'), '4,200 pts');
});

test('price boxes accept the ways people type amounts', () => {
  assert.equal(parseMoneyInput('760K', 'UGX'), 760000);
  assert.equal(parseMoneyInput('UGX 760,000', 'UGX'), 760000);
  assert.equal(parseMoneyInput('1.2M', 'UGX'), 1200000);
  assert.equal(parseMoneyInput('$540', 'USD'), 54000);
  assert.equal(parseMoneyInput('540.50', 'USD'), 54050);
  assert.equal(parseMoneyInput('0', 'USD'), null);
  assert.equal(parseMoneyInput('-5', 'USD'), null);
  assert.equal(parseMoneyInput('abc', 'USD'), null);
});

test('one point is one US cent', () => {
  assert.equal(convert(2625, 'USD', 'PTS', rates), 2625);
  assert.equal(convert(100, 'PTS', 'USD', rates), 100);
  assert.equal(convert(3720, 'UGX', 'PTS', rates), 100);
});

test('points owed are rounded up, so a payment never falls short', () => {
  for (const [minor, currency] of [[100000, 'KES'], [760000, 'UGX'], [123457, 'TZS'], [99, 'RWF'], [2625, 'USD']]) {
    const points = pointsFor(minor, currency, rates);
    assert.ok(points >= convert(minor, currency, 'PTS', rates), `${minor} ${currency}`);
    assert.ok(Number.isInteger(points));
  }
  assert.equal(pointsFor(100000, 'KES', rates), 774);
});

test('a missing exchange rate fails loudly instead of guessing', () => {
  assert.throws(() => convert(100, 'KES', 'USD', {}), /No exchange rate/);
});
