// Twende points: top-ups, person-to-person sends, cash-outs and the wallet
// statement. 100 points = US$1.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, invalid, notFound } from '../errors.js';
import { accounts, balanceOf, post, statement } from '../ledger.js';
import { getRates } from '../fx.js';
import { FEES, LIMITS } from '../fees.js';
import { convert, formatMoney } from '../../shared/money.js';
import { createCharge, openCheckout } from '../payments/charges.js';
import { notify } from '../notify/index.js';
import { reference } from '../security/crypto.js';
import { requireStepUp } from './identity.js';
import { shortDate, shortName } from '../../shared/format.js';

export const POINTS_PER_USD = 100;

export async function walletBalance(userId) {
  return balanceOf(prisma, accounts.wallet(userId));
}

export async function equivalents(points) {
  const rates = await getRates();
  const cents = points; // 1 point = 1 US cent
  return {
    USD: cents,
    KES: convert(cents, 'USD', 'KES', rates),
    UGX: convert(cents, 'USD', 'UGX', rates),
    TZS: convert(cents, 'USD', 'TZS', rates),
  };
}

// ── Activity ──────────────────────────────────────────────────────────────

function describe(line) {
  const { entry } = line;
  const meta = entry.meta || {};
  const incoming = line.amount > 0;
  const when = shortDate(new Date(entry.createdAt));
  switch (entry.kind) {
    case 'TOPUP':
      return { icon: '✓', title: meta.test ? 'Top-up (test payment)' : 'Top-up from card', meta: `${when} · ${formatMoney(meta.usdCents || 0, 'USD')} → ${line.amount.toLocaleString('en-US')} PTS` };
    case 'TRANSFER':
      return incoming
        ? { icon: '+', title: `From ${meta.fromName}${meta.fromCity ? ` (${meta.fromCity})` : ''}`, meta: `${when}${meta.note ? ` · ${meta.note}` : ''}` }
        : { icon: '>', title: `Sent to ${meta.toName}`, meta: `${when}${meta.note ? ` · ${meta.note}` : ' · points transfer'}` };
    case 'POOL_CONTRIBUTION':
      return { icon: 'P', title: `Pool: ${meta.poolTitle}`, meta: `${when}${meta.note ? ` · ${meta.note}` : ''}` };
    case 'POOL_RELEASE':
      return { icon: 'P', title: `Pool released: ${meta.poolTitle}`, meta: `${when} · group pool payout` };
    case 'TICKET_SALE':
      return { icon: 'T', title: entry.memo, meta: `${when} · ORDER ${meta.orderReference}` };
    case 'BOOKING_ESCROW':
      return { icon: 'E', title: entry.memo, meta: `${when} · held in escrow` };
    case 'CASHOUT':
      return { icon: '<', title: `Cash-out to ${meta.destination}`, meta: `${when} · flat fee ${meta.fee} pts · ${meta.reference}` };
    case 'REFUND':
      return { icon: '↺', title: entry.memo, meta: `${when} · refund` };
    case 'CONVERSION':
      return { icon: '+', title: 'From your business earnings', meta: `${when} · ${formatMoney(meta.amountMinor || 0, meta.currency || 'USD')} converted` };
    case 'REFERRAL_REWARD':
      return { icon: '★', title: entry.memo, meta: `${when} · referral reward` };
    case 'PAYOUT_REVERSAL':
      return { icon: '↺', title: 'Cash-out returned', meta: `${when} · ${meta.reason || 'payout could not be completed'}` };
    default:
      return { icon: '·', title: entry.memo, meta: when };
  }
}

export async function walletActivity(userId, { take = 20, cursor } = {}) {
  const page = await statement(prisma, accounts.wallet(userId), { take, cursor });
  return {
    items: page.lines.map((line) => ({
      id: line.id,
      kind: line.entry.kind,
      amount: line.amount,
      createdAt: line.createdAt,
      ...describe(line),
    })),
    nextCursor: page.nextCursor,
  };
}

// ── Top-ups ───────────────────────────────────────────────────────────────

