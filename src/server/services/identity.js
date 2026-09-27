// Accounts: sign-up, sign-in (with optional SMS two-step), passwords,
// phone verification, sessions, data export and deletion.

import { prisma, transaction } from '../db.js';
import { config } from '../config.js';
import { log } from '../log.js';
import { audit } from '../audit.js';
import { badRequest, conflict, forbidden, invalid, unauthorized, unavailable } from '../errors.js';
import { burnPasswordCheck, hashPassword, passwordProblem, verifyPassword } from '../security/passwords.js';
import { createSession, revokeAllSessions } from '../security/sessions.js';
import { consumeCode, issueCode } from '../security/otp.js';
import { randomToken, sha256 } from '../security/crypto.js';
import { notify, sendText } from '../notify/index.js';
import { emailConfigured, passwordResetEmail, sendEmailNow } from '../notify/dispatch.js';
import { awardReferral } from './referrals.js';
import { isStaff } from '../security/staff.js';
import { enforceRateLimit } from '../security/rate-limit.js';
import { balancesByCurrency, balanceOf, accounts } from '../ledger.js';
import { COUNTRIES, maskEmail, slugify } from '../../shared/format.js';

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// E.164 for the five markets we serve. Local East African numbers written
// with a leading 0 are expanded using the person's country.
export function normalizePhone(raw, country) {
  const cleaned = String(raw || '').replace(/[^\d+]/g, '');
  const dialing = { KE: '254', UG: '256', TZ: '255', RW: '250', US: '1' };
  let digits;
  if (cleaned.startsWith('+')) digits = cleaned.slice(1);
  else if (cleaned.startsWith('00')) digits = cleaned.slice(2);
  else if (cleaned.startsWith('0') && dialing[country]) digits = dialing[country] + cleaned.slice(1);
  else if (cleaned.length === 10 && country === 'US') digits = `1${cleaned}`;
  else digits = cleaned;
  if (!/^\d{9,15}$/.test(digits)) throw invalid('Enter a phone number with its country code, e.g. +256 772 123 456.');
  return `+${digits}`;
}

// "+256 ••• ••• 214", "+1 ••• ••• 112": the country code and the last three
// digits, enough to recognise your own number and no more.
export function maskPhone(phone) {
  if (!phone) return null;
  const code = /^\+(1|2[0-9]{2})/.exec(phone)?.[0] || phone.slice(0, 4);
  return `${code} ••• ••• ${phone.slice(-3)}`;
}

