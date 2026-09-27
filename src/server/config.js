// Environment configuration, validated once on first use. Nothing here runs at
// import time, so `next build` works without production secrets.

import { createHash } from 'node:crypto';
import { z } from 'zod';

const optional = z
  .string()
  .optional()
  .transform((value) => (value && value.trim() ? value.trim() : undefined));

const flag = z
  .string()
  .optional()
  .transform((value) => value === 'true' || value === '1');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  DATA_ENCRYPTION_KEY: optional,
  NEXT_PUBLIC_APP_URL: optional,
  VERCEL_PROJECT_PRODUCTION_URL: optional,
  VERCEL_URL: optional,

  STRIPE_SECRET_KEY: optional,
  STRIPE_PUBLISHABLE_KEY: optional,
  STRIPE_WEBHOOK_SECRET: optional,
  ALLOW_MOCK_PAYMENTS: flag,

  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,
  SMTP_HOST: optional,
  SMTP_PORT: optional,
  SMTP_USER: optional,
  SMTP_PASSWORD: optional,
  AFRICASTALKING_API_KEY: optional,
  AFRICASTALKING_USERNAME: optional,
  AFRICASTALKING_SENDER_ID: optional,

  SUPABASE_URL: optional,
  SUPABASE_SERVICE_ROLE_KEY: optional,
  STORAGE_PUBLIC_BUCKET: z.string().default('public-media'),
  STORAGE_PRIVATE_BUCKET: z.string().default('private-documents'),
  ALLOW_DATABASE_FILE_STORAGE: flag,

  UPSTASH_REDIS_REST_URL: optional,
  UPSTASH_REDIS_REST_TOKEN: optional,

  CRON_SECRET: optional,
  FX_RATES_URL: z.string().default('https://open.er-api.com/v6/latest/USD'),
});

let cached;

export function config() {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n  ${problems.join('\n  ')}`);
  }
  const env = parsed.data;
  const production = env.NODE_ENV === 'production';

  if (production && !env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY is required in production (32 random bytes, base64).');
  }

  cached = Object.freeze({
    env: env.NODE_ENV,
    production,
    appUrl: resolveAppUrl(env),
    authSecret: env.AUTH_SECRET,
    encryptionKey: resolveEncryptionKey(env),
    payments: Object.freeze({
      stripeSecretKey: env.STRIPE_SECRET_KEY,
      stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      // Mock payments create money without a processor. They are refused in
      // production unless an operator deliberately enables them for a demo.
      mockAllowed: !env.STRIPE_SECRET_KEY && (!production || env.ALLOW_MOCK_PAYMENTS),
    }),
    email: Object.freeze({
      resendApiKey: env.RESEND_API_KEY,
      smtp: env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
        ? Object.freeze({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT) || 465, user: env.SMTP_USER, password: env.SMTP_PASSWORD })
        : null,
      // A mailbox only sends as itself, so without EMAIL_FROM it is the sender.
      from: env.EMAIL_FROM || (env.SMTP_USER ? `Twendezetu <${env.SMTP_USER}>` : 'Twendezetu <hello@twendezetu.test>'),
    }),
    sms: Object.freeze({
      apiKey: env.AFRICASTALKING_API_KEY,
      username: env.AFRICASTALKING_USERNAME,
      senderId: env.AFRICASTALKING_SENDER_ID,
    }),
    storage: Object.freeze({
      supabaseUrl: env.SUPABASE_URL?.replace(/\/$/, ''),
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      publicBucket: env.STORAGE_PUBLIC_BUCKET,
      privateBucket: env.STORAGE_PRIVATE_BUCKET,
      databaseFallback: !production || env.ALLOW_DATABASE_FILE_STORAGE,
    }),
    redis: env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? Object.freeze({ url: env.UPSTASH_REDIS_REST_URL.replace(/\/$/, ''), token: env.UPSTASH_REDIS_REST_TOKEN })
      : null,
    cronSecret: env.CRON_SECRET,
    fxRatesUrl: env.FX_RATES_URL,
  });
  return cached;
}

function resolveAppUrl(env) {
  const isLocal = (url) => !url || /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
  if (env.NEXT_PUBLIC_APP_URL && (!isLocal(env.NEXT_PUBLIC_APP_URL) || env.NODE_ENV !== 'production')) {
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

function resolveEncryptionKey(env) {
  if (env.DATA_ENCRYPTION_KEY) {
    const key = Buffer.from(env.DATA_ENCRYPTION_KEY, 'base64');
    if (key.length !== 32) throw new Error('DATA_ENCRYPTION_KEY must decode to exactly 32 bytes.');
    return key;
  }
  // Development only: a stable key derived from AUTH_SECRET.
  return createHash('sha256').update(`twendezetu:data-key:${env.AUTH_SECRET}`).digest();
}

// Test hook: lets the test runner swap environment between suites.
export function resetConfigForTests() {
  cached = undefined;
}
