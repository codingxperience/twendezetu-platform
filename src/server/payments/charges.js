// Charging people. Card payments go through Stripe Checkout, a page hosted by
// Stripe, so card numbers never touch this server. Money enters the ledger
// only when Stripe confirms the payment (see payments/fulfil.js).
//
// Without Stripe keys, and never in production unless an operator explicitly
// allows it, charges run in test mode: they succeed immediately and are
// labelled as test payments everywhere they appear.

import { config } from '../config.js';
import { prisma } from '../db.js';
import { unavailable } from '../errors.js';

let stripeClient;
export async function stripe() {
  const { stripeSecretKey } = config().payments;
  if (!stripeSecretKey) return null;
  if (!stripeClient) {
    const Stripe = (await import('stripe')).default;
    stripeClient = new Stripe(stripeSecretKey, { maxNetworkRetries: 2, timeout: 15_000 });
  }
  return stripeClient;
}

export function paymentMode() {
  if (config().payments.stripeSecretKey) return 'stripe';
  if (config().payments.mockAllowed) return 'test';
  return 'unavailable';
}

// Creates a Payment row and, for Stripe, a Checkout Session. Returns
// { paymentId, mode, redirectUrl } — the caller sends the browser to
// redirectUrl, or, in test mode, fulfils immediately.
export async function createCharge(tx, { purpose, subjectId, userId, email, amountMinor, currency, description, returnPath }) {
  const mode = paymentMode();
  if (mode === 'unavailable') throw unavailable('Card payments are not switched on yet. Try Twende points instead.');

  const payment = await tx.payment.create({
    data: {
      purpose,
      processor: mode === 'stripe' ? 'STRIPE' : 'MOCK',
      userId,
      subjectId,
      amountMinor,
      currency,
      meta: { description, returnPath },
    },
    select: { id: true },
  });
  return { paymentId: payment.id, mode, email, description, returnPath, amountMinor, currency };
}

// Opens the Stripe Checkout Session for a charge created above. Runs after
// the database transaction commits, so a slow processor never holds locks.
export async function openCheckout(charge) {
  if (charge.mode !== 'stripe') return null;
  const client = await stripe();
  const base = config().appUrl;
  const session = await client.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: charge.email || undefined,
      client_reference_id: charge.paymentId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: charge.currency.toLowerCase(),
            unit_amount: charge.amountMinor,
            product_data: { name: charge.description.slice(0, 120) },
          },
        },
      ],
      metadata: { paymentId: charge.paymentId },
      payment_intent_data: { metadata: { paymentId: charge.paymentId } },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${base}${charge.returnPath}${charge.returnPath.includes('?') ? '&' : '?'}payment=${charge.paymentId}&status=success`,
      cancel_url: `${base}${charge.returnPath}${charge.returnPath.includes('?') ? '&' : '?'}payment=${charge.paymentId}&status=cancelled`,
    },
    { idempotencyKey: `checkout:${charge.paymentId}` },
  );
  await prisma.payment.update({ where: { id: charge.paymentId }, data: { processorRef: session.id } });
  return session.url;
}

// Returns money for a succeeded card payment. `refundKey` identifies the
// business reason (an order refund, a dispute ruling) so a retry never
// refunds twice. Test-mode payments have nothing to return at a processor.
export async function refundCharge(payment, amountMinor, refundKey) {
  if (payment.processor !== 'STRIPE') return { processorRef: null };
  const client = await stripe();
  const intent = payment.meta?.paymentIntent;
  if (!client || !intent) throw unavailable('This card payment cannot be refunded automatically. Finance has been notified.');
  const refund = await client.refunds.create(
    { payment_intent: intent, amount: amountMinor },
    { idempotencyKey: `refund:${refundKey}` },
  );
  return { processorRef: refund.id };
}
