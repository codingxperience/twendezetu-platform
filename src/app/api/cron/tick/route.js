import { config } from '@/server/config';
import { safeEqual } from '@/server/security/crypto';
import { runAllJobs, runScheduledJobs } from '@/server/jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron (and any external scheduler) calls this with
// "Authorization: Bearer <CRON_SECRET>". ?all=1 runs every job group, which
// is what the once-a-day Vercel Hobby schedule uses.
async function handle(req) {
  const secret = config().cronSecret;
  const header = req.headers.get('authorization') || '';
  if (!secret || !safeEqual(header, `Bearer ${secret}`)) return new Response('Unauthorized', { status: 401 });
  const all = new URL(req.url).searchParams.get('all') === '1';
  const results = all ? await runAllJobs() : await runScheduledJobs();
  const failed = Object.values(results).some((result) => !result.ok);
  return new Response(JSON.stringify({ ok: !failed, results }), { status: failed ? 500 : 200, headers: { 'content-type': 'application/json' } });
}

export const GET = handle;
export const POST = handle;
