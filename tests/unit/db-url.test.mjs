import { test } from 'node:test';
import assert from 'node:assert/strict';

const { databaseUrl } = await import('../../src/server/db-url.js');

test('a transaction pooler address gets pgbouncer=true', () => {
  const pooled = 'postgresql://postgres.ref:secret@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';
  assert.equal(new URL(databaseUrl(pooled)).searchParams.get('pgbouncer'), 'true');
  const withOthers = databaseUrl(`${pooled}?connection_limit=5`);
  assert.equal(new URL(withOthers).searchParams.get('pgbouncer'), 'true');
  assert.equal(new URL(withOthers).searchParams.get('connection_limit'), '5', 'other settings are kept');
  assert.equal(new URL(databaseUrl('postgresql://u:p@127.0.0.1:6543/twende')).searchParams.get('pgbouncer'), 'true', 'any PgBouncer on 6543');
});

test('addresses that need nothing are left exactly as they were', () => {
  const flagged = 'postgresql://postgres.ref:s@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
  assert.equal(databaseUrl(flagged), flagged);
  const session = 'postgresql://postgres.ref:s@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
  assert.equal(databaseUrl(session), session, 'the session pooler keeps prepared statements');
  const direct = 'postgresql://postgres:s@db.ref.supabase.co:5432/postgres';
  assert.equal(databaseUrl(direct), direct);
  assert.equal(databaseUrl(''), '');
  assert.equal(databaseUrl('not a url'), 'not a url');
});

test('a password with special characters survives', () => {
  const url = 'postgresql://postgres.ref:p%40ss%23word@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';
  const fixed = new URL(databaseUrl(url));
  assert.equal(decodeURIComponent(fixed.password), 'p@ss#word');
});
