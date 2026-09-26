import { route, setSessionCookie } from '@/server/http';
import { schemas } from '@/server/schemas';
import { signUp } from '@/server/services/identity';
import { enforceRateLimit } from '@/server/security/rate-limit';

const DESTINATIONS = { user: '/my-twende', advertiser: '/create-event', provider: '/provider-verification' };

export const POST = route({ auth: 'none', body: schemas.signUp, limit: [{ policy: 'auth.sign-up', by: 'ip' }] }, async ({ body, ip, req }) => {
  await enforceRateLimit('auth.sign-up', `email:${body.email}`);
  const { user, session } = await signUp({
    name: body.name,
    email: body.email,
    password: body.password,
    city: body.city,
    country: body.country,
    referralHandle: body.ref,
    ipAddress: ip,
    userAgent: req.headers.get('user-agent'),
  });
  await setSessionCookie(session.token, session.expiresAt);
  return { user, next: DESTINATIONS[body.intent] };
});
