// Delivers due outbox rows. Safe to run from several workers at once: rows
// are claimed with FOR UPDATE SKIP LOCKED and leased for five minutes, so a
// crashed worker's rows are picked up again (at-least-once delivery).

import { prisma } from '../db.js';
import { config } from '../config.js';
import { log } from '../log.js';

const MAX_ATTEMPTS = 5;

export async function dispatchDue({ batchSize = 50 } = {}) {
  const claimed = await prisma.$queryRaw`
    UPDATE "OutboundMessage"
       SET "attempts" = "attempts" + 1,
           "sendAfter" = now() + interval '5 minutes'
     WHERE "id" IN (
       SELECT "id" FROM "OutboundMessage"
        WHERE "status" = 'PENDING' AND "sendAfter" <= now()
        ORDER BY "sendAfter"
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED
     )
    RETURNING *`;

  const summary = { sent: 0, skipped: 0, failed: 0, retrying: 0 };
  for (const message of claimed) {
    try {
      const outcome = await deliver(message);
      await prisma.outboundMessage.update({
        where: { id: message.id },
        data: outcome.skipped
          ? { status: 'SKIPPED', lastError: outcome.reason }
          : { status: 'SENT', sentAt: new Date(), lastError: null },
      });
      summary[outcome.skipped ? 'skipped' : 'sent'] += 1;
    } catch (error) {
      const finalAttempt = message.attempts >= MAX_ATTEMPTS;
      const backoffMinutes = 2 ** message.attempts;
      await prisma.outboundMessage.update({
        where: { id: message.id },
        data: finalAttempt
          ? { status: 'FAILED', lastError: String(error.message).slice(0, 500) }
          : { lastError: String(error.message).slice(0, 500), sendAfter: new Date(Date.now() + backoffMinutes * 60_000) },
      });
      summary[finalAttempt ? 'failed' : 'retrying'] += 1;
      log.warn('outbound delivery failed', { id: message.id, channel: message.channel, attempt: message.attempts, error: error.message });
    }
  }
  return summary;
}

async function deliver(message) {
  switch (message.channel) {
    case 'IN_APP':
      await prisma.notification.create({
        data: { userId: message.userId, topic: message.topic, title: message.subject, body: message.body, href: message.href },
      });
      return { skipped: false };
    case 'EMAIL':
      return sendEmail(message);
    case 'SMS':
      return sendSms(message);
    case 'WHATSAPP':
      // No WhatsApp Business provider is connected yet. The in-app, email and
      // SMS copies still go out; this copy is recorded as skipped.
      return { skipped: true, reason: 'whatsapp_not_configured' };
    default:
      return { skipped: true, reason: `unknown_channel_${message.channel}` };
  }
}

function absolute(href) {
  if (!href) return null;
  return href.startsWith('http') ? href : `${config().appUrl}${href}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function emailBodies(message) {
  const link = absolute(message.href);
  const text = `${message.body}${link ? `\n\n${link}` : ''}\n\n— Twendezetu\nManage notifications: ${config().appUrl}/settings`;
  const html = `<!doctype html><html><body style="margin:0;background:#F7F1E6;font-family:Helvetica,Arial,sans-serif;color:#14201F">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFDF8;border:2px solid #1F3A38">
<tr><td style="background:#1F3A38;color:#F7F1E6;padding:18px 24px;font-size:18px;font-weight:bold;letter-spacing:1px">TWENDE<span style="color:#D97A3B">ZETU</span></td></tr>
<tr><td style="padding:28px 24px"><h1 style="margin:0 0 12px;font-size:22px">${escapeHtml(message.subject)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.55">${escapeHtml(message.body).replace(/\n/g, '<br>')}</p>
${link ? `<a href="${escapeHtml(link)}" style="display:inline-block;background:#D97A3B;color:#1F3A38;text-decoration:none;font-weight:bold;padding:12px 20px">Open Twendezetu →</a>` : ''}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #EFE7D6;font-size:12px;color:#6E6155">You receive this because of your Twendezetu activity. <a href="${escapeHtml(config().appUrl)}/settings" style="color:#A85A23">Notification settings</a></td></tr>
</table></td></tr></table></body></html>`;
  return { text, html };
}

async function sendEmail(message) {
  const { resendApiKey, from } = config().email;
  if (!resendApiKey) {
    if (!config().production) log.info('email (not sent: RESEND_API_KEY unset)', { to: message.to, subject: message.subject, body: message.body });
    return { skipped: true, reason: 'email_not_configured' };
  }
  const { text, html } = emailBodies(message);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${resendApiKey}`, 'content-type': 'application/json', 'idempotency-key': message.id },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, text, html }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
  return { skipped: false };
}

async function sendSms(message) {
  const { apiKey, username, senderId } = config().sms;
  const body = `${message.body}${message.href ? ` ${absolute(message.href)}` : ''}`.slice(0, 459);
  if (!apiKey || !username) {
    if (!config().production) log.info('sms (not sent: Africa\'s Talking unset)', { to: message.to, body });
    return { skipped: true, reason: 'sms_not_configured' };
  }
  const host = username === 'sandbox' ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com';
  const form = new URLSearchParams({ username, to: message.to, message: body });
  if (senderId) form.set('from', senderId);
  const response = await fetch(`${host}/version1/messaging`, {
    method: 'POST',
    headers: { apiKey, accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Africa's Talking responded ${response.status}`);
  const result = await response.json();
  const recipient = result?.SMSMessageData?.Recipients?.[0];
  if (!recipient || !['Success', 'Sent'].includes(recipient.status)) {
    throw new Error(`SMS rejected: ${recipient?.status || result?.SMSMessageData?.Message || 'unknown'}`);
  }
  return { skipped: false };
}