export async function startTopUp(user, usd) {
  const dollars = Number(usd);
  if (!Number.isInteger(dollars) || dollars < 1 || dollars > LIMITS.topUpUsdMax) {
    throw invalid(`Top up between $1 and $${LIMITS.topUpUsdMax}.`);
  }
  const cents = dollars * 100;
  const charge = await transaction((tx) =>
    createCharge(tx, {
      purpose: 'TOPUP',
      subjectId: user.id,
      userId: user.id,
      email: user.email,
      amountMinor: cents,
      currency: 'USD',
      description: `Twende points top-up — ${(dollars * POINTS_PER_USD).toLocaleString('en-US')} points`,
      returnPath: '/points-wallet',
    }),
  );
  if (charge.mode === 'test') {
    const { completePayment } = await import('../payments/fulfil.js');
    await completePayment(charge.paymentId, { processorRef: null, meta: { test: true } });
    return { mode: 'test', points: cents, balance: await walletBalance(user.id) };
  }
  return { mode: 'stripe', redirectUrl: await openCheckout(charge) };
}

export async function creditTopUp(tx, payment) {
  if (payment.currency !== 'USD') throw new Error('Top-ups are charged in USD.');
  const points = payment.amountMinor; // cents → points, one to one
  await post(tx, {
    kind: 'TOPUP',
    memo: 'Points top-up',
    reference: payment.id,
    idempotencyKey: `topup:${payment.id}`,
    actorId: payment.userId,
    meta: { usdCents: payment.amountMinor, test: payment.processor === 'MOCK' },
    lines: [
      { account: accounts.paymentClearing('USD'), amount: -payment.amountMinor },
      { account: accounts.fx('USD'), amount: payment.amountMinor },
      { account: accounts.fx('PTS'), amount: -points },
      { account: accounts.wallet(payment.userId), amount: points },
    ],
  });
  await notify(tx, {
    userId: payment.userId,
    topic: 'MONEY',
    title: `+${points.toLocaleString('en-US')} points added`,
    body: `Your top-up of ${formatMoney(payment.amountMinor, 'USD')} is in your wallet${payment.processor === 'MOCK' ? ' (test payment — no card was charged)' : ''}.`,
    href: '/points-wallet',
  });
}

// ── Sending points ────────────────────────────────────────────────────────

export async function resolveRecipient(input) {
  const value = String(input || '').trim().toLowerCase().replace(/^@/, '');
  if (!value) throw invalid('Enter who you are sending to: their @handle or email.');
  const recipient = await prisma.user.findFirst({
    where: value.includes('@') ? { email: value } : { handle: value },
    select: { id: true, name: true, handle: true, status: true },
  });
  if (!recipient || recipient.status !== 'ACTIVE') throw notFound('We could not find an active member with that handle or email.');
  return recipient;
}

export async function sendPoints(user, { recipient: recipientInput, points, note, code }) {
  const amount = Number(points);
  if (!Number.isInteger(amount) || amount <= 0) throw invalid('Enter a whole number of points above 0.');
  if (amount > LIMITS.pointsTransferMax) throw invalid(`You can send up to ${LIMITS.pointsTransferMax.toLocaleString('en-US')} points at once.`);
  const recipient = await resolveRecipient(recipientInput);
  if (recipient.id === user.id) throw badRequest('You cannot send points to yourself.');
  await requireStepUp(user, code);

  const cleanNote = note ? String(note).trim().slice(0, 140) : null;
  await transaction(async (tx) => {
    await post(tx, {
      kind: 'TRANSFER',
      memo: `Transfer ${shortName(user.name)} → ${shortName(recipient.name)}`,
      reference: recipient.id,
      actorId: user.id,
      meta: { fromId: user.id, fromName: shortName(user.name), fromCity: user.city, toId: recipient.id, toName: shortName(recipient.name), note: cleanNote },
      lines: [
        { account: accounts.wallet(user.id), amount: -amount },
        { account: accounts.wallet(recipient.id), amount },
      ],
    });
    await audit(tx, { actorId: user.id, action: 'wallet.sent', targetType: 'User', targetId: recipient.id, meta: { points: amount } });
    await notify(tx, {
      userId: recipient.id,
      topic: 'MONEY',
      title: `${shortName(user.name)} sent you ${amount.toLocaleString('en-US')} points`,
      body: cleanNote ? `“${cleanNote}”` : 'The points are in your Twende wallet now.',
      href: '/points-wallet',
    });
  });
  return { sent: amount, to: shortName(recipient.name), balance: await walletBalance(user.id) };
}

