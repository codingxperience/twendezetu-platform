import { prisma } from '@/server/db';
import { config } from '@/server/config';
import { paymentMode } from '@/server/payments/charges';

export const dynamic = 'force-dynamic';

// Liveness plus the configuration an operator needs to see at a glance. No
// secrets, counts or personal data are returned.
export async function GET() {
  const started = Date.now();
  let database = { ok: false };
  let exposure = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { ok: true, latencyMs: Date.now() - started };
    const [row] = await prisma.$queryRaw`
      SELECT count(*)::int AS "unprotected"
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE c.relkind = 'r' AND n.nspname = 'public' AND NOT c.relrowsecurity`;
    exposure = { tablesWithoutRowLevelSecurity: row.unprotected };
  } catch {
    database = { ok: false, message: 'Database unreachable. Check DATABASE_URL and the Supabase pooler.' };
  }

  let configured;
  try {
    const c = config();
    configured = {
      payments: paymentMode(),
      email: Boolean(c.email.resendApiKey),
      sms: Boolean(c.sms.apiKey && c.sms.username),
      storage: c.storage.supabaseUrl && c.storage.serviceRoleKey ? 'supabase' : c.storage.databaseFallback ? 'database' : 'none',
      rateLimitStore: c.redis ? 'redis' : 'postgres',
      cron: Boolean(c.cronSecret),
    };
  } catch (error) {
    configured = { error: error.message.split('\n')[0] };
  }

  const healthy = database.ok && !configured.error && (exposure?.tablesWithoutRowLevelSecurity ?? 0) === 0;
  return new Response(JSON.stringify({ ok: healthy, database, security: exposure, configured }), {
    status: healthy ? 200 : 503,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
