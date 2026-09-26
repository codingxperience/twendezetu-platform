// Account settings: notification preferences, saved payment methods and the
// in-app notification feed.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, invalid, notFound, unauthorized } from '../errors.js';
import { encrypt, lastDigits } from '../security/crypto.js';
import { verifyPassword } from '../security/passwords.js';
import { DEFAULT_PREFERENCES, TOPICS, preferencesFor } from '../notify/preferences.js';
import { relativeTime } from '../format.js';
import { normalizePhone } from './identity.js';

export async function notificationSettings(userId, { provider = false } = {}) {
  const [prefs, user] = await Promise.all([
    preferencesFor(prisma, userId),
    prisma.user.findUnique({ where: { id: userId }, select: { quietHours: true, weeklyDigest: true } }),
  ]);
  return {
    quietHours: user.quietHours,
    weeklyDigest: user.weeklyDigest,
    rows: TOPICS.map(({ topic, title, member, provider: providerCopy }) => ({
      topic,
      title,
      desc: provider ? providerCopy : member,
      ...prefs[topic],
    })),
  };
}

export async function updateNotificationPreference(userId, { topic, channel, enabled }) {
  if (!DEFAULT_PREFERENCES[topic]) throw badRequest('Unknown notification type.');
  if (!['inApp', 'email', 'sms', 'whatsapp'].includes(channel)) throw badRequest('Unknown channel.');
  const current = (await preferencesFor(prisma, userId))[topic];
  const next = { ...current, [channel]: Boolean(enabled) };
  await prisma.notificationPreference.upsert({
    where: { userId_topic: { userId, topic } },
    create: { userId, topic, ...next },
    update: next,
  });
  return next;
}

export async function updateNotificationSwitches(userId, { quietHours, weeklyDigest, muteNonEssential }) {
  const data = {};
  if (quietHours !== undefined) data.quietHours = Boolean(quietHours);
  if (weeklyDigest !== undefined) data.weeklyDigest = Boolean(weeklyDigest);
  await transaction(async (tx) => {
    if (Object.keys(data).length) await tx.user.update({ where: { id: userId }, data });
    if (muteNonEssential) {
      // Everything except money movement goes quiet; security and money
      // notices stay on to protect the account.
      for (const topic of ['REMINDERS', 'OFFERS', 'LEADS', 'SOCIAL', 'NEWS']) {
        await tx.notificationPreference.upsert({
          where: { userId_topic: { userId, topic } },
          create: { userId, topic, inApp: true, email: false, sms: false, whatsapp: false },
          update: { email: false, sms: false, whatsapp: false },
        });
      }
    }
  });
  return notificationSettings(userId);
}

// ── Payment methods ───────────────────────────────────────────────────────

const METHOD_LABEL = { MPESA: 'M-Pesa', MTN_MOMO: 'MTN MoMo', AIRTEL_MONEY: 'Airtel Money', BANK: 'Bank', CARD: 'Card' };

export async function paymentMethods(userId) {
  const methods = await prisma.paymentMethod.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, kind: true, label: true, isDefault: true, usableForPayouts: true, expMonth: true, expYear: true, createdAt: true },
  });
  return methods;
}

// Mobile money wallets and bank accounts, used for cash-outs and
// withdrawals. Cards are handled by the card processor at checkout and are
// never typed into Twendezetu.
export async function addPaymentMethod(user, { kind, account, bankName }) {
  if (!['MPESA', 'MTN_MOMO', 'AIRTEL_MONEY', 'BANK'].includes(kind)) throw badRequest('Add a mobile money wallet or bank account. Cards are added securely at checkout.');
  const value = kind === 'BANK' ? String(account || '').replace(/[^\dA-Za-z]/g, '') : normalizePhone(account, user.country);
  if (kind === 'BANK' && value.length < 6) throw invalid('That account number looks too short.');
  const last4 = lastDigits(value);
  const count = await prisma.paymentMethod.count({ where: { userId: user.id, deletedAt: null } });
  if (count >= 8) throw conflict('You can save up to 8 payment methods. Remove one first.', 'too_many_methods');
  const label = kind === 'BANK' ? `${(bankName || 'Bank').trim().slice(0, 30)} ••${last4}` : `${METHOD_LABEL[kind]} ••${last4}`;
  const method = await transaction(async (tx) => {
    const created = await tx.paymentMethod.create({
      data: { userId: user.id, kind, label, last4, accountEnc: encrypt(value), usableForPayouts: true, isDefault: count === 0 },
      select: { id: true, label: true, kind: true, isDefault: true },
    });
    await audit(tx, { actorId: user.id, action: 'payment_method.added', targetType: 'PaymentMethod', targetId: created.id });
    return created;
  });
  return method;
}

export async function setDefaultPaymentMethod(userId, methodId) {
  const method = await prisma.paymentMethod.findFirst({ where: { id: methodId, userId, deletedAt: null } });
  if (!method) throw notFound();
  await prisma.$transaction([
    prisma.paymentMethod.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } }),
    prisma.paymentMethod.update({ where: { id: methodId }, data: { isDefault: true } }),
  ]);
  return { id: methodId, isDefault: true };
}

export async function removePaymentMethod(user, methodId, password) {
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  const { ok } = await verifyPassword(password || '', record.passwordHash);
  if (!ok) throw unauthorized('Enter your password to remove a payment method.');
  const method = await prisma.paymentMethod.findFirst({ where: { id: methodId, userId: user.id, deletedAt: null } });
  if (!method) throw notFound();
  const pending = await prisma.payout.count({ where: { methodId, status: { in: ['REQUESTED', 'APPROVED'] } } });
  if (pending) throw conflict('A withdrawal to this method is still in progress.', 'payout_pending');
  await transaction(async (tx) => {
    await tx.paymentMethod.update({ where: { id: methodId }, data: { deletedAt: new Date(), isDefault: false, accountEnc: null } });
    await audit(tx, { actorId: user.id, action: 'payment_method.removed', targetType: 'PaymentMethod', targetId: methodId });
  });
  return { removed: true };
}

// ── Notification feed ─────────────────────────────────────────────────────

export async function notificationFeed(userId, { take = 20 } = {}) {
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return {
    unread,
    items: items.map((item) => ({ id: item.id, title: item.title, body: item.body, href: item.href, time: relativeTime(item.createdAt), read: Boolean(item.readAt), topic: item.topic })),
  };
}

export async function markNotificationsRead(userId, ids) {
  await prisma.notification.updateMany({ where: { userId, readAt: null, ...(ids?.length ? { id: { in: ids } } : {}) }, data: { readAt: new Date() } });
  return { ok: true };
}
