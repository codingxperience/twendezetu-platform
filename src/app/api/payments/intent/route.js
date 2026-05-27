// Stripe payment intent for the booking deposit. Works in two modes:
//   • With STRIPE_SECRET_KEY set → creates a real PaymentIntent (test or live
//     depending on the key prefix). Returns the client secret.
//   • Without → returns a mocked intent so the booking flow stays functional
//     in local development. Booking is still recorded as 'deposit_paid' once
//     the flow completes.

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, badRequest, authError, zodError, notFound, serverError } from '@/lib/api';

const Body = z.object({ bookingId: z.string().min(1) });

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return authError();
  let body;
  try { body = Body.parse(await req.json()); } catch (e) { return zodError(e); }

  const booking = await prisma.booking.findUnique({ where: { id: body.bookingId } });
  if (!booking) return notFound();
  if (booking.customerId !== user.id) return notFound();

  const amountKes = booking.depositAmount;

  if (!process.env.STRIPE_SECRET_KEY) {
    // Mock mode — pretend Stripe accepted the deposit
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: 'deposit_paid', stripePaymentId: 'mock_' + Date.now() },
    });
    return ok({ mocked: true, amount: amountKes, currency: booking.currency });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: amountKes * 100, // Stripe expects cents-style units
      currency: 'kes',
      metadata: { bookingId: booking.id, userId: user.id },
      automatic_payment_methods: { enabled: true },
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { stripePaymentId: intent.id } });
    return ok({
      clientSecret: intent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount: amountKes,
      currency: 'KES',
    });
  } catch (e) {
    console.error(e);
    return serverError('Could not create payment intent.');
  }
}
