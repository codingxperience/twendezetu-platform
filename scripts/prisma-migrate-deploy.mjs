import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));

const env = {
  ...process.env,
  // Supabase's shared pooler can time out while Prisma waits on advisory
  // locks. Deployments run a single migration command, so disabling the
  // lock here keeps builds deterministic without affecting app queries.
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: '1',
};

let result;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  result = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    stdio: 'inherit',
    env,
  });

  if (result.status === 0) break;

  if (result.error) {
    console.error(result.error.message);
  }

  if (attempt < 3) {
    console.error(`Prisma migrate deploy failed; retrying (${attempt + 1}/3)...`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }
}

process.exit(result.status ?? 1);
