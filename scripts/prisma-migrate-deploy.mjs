// Applies pending migrations, then re-applies the Supabase API lockdown so
// any table added since the last deploy is covered by Row Level Security.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
const lockdownSql = fileURLToPath(new URL('../prisma/sql/lockdown.sql', import.meta.url));

// Prisma's CLI reads .env on its own; this script needs it for DIRECT_URL.
try {
  process.loadEnvFile();
} catch {
  // No .env file: hosted environments provide variables directly.
}

const env = {
  ...process.env,
  // Supabase's shared pooler can time out while Prisma waits on advisory
  // locks. Deployments run a single migration command, so disabling the
  // lock keeps builds deterministic without affecting app queries.
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: '1',
};

function pause(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runWithRetry(label, args) {
  let result;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    result = spawnSync(process.execPath, [prismaCli, ...args], { stdio: 'inherit', env });
    if (result.status === 0) return;
    if (result.error) console.error(result.error.message);
    if (attempt < 3) {
      console.error(`${label} failed; retrying (${attempt + 1}/3)…`);
      pause(5000);
    }
  }
  process.exit(result.status ?? 1);
}

runWithRetry('prisma migrate deploy', ['migrate', 'deploy']);

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const target = url ? ['--url', url] : ['--schema', 'prisma/schema.prisma'];
runWithRetry('database lockdown', ['db', 'execute', '--file', lockdownSql, ...target]);

console.log('Migrations applied and database API access locked down.');
