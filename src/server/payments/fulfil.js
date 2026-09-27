// Turns a confirmed payment into what was bought: tickets, escrow, points or
// a membership. Each fulfilment runs in one transaction with the payment's
// status change, so a payment is fulfilled exactly once even if the
// processor sends the same webhook several times.

import { prisma, transaction } from '../db.js';
import { log } from '../log.js';
import { expireStaleOrders, fulfilOrderPayment } from '../services/checkout.js';
import { AppError } from '../errors.js';
import { fundBookingFromPayment } from '../services/marketplace.js';
import { creditTopUp } from '../services/wallet.js';
import { activateMembershipFromPayment } from '../services/providers.js';
import { completeShare } from '../services/splits.js';
import { refundCharge } from './charges.js';

export async function completePayment(paymentId, { processorRef, meta = {} }) {
  let outcome = 'fulfilled';
  try {
    outcome = await transaction(async (tx) => {
      const claimed = await tx.payment.updateMany({
        where: { id: paymentId, status: { in: ['PENDING', 'CANCELLED'] } },
        data: { status: 'SUCCEEDED', succeededAt: new Date(), ...(processorRef ? { processorRef } : {}) },
      });
      if (!claimed.count) return 'already';
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (Object.keys(meta).length) {
        await tx.payment.update({ where: { id: paymentId }, data: { meta: { ...(payment.meta || {}), ...meta } } });
        payment.meta = { ...(payment.meta || {}), ...meta };
      }

      switch (payment.purpose) {
        case 'ORDER': {
          const result = await fulfilOrderPayment(tx, payment);
          if (result === 'fulfilled') {
            const order = await tx.order.findUnique({ where: { id: payment.subjectId } });
            await completeShare(tx, order);
          }
          return result;
        }
        case 'BOOKING':
          return fundBookingFromPayment(tx, payment);
        case 'TOPUP':
          await creditTopUp(tx, payment);
          return 'fulfilled';
        case 'MEMBERSHIP':
          return activateMembershipFromPayment(tx, payment);
        default:
          throw new Error(`Unknown payment purpose ${payment.purpose}`);
      }
    });
  } catch (error) {
    // Infrastructure errors propagate so the processor retries the webhook.
    if (!(error instanceof AppError)) throw error;
    // The money arrived but what it paid for is gone (seats sold out after a
    // lapsed hold, for example). Record it and give the money back.
    log.error('payment fulfilment failed; refunding', { paymentId, error });
    await refundUnfulfillable(paymentId, error.message);
    return 'refunded';
  }

  if (outcome === 'duplicate') await refundUnfulfillable(paymentId, 'Already paid by another payment');
  return outcome;
}

async function refundUnfulfillable(paymentId, reason) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;
  try {
    await refundCharge({ ...payment, meta: payment.meta || {} }, payment.amountMinor, `unfulfillable:${payment.id}`);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED', failure: String(reason).slice(0, 300) } });
  } catch (error) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', failure: `Refund needed: ${String(reason).slice(0, 200)}` } }).catch(() => {});
    log.error('automatic refund failed; finance must refund manually', { paymentId, error });
  }
}

export async function failPayment(paymentId, reason) {
  await prisma.payment.updateMany({ where: { id: paymentId, status: 'PENDING' }, data: { status: 'FAILED', failure: String(reason || 'Payment failed').slice(0, 300) } });
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (payment?.purpose === 'ORDER') {
    // Release the held seats now instead of waiting for the hold to lapse.
    await prisma.order.updateMany({ where: { id: payment.subjectId, status: 'PENDING' }, data: { expiresAt: new Date(0) } });
    await expireStaleOrders();
  }
}
