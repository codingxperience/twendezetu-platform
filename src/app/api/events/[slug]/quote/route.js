import { route, withStatus } from '@/server/http';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { loadCheckoutEvent, quote } from '@/server/services/checkout';
import { formatMoney } from '@/shared/money';

// Prices a basket without holding seats: the checkout page calls this as the
// buyer changes quantities or applies a promo code.
export const POST = route({ auth: 'optional', body: schemas.cart, limit: [{ policy: 'public.read', by: 'ip' }] }, async ({ body, params }) => {
  const event = await loadCheckoutEvent(params.slug);
  const priced = await quote(prisma, event, body);
  const money = (minor) => formatMoney(minor, event.currency);
  return withStatus(200, {
    currency: event.currency,
    lines: priced.lines.map((line) => ({ tierId: line.tier.id, label: `${line.tier.name} × ${line.quantity}`, amount: money(line.amount) })),
    subtotal: priced.subtotal,
    discount: priced.discount,
    fee: priced.fee,
    total: priced.total,
    labels: { subtotal: money(priced.subtotal), discount: money(priced.discount), fee: money(priced.fee), total: money(priced.total) },
    promoApplied: Boolean(priced.promo),
    promo: priced.promo ? { code: priced.promo.code, kind: priced.promo.kind, value: priced.promo.value, minSubtotalMinor: priced.promo.minSubtotalMinor } : null,
    promoMessage: priced.promoMessage,
  });
});
