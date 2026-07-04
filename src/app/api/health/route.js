import { prisma } from '@/lib/prisma';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = {
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };

  try {
    const [vendors, users] = await Promise.all([
      prisma.vendor.count(),
      prisma.user.count(),
    ]);

    return json({
      ok: true,
      env,
      database: { ok: true, vendors, users },
    });
  } catch {
    return json({
      ok: false,
      env,
      database: {
        ok: false,
        message: 'Database connection failed. Check the Vercel DATABASE_URL and Supabase pooler connection string.',
      },
    }, 503);
  }
}
