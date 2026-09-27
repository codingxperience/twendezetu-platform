// The build Vercel runs. Hosted builds are the one place that can always
// reach the database, so migrations can run here, but only when an operator
// turns it on with MIGRATE_ON_BUILD=true: a preview build must not change the
// production schema by accident. Afterwards the database is summarised in
// the build log as row counts only, never personal data.
//
// SEED_ON_BUILD=demo also loads the demo catalogue (see prisma/seed.mjs). The
// seed refuses to touch a database holding real accounts; the build then
// carries on without it. Turn it off again after one successful deploy, or
// every build starts the demo over.
import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.MIGRATE_ON_BUILD === 'true') {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error('MIGRATE_ON_BUILD is on, but DATABASE_URL or DIRECT_URL is empty.');
    process.exit(1);
  }
  run(process.execPath, ['scripts/prisma-migrate-deploy.mjs']);
  run('npx', ['prisma', 'generate']);
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const [users, legacyUsers, events, providers, entries] = await Promise.all([
      prisma.user.count(),
      prisma.$queryRaw`SELECT count(*)::int AS n FROM legacy."User"`.then((rows) => rows[0].n).catch(() => 'none'),
      prisma.event.count(),
      prisma.provider.count(),
      prisma.journalEntry.count(),
    ]);
    console.log(`Database: ${users} accounts (${legacyUsers} carried over from the first site), ${events} events, ${providers} providers, ${entries} ledger entries.`);
  } finally {
    await prisma.$disconnect();
  }
  if (process.env.SEED_ON_BUILD === 'demo') {
    if (!process.env.SEED_DEMO_PASSWORD) {
      console.error('SEED_ON_BUILD=demo needs SEED_DEMO_PASSWORD, so the demo accounts are not open to anyone who reads the README.');
      process.exit(1);
    }
    const seeded = spawnSync(process.execPath, ['prisma/seed.mjs'], { stdio: 'inherit', env: process.env });
    console.log(seeded.status === 0 ? 'Demo data loaded.' : 'Demo data was not loaded (see above); building anyway.');
  }
} else {
  console.log('MIGRATE_ON_BUILD is not "true": building without touching the database.');
}

run('npm', ['run', 'build']);