async function uniqueHandle(db, name, email) {
  const base = (slugify(name).replace(/-/g, '') || slugify(email.split('@')[0]).replace(/-/g, '')).slice(0, 20);
  const stem = base.length >= 3 ? base : `member${base}`;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = attempt === 0 ? stem : `${stem}-${attempt + 1}`;
    const taken = await db.user.findUnique({ where: { handle: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${stem}-${randomToken(3).toLowerCase().replace(/[^a-z0-9]/g, 'x')}`;
}

export async function signUp({ name, email, password, city, country, referralHandle, ipAddress, userAgent }) {
  const normalizedEmail = normalizeEmail(email);
  const problem = passwordProblem(password, { email: normalizedEmail, name });
  if (problem) throw invalid(problem);
  if (country && !COUNTRIES[country]) throw invalid('Choose a supported country.');

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (existing) throw conflict('An account with that email already exists. Try signing in.', 'email_taken');

  const passwordHash = await hashPassword(password);
  const referrer = referralHandle
    ? await prisma.user.findUnique({ where: { handle: String(referralHandle).toLowerCase() }, select: { id: true, status: true } })
    : null;

  const user = await transaction(async (tx) => {
    const handle = await uniqueHandle(tx, name, normalizedEmail);
    const created = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        passwordChangedAt: new Date(),
        name: name.trim(),
        handle,
        city: city?.trim() || null,
        country: country || null,
        currency: country ? COUNTRIES[country].currency : 'USD',
        referredById: referrer?.status === 'ACTIVE' ? referrer.id : null,
      },
      select: { id: true, email: true, name: true, handle: true },
    });
    await audit(tx, { actorId: created.id, action: 'account.created', targetType: 'User', targetId: created.id, ipAddress });
    await notify(tx, {
      userId: created.id,
      topic: 'NEWS',
      title: 'Karibu Twendezetu',
      body: 'Your account is ready. Post an event or a need for free, RSVP to what is on, and keep your contacts private until you choose to share them.',
      href: '/my-twende',
    });
    return created;
  });

  const session = await createSession(user.id, { ipAddress, userAgent });
  return { user, session };
}

export async function signIn({ email, password, ipAddress, userAgent }) {
  const normalizedEmail = normalizeEmail(email);
  await enforceRateLimit('auth.sign-in.ip', `ip:${ipAddress}`);
  await enforceRateLimit('auth.sign-in.account', `acct:${normalizedEmail}`);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, passwordHash: true, status: true, twoFactorEnabled: true, phone: true, phoneVerifiedAt: true, name: true },
  });

  if (!user || user.status === 'DELETED') {
    await burnPasswordCheck(password);
    throw unauthorized('That email and password do not match.');
  }

  const { ok, needsRehash } = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await audit(prisma, { actorId: user.id, action: 'auth.sign_in_failed', targetType: 'User', targetId: user.id, ipAddress });
    throw unauthorized('That email and password do not match.');
  }
  if (user.status === 'SUSPENDED') throw forbidden('This account is suspended. Contact support if you think this is a mistake.');

  if (needsRehash) {
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  }

  const mfa = user.twoFactorEnabled && user.phone && user.phoneVerifiedAt;
  const session = await createSession(user.id, { ipAddress, userAgent, mfaPending: Boolean(mfa) });

  if (mfa) {
    await sendTwoFactorCode(user.id, user.phone);
  }
  await audit(prisma, { actorId: user.id, action: mfa ? 'auth.sign_in_mfa_challenge' : 'auth.signed_in', targetType: 'User', targetId: user.id, ipAddress });
  return { userId: user.id, session, mfaRequired: Boolean(mfa), phoneHint: mfa ? maskPhone(user.phone) : null };
}

function smsConfigured() {
  const { apiKey, username } = config().sms;
  return Boolean(apiKey && username);
}

async function deliverCode(userId, phone, code, purposeText) {
  if (!smsConfigured()) {
    if (config().production) throw unavailable('Text messages are not configured yet, so codes cannot be sent.');
    // Development: the SMS gateway is not connected, so the code goes to the
    // server log where the developer can read it.
    log.info('verification code (development only)', { phone, purpose: purposeText, value: code });
  }
  await transaction((tx) => sendText(tx, { userId, phone, body: `${code} is your Twendezetu ${purposeText} code. It expires in 10 minutes. Never share it.` }));
}

async function sendTwoFactorCode(userId, phone) {
  await enforceRateLimit('otp.send', `2fa:${userId}`);
  const code = await issueCode(prisma, { purpose: 'TWO_FACTOR', target: userId, userId });
  await deliverCode(userId, phone, code, 'sign-in');
}

export async function resendTwoFactor(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
  if (!user?.phone) throw badRequest('No phone number on this account.');
  await sendTwoFactorCode(userId, user.phone);
}

export async function completeTwoFactor({ userId, sessionId, code, ipAddress }) {
  await enforceRateLimit('otp.verify', `2fa:${userId}`);
  await consumeCode({ purpose: 'TWO_FACTOR', target: userId, code, userId });
  await prisma.session.update({ where: { id: sessionId }, data: { mfaPending: false } });
  await audit(prisma, { actorId: userId, action: 'auth.signed_in', targetType: 'User', targetId: userId, ipAddress, meta: { twoFactor: true } });
}

// Step-up check for sends and withdrawals when two-step is on.
export async function requireStepUp(user, code) {
  if (!user.twoFactorEnabled) return;
  if (!code) throw forbidden('Enter the code we texted you to confirm this.');
  await enforceRateLimit('otp.verify', `stepup:${user.id}`);
  await consumeCode({ purpose: 'TWO_FACTOR', target: user.id, code, userId: user.id });
}

export async function sendStepUpCode(user) {
  if (!user.twoFactorEnabled) throw badRequest('Two-step verification is off for this account.');
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { phone: true } });
  await sendTwoFactorCode(user.id, record.phone);
  return { phoneHint: maskPhone(record.phone) };
}

// ── Phone verification ────────────────────────────────────────────────────

export async function startPhoneVerification(user, rawPhone) {
  const phone = normalizePhone(rawPhone, user.country);
  await enforceRateLimit('otp.send', `phone:${user.id}`);
  await enforceRateLimit('otp.send', `phone-target:${phone}`);
  const inUse = await prisma.user.findFirst({
    where: { phone, phoneVerifiedAt: { not: null }, id: { not: user.id } },
    select: { id: true },
  });
  if (inUse) throw conflict('That number is already verified on another account.', 'phone_taken');
  const code = await issueCode(prisma, { purpose: 'PHONE_VERIFY', target: phone, userId: user.id });
  await deliverCode(user.id, phone, code, 'verification');
  return { phone, phoneHint: maskPhone(phone) };
}

export async function confirmPhoneVerification(user, rawPhone, code) {
  const phone = normalizePhone(rawPhone, user.country);
  await enforceRateLimit('otp.verify', `phone:${user.id}`);
  await consumeCode({ purpose: 'PHONE_VERIFY', target: phone, code, userId: user.id });
  return transaction(async (tx) => {
    const firstVerification = !(await tx.user.findUnique({ where: { id: user.id }, select: { phoneVerifiedAt: true } })).phoneVerifiedAt;
    await tx.user.update({ where: { id: user.id }, data: { phone, phoneVerifiedAt: new Date() } });
    await tx.verificationApplication.updateMany({
      where: { provider: { ownerId: user.id } },
      data: { phone, phoneVerifiedAt: new Date() },
    });
    if (firstVerification) await awardReferral(tx, user.id, 'JOINED');
    await audit(tx, { actorId: user.id, action: 'account.phone_verified', targetType: 'User', targetId: user.id });
    return { phone, phoneHint: maskPhone(phone) };
  });
}

// ── Two-step verification ─────────────────────────────────────────────────

export async function setTwoFactor(user, { enabled, password }) {
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, phone: true, phoneVerifiedAt: true } });
  const { ok } = await verifyPassword(password || '', record.passwordHash);
  if (!ok) throw unauthorized('Your password is not right.');
  if (!enabled && config().production && isStaff(user)) throw forbidden('Staff accounts keep two-step verification on.');
  if (enabled && !(record.phone && record.phoneVerifiedAt)) {
    throw badRequest('Verify a phone number first. Two-step codes are sent by text message.');
  }
  await transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { twoFactorEnabled: Boolean(enabled) } });
    await audit(tx, { actorId: user.id, action: enabled ? 'security.2fa_enabled' : 'security.2fa_disabled', targetType: 'User', targetId: user.id });
    await notify(tx, {
      userId: user.id,
      topic: 'MONEY',
      urgent: true,
      title: enabled ? 'Two-step verification is on' : 'Two-step verification was turned off',
      body: enabled
        ? 'Sign-ins, sends and withdrawals now need a code texted to your verified number.'
        : 'If this was not you, change your password now and turn two-step back on.',
      href: '/settings?section=security',
    });
  });
  return { enabled: Boolean(enabled) };
}

// ── Passwords ─────────────────────────────────────────────────────────────

export async function changePassword(user, { currentPassword, newPassword, sessionId, ipAddress }) {
  await enforceRateLimit('auth.password', `u:${user.id}`);
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, email: true, name: true } });
  const { ok } = await verifyPassword(currentPassword, record.passwordHash);
  if (!ok) throw unauthorized('Your current password is not right.');
  const problem = passwordProblem(newPassword, { email: record.email, name: record.name });
  if (problem) throw invalid(problem);

  const passwordHash = await hashPassword(newPassword);
  await transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash, passwordChangedAt: new Date() } });
    await audit(tx, { actorId: user.id, action: 'security.password_changed', targetType: 'User', targetId: user.id, ipAddress });
    await notify(tx, {
      userId: user.id,
      topic: 'MONEY',
      urgent: true,
      title: 'Your password was changed',
      body: 'All other devices were signed out. If this was not you, reset your password immediately.',
      href: '/settings?section=security',
    });
  });
  const signedOutSessions = await revokeAllSessions(user.id, { exceptSessionId: sessionId });
  return { signedOutSessions };
}

export const RESET_TTL_MINUTES = 30;
const RESET_TTL_MS = RESET_TTL_MINUTES * 60 * 1000;
// A second request inside this window reuses nothing and sends nothing: a
// double click or an impatient "send again" should not bury the first email.
const RESET_COOLDOWN_MS = 60 * 1000;

// The part of a reset request that answers the browser. It is identical for
// every address, so neither its reply nor its timing says whether an
// account exists; the lookup and the email happen in deliverPasswordReset.
export async function guardPasswordResetRequest(email, ipAddress) {
  const normalizedEmail = normalizeEmail(email);
  await enforceRateLimit('auth.password', `reset:${normalizedEmail}`);
  await enforceRateLimit('auth.password', `reset-ip:${ipAddress}`);
  if (config().production && !emailConfigured()) {
    throw unavailable('Password reset emails are not set up yet. Contact support and we will help you back in.');
  }
  return normalizedEmail;
}

// Issues a single-use link and emails it. The link's token exists only in
// the email: the database keeps its SHA-256, and nothing is written to the
// outbox or the in-app inbox where a copy could outlive its purpose.
// Returns what happened, for staff tools and tests; the public route never
// shows it.
export async function deliverPasswordReset(email, { ipAddress, requestedBy = null } = {}) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true, name: true, status: true } });
  if (!user || user.status !== 'ACTIVE') return { sent: false, reason: 'no_active_account' };

  const recent = await prisma.oneTimeCode.findFirst({
    where: { purpose: 'PASSWORD_RESET', userId: user.id, consumedAt: null, createdAt: { gt: new Date(Date.now() - RESET_COOLDOWN_MS) } },
    select: { id: true },
  });
  if (recent) return { sent: false, reason: 'cooldown' };

  const token = randomToken(32);
  await transaction(async (tx) => {
    // A new link retires every earlier one.
    await tx.oneTimeCode.updateMany({ where: { purpose: 'PASSWORD_RESET', userId: user.id, consumedAt: null }, data: { consumedAt: new Date() } });
    await tx.oneTimeCode.create({
      data: { purpose: 'PASSWORD_RESET', target: normalizedEmail, userId: user.id, codeHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });
    await audit(tx, {
      actorId: requestedBy || user.id,
      action: 'security.password_reset_requested',
      targetType: 'User',
      targetId: user.id,
      ipAddress,
    });
  });

  const link = `${config().appUrl}/sign-in?reset=${token}`;
  if (!emailConfigured()) {
    if (config().production) throw unavailable('Password reset emails are not set up yet.');
    // Development: no email provider, so the link goes to the server log.
    log.info('password reset link (development only, not emailed)', { to: normalizedEmail, link });
    return { sent: true, logged: true };
  }

  const message = passwordResetEmail({ name: user.name, link, minutes: RESET_TTL_MINUTES });
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await sendEmailNow({ to: normalizedEmail, ...message, idempotencyKey: `reset:${sha256(token)}` });
      return { sent: true };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  log.error('password reset email failed', { userId: user.id, error: lastError?.message });
  // Retire the link nobody received, so a retry starts clean.
  await prisma.oneTimeCode.updateMany({ where: { purpose: 'PASSWORD_RESET', codeHash: sha256(token), consumedAt: null }, data: { consumedAt: new Date() } });
  return { sent: false, reason: 'delivery_failed' };
}

async function findResetCode(token) {
  const raw = String(token || '');
  if (raw.length < 20 || raw.length > 200) return null;
  return prisma.oneTimeCode.findFirst({
    where: { purpose: 'PASSWORD_RESET', codeHash: sha256(raw) },
    include: { user: { select: { id: true, email: true, name: true, status: true, passwordHash: true, emailVerifiedAt: true, twoFactorEnabled: true, phone: true, phoneVerifiedAt: true } } },
  });
}

function resetCodeStatus(record) {
  if (!record?.user) return 'invalid';
  if (record.consumedAt) return 'used';
  if (record.expiresAt <= new Date()) return 'expired';
  if (record.user.status !== 'ACTIVE') return 'invalid';
  return 'valid';
}

// What the reset page shows before anyone types: whether the link still
// works, and for which (masked) address. Reading it changes nothing.
export async function checkPasswordReset(token) {
  const record = await findResetCode(token);
  const status = resetCodeStatus(record);
  if (status !== 'valid') return { status };
  return { status, emailHint: maskEmail(record.user.email), expiresAt: record.expiresAt.toISOString() };
}

const RESET_REFUSALS = {
  used: 'That reset link was already used. Ask for a new one if you still need it.',
  expired: 'That reset link has expired. Ask for a new one.',
  invalid: 'That reset link does not work. Ask for a new one.',
};

// Sets the new password, retires every outstanding link, signs out every
// device and tells the member. Holding the link proves the inbox, so the
// email counts as verified. The member is signed straight in unless the
// account uses two-step verification, which then runs as a normal sign-in.
export async function resetPassword({ token, newPassword, ipAddress, userAgent }) {
  const record = await findResetCode(token);
  const status = resetCodeStatus(record);
  if (status !== 'valid') throw badRequest(RESET_REFUSALS[status], { linkStatus: status });
  const { user } = record;

  const problem = passwordProblem(newPassword, { email: user.email, name: user.name });
  if (problem) throw invalid(problem);
  if ((await verifyPassword(newPassword, user.passwordHash)).ok) {
    throw invalid('That is the password you have now. Choose a different one.');
  }
  const passwordHash = await hashPassword(newPassword);

  await transaction(async (tx) => {
    const consumed = await tx.oneTimeCode.updateMany({ where: { id: record.id, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } });
    if (!consumed.count) throw badRequest(RESET_REFUSALS.used, { linkStatus: 'used' });
    await tx.oneTimeCode.updateMany({ where: { purpose: 'PASSWORD_RESET', userId: user.id, consumedAt: null }, data: { consumedAt: new Date() } });
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordChangedAt: new Date(), ...(user.emailVerifiedAt ? {} : { emailVerifiedAt: new Date() }) },
    });
    await audit(tx, { actorId: user.id, action: 'security.password_reset', targetType: 'User', targetId: user.id, ipAddress });
    await notify(tx, {
      userId: user.id,
      topic: 'MONEY',
      urgent: true,
      title: 'Your password was reset',
      body: 'Your Twendezetu password was changed with a reset link and every device was signed out. If this was not you, reset it again now and contact support.',
      href: '/settings?section=security',
    });
  });
  await revokeAllSessions(user.id);

  const twoStep = Boolean(user.twoFactorEnabled && user.phone && user.phoneVerifiedAt);
  if (twoStep) return { signedIn: false, email: user.email };
  const session = await createSession(user.id, { ipAddress, userAgent });
  await audit(prisma, { actorId: user.id, action: 'auth.signed_in', targetType: 'User', targetId: user.id, ipAddress });
  return { signedIn: true, email: user.email, session };
}

// ── Profile ───────────────────────────────────────────────────────────────

export async function updateProfile(user, { name, city, country, locale, currency, businessName, avatarUrl }) {
  if (country && !COUNTRIES[country]) throw invalid('Choose a supported country.');
  return transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(city !== undefined ? { city: city?.trim() || null } : {}),
        ...(country ? { country } : {}),
        ...(locale ? { locale } : {}),
        ...(currency ? { currency } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
      },
      select: { id: true, name: true, city: true, country: true, locale: true, currency: true, avatarUrl: true },
    });
    if (businessName && user.provider) {
      await tx.provider.update({ where: { id: user.provider.id }, data: { name: businessName.trim() } });
    }
    return updated;
  });
}

export async function changeEmail(user, { email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, email: true } });
  if (record.email === normalizedEmail) return { email: normalizedEmail };
  const { ok } = await verifyPassword(password || '', record.passwordHash);
  if (!ok) throw unauthorized('Enter your password to change your email.');
  const taken = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (taken) throw conflict('That email is already in use.', 'email_taken');
  await transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { email: normalizedEmail, emailVerifiedAt: null } });
    await audit(tx, { actorId: user.id, action: 'account.email_changed', targetType: 'User', targetId: user.id, meta: { from: record.email } });
  });
  return { email: normalizedEmail };
}

// ── Data rights ───────────────────────────────────────────────────────────

export async function exportPersonalData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, handle: true, phone: true, city: true, country: true, locale: true,
      currency: true, role: true, createdAt: true, twoFactorEnabled: true,
      rsvps: { select: { eventId: true, status: true, partySize: true, createdAt: true } },
      orders: { select: { reference: true, eventId: true, totalMinor: true, currency: true, status: true, createdAt: true } },
      tickets: { select: { code: true, eventId: true, status: true, holderName: true } },
      needs: { select: { slug: true, title: true, status: true, createdAt: true } },
      messages: { select: { threadId: true, body: true, createdAt: true } },
      reviews: { select: { providerId: true, rating: true, body: true, createdAt: true } },
      paymentMethods: { where: { deletedAt: null }, select: { kind: true, label: true, createdAt: true } },
      notificationPrefs: true,
      provider: { select: { slug: true, name: true, category: true, city: true, createdAt: true } },
    },
  });
  const wallet = await balanceOf(prisma, accounts.wallet(userId));
  return { exportedAt: new Date().toISOString(), account: user, walletPoints: wallet };
}

export async function deleteAccount(user, { password, ipAddress }) {
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  const { ok } = await verifyPassword(password || '', record.passwordHash);
  if (!ok) throw unauthorized('Your password is not right.');

  const [wallet, earnings, liveBookings, openPayouts] = await Promise.all([
    balanceOf(prisma, accounts.wallet(user.id)),
    balancesByCurrency(prisma, 'EARNINGS', user.id),
    prisma.booking.count({
      where: { OR: [{ customerId: user.id }, { provider: { ownerId: user.id } }], status: { in: ['PENDING_PAYMENT', 'ESCROWED', 'DISPUTED'] } },
    }),
    prisma.payout.count({ where: { userId: user.id, status: { in: ['REQUESTED', 'APPROVED'] } } }),
  ]);
  if (wallet > 0 || Object.values(earnings).some((amount) => amount > 0)) {
    throw conflict('Cash out or send your remaining balance before deleting your account.', 'balance_remaining');
  }
  if (liveBookings > 0) throw conflict('Finish or cancel your open bookings first. Escrow must be empty before deletion.', 'escrow_open');
  if (openPayouts > 0) throw conflict('Wait for your pending withdrawal to complete first.', 'payout_pending');

  await transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        email: `deleted+${user.id}@deleted.twendezetu.invalid`,
        name: 'Deleted member',
        handle: `deleted-${user.id.slice(-10)}`,
        phone: null,
        phoneVerifiedAt: null,
        avatarUrl: null,
        city: null,
        passwordHash: 'deleted',
        twoFactorEnabled: false,
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
    await tx.paymentMethod.updateMany({ where: { userId: user.id, deletedAt: null }, data: { deletedAt: new Date(), accountEnc: null } });
    await tx.provider.updateMany({ where: { ownerId: user.id }, data: { status: 'SUSPENDED' } });
    await tx.notificationPreference.deleteMany({ where: { userId: user.id } });
    await tx.outboundMessage.updateMany({ where: { userId: user.id, status: 'PENDING' }, data: { status: 'CANCELLED' } });
    await audit(tx, { actorId: user.id, action: 'account.deleted', targetType: 'User', targetId: user.id, ipAddress });
  });
  await revokeAllSessions(user.id);
}
