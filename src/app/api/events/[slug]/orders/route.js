import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { placeOrder } from '@/server/services/checkout';

export const POST = route({ auth: 'optional', body: schemas.order, idempotent: true, limit: [{ policy: 'money.move', by: 'ip' }] }, async ({ body, viewer, params }) => ({
  order: await placeOrder({
    viewer,
    slug: params.slug,
    items: body.items,
    promoCode: body.promoCode,
    channel: body.channel,
    buyerName: body.buyerName,
    buyerEmail: body.buyerEmail,
    guestNames: body.guestNames,
    referrerHandle: body.ref,
    source: body.source,
    stepUpCode: body.code,
  }),
}));