// ── Cashing out ───────────────────────────────────────────────────────────

const CASHOUT_KINDS = new Set(['MPESA', 'MTN_MOMO', 'AIRTEL_MONEY', 'BANK']);

export async function cashOut(user, { points, methodId, code }) {
  const amount = Number(points);
  if (!Number.isInteger(amount) || amount <= FEES.cashoutFeePoints) {
    throw invalid(`Cash out more than ${FEES.cashoutFeePoints} points (the flat fee).`);
  }
  const method = await prisma.paymentMethod.findFirst({ where: { id: methodId, userId: user.id, deletedAt: null } });
  if (!method) throw notFound('Choose one of your saved payout methods.');
  if (!CASHOUT_KINDS.has(method.kind)) throw badRequest('Cash-outs go to mobile money or a bank account.');
  await requireStepUp(user, code);

  const payoutReference = reference('WD', 6);
  await transaction(async (tx) => {
    await post(tx, {
      kind: 'CASHOUT',
      memo: `Cash-out to ${method.label}`,
      reference: payoutReference,
      actorId: user.id,
      meta: { destination: method.label, fee: FEES.cashoutFeePoints, reference: payoutReference },
      lines: [
        { account: accounts.wallet(user.id), amount: -amount },
        { account: accounts.payoutClearing('PTS'), amount: amount - FEES.cashoutFeePoints },
        { account: accounts.revenue('PTS'), amount: FEES.cashoutFeePoints },
      ],
    });
    const walletAccount = await tx.ledgerAccount.findUniqueOrThrow({
      where: { kind_ownerKey_currency: { kind: 'USER_WALLET', ownerKey: user.id, currency: 'PTS' } },
      select: { id: true },
    });
    await tx.payout.create({
      data: {
        reference: payoutReference,
        userId: user.id,
        accountId: walletAccount.id,
        methodId: method.id,
        destinationLabel: method.label,
        amountMinor: amount,
        feeMinor: FEES.cashoutFeePoints,
        currency: 'PTS',
      },
    });
    await audit(tx, { actorId: user.id, action: 'wallet.cash_out_requested', targetType: 'Payout', targetId: payoutReference, meta: { points: amount } });
    await notify(tx, {
      userId: user.id,
      topic: 'MONEY',
      urgent: true,
      title: 'Cash-out requested',
      body: `${(amount - FEES.cashoutFeePoints).toLocaleString('en-US')} points (${formatMoney(amount - FEES.cashoutFeePoints, 'USD')}) to ${method.label}. Reference ${payoutReference}. Payouts are sent in the next finance batch.`,
      href: '/points-wallet',
    });
  });
  return { reference: payoutReference, balance: await walletBalance(user.id) };
}

export async function walletStatementCsv(userId) {
  const rows = [['date', 'type', 'description', 'detail', 'points']];
  let cursor;
  for (let page = 0; page < 40; page += 1) {
    const { items, nextCursor } = await walletActivity(userId, { take: 250, cursor });
    for (const item of items) rows.push([new Date(item.createdAt).toISOString(), item.kind, item.title, item.meta, String(item.amount)]);
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function csvCell(value) {
  const text = String(value ?? '');
  // Leading =, +, - or @ would be read as a formula by spreadsheet apps.
  // Plain numbers (negative amounts included) are left as numbers.
  const numeric = /^-?\d+(\.\d+)?$/.test(text);
  const safe = !numeric && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

