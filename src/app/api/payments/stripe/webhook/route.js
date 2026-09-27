import { config } from '@/server/config';
import { log } from '@/server/log';
import { prisma } from '@/server/db';
import { stripe } from '@/server/payments/charges';
import { completePayment, failPayment } from '@/server/payments/fulfil';

// Stripe calls this with signed events. The signature is checked against the
// raw body before anything is trusted. Fulfilment is idempotent, so Stripe's
// retries are harmless; any failure answers 500 so Stripe retries later.
export async function POST(req) {
  const client = await stripe();
  const secret = config().payments.stripeWebhookSecret;
  if (!client || !secret) return new Response('Stripe is not configured', { status: 503 });

  const raw = await req.text();
  let event;
  try {
    event = client.webhooks.constructEvent(raw, req.headers.get('stripe-signature') || '', secret);
  } catch (error) {
    log.warn('stripe webhook rejected', { error: error.message });
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId || session.client_reference_id;
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (session.payment_status === 'paid' && paymentId) {
        await verifyAmount(paymentId, session);
        await completePayment(paymentId, { processorRef: session.id, meta: { paymentIntent: session.payment_intent } });
      }
    } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      if (paymentId) await failPayment(paymentId, event.type === 'checkout.session.expired' ? 'Checkout expired' : 'Payment failed');
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'content-type': 'application/json' } });
  } catch (error) {
    log.error('stripe webhook handling failed', { type: event.type, id: event.id, error });
    return new Response('Webhook handling failed', { status: 500 });
  }
}

// The amount Stripe collected must be exactly what we asked for.
async function verifyAmount(paymentId, session) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { amountMinor: true, currency: true } });
  if (!payment) throw new Error(`Unknown payment ${paymentId}`);
  if (session.amount_total !== payment.amountMinor || String(session.currency).toUpperCase() !== payment.currency) {
    throw new Error(`Amount mismatch for payment ${paymentId}`);
  }
}
