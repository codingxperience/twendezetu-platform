import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ||= 'postgresql://test@localhost:5432/unused';
process.env.AUTH_SECRET ||= 'test-secret-that-is-long-enough-for-config';
const { csvCell } = await import('../../src/server/services/wallet.js');

test('cells that a spreadsheet would run as a formula are neutralised', () => {
  assert.equal(csvCell('=HYPERLINK("http://evil")'), `"'=HYPERLINK(""http://evil"")"`);
  assert.equal(csvCell('+1+2'), "'+1+2");
  assert.equal(csvCell('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(csvCell('-x'), "'-x");
});

test('numbers, negative amounts included, stay numbers', () => {
  assert.equal(csvCell('-150'), '-150');
  assert.equal(csvCell(-12.5), '-12.5');
  assert.equal(csvCell(2625), '2625');
});

test('commas, quotes and line breaks are quoted', () => {
  assert.equal(csvCell('Kampala, Uganda'), '"Kampala, Uganda"');
  assert.equal(csvCell('He said "karibu"'), '"He said ""karibu"""');
  assert.equal(csvCell('two\nlines'), '"two\nlines"');
  assert.equal(csvCell(null), '');
});
