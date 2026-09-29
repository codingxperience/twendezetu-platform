// Delivers due outbox rows. Safe to run from several workers at once: rows
// are claimed with FOR UPDATE SKIP LOCKED and leased for five minutes, so a
// crashed worker's rows are picked up again (at-least-once delivery).

import { prisma } from '../db.js';
import { config } from '../config.js';
import nodemailer from 'nodemailer';
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

// The branded frame every email shares. `inner` is trusted markup built
// from escaped values; `button` is { href, label } or null.
function frame({ title, inner, button, footer }) {
  return `<!doctype html><html><body style="margin:0;background:#F7F1E6;font-family:Helvetica,Arial,sans-serif;color:#14201F">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFDF8;border:2px solid #1F3A38">
<tr><td style="background:#1F3A38;color:#F7F1E6;padding:18px 24px;font-size:18px;font-weight:bold;letter-spacing:1px"><img src="${escapeHtml(config().appUrl)}/brand/logo-light.png" alt="Twendezetu" width="170" height="32" style="display:block;height:32px;width:170px;border:0"></td></tr>
<tr><td style="padding:28px 24px"><h1 style="margin:0 0 12px;font-size:22px">${escapeHtml(title)}</h1>
${inner}
${button ? `<a href="${escapeHtml(button.href)}" style="display:inline-block;background:#D97A3B;color:#1F3A38;text-decoration:none;font-weight:bold;padding:12px 20px">${escapeHtml(button.label)}</a>` : ''}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #EFE7D6;font-size:12px;color:#6E6155">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function paragraphs(text) {
  return String(text)
    .split(/\n{2,}/)
    .map((part) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.55">${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function emailBodies(message) {
  const link = absolute(message.href);
  const settings = `${config().appUrl}/settings`;
  const text = `${message.body}${link ? `\n\n${link}` : ''}\n\n— Twendezetu\nManage notifications: ${settings}`;
  const html = frame({
    title: message.subject,
    inner: paragraphs(message.body),
    button: link ? { href: link, label: 'Open Twendezetu →' } : null,
    footer: `You receive this because of your Twendezetu activity. <a href="${escapeHtml(settings)}" style="color:#A85A23">Notification settings</a>`,
  });
  return { text, html };
}

// The password reset email. It carries a live credential, so it is built
// and sent directly rather than stored in the outbox or the in-app inbox.
export function passwordResetEmail({ name, link, minutes }) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi,';
  const body = `${greeting}\n\nSomeone asked to reset the password for your Twendezetu account. If it was you, choose a new password with the link below. It works once, for the next ${minutes} minutes.\n\nIf you did not ask for this, ignore this email: your password stays as it is and nobody can use this link without access to your inbox.`;
  const subject = 'Reset your Twendezetu password';
  const text = `${body}\n\nChoose a new password: ${link}\n\n— Twendezetu`;
  const html = frame({
    title: subject,
    inner: paragraphs(body),
    button: { href: link, label: 'Choose a new password →' },
    footer: `If the button does not work, paste this address into your browser:<br><span style="word-break:break-all">${escapeHtml(link)}</span>`,
  });
  return { subject, text, html };
}

export function emailConfigured() {
  const { resendApiKey, smtp } = config().email;
  return Boolean(resendApiKey || smtp);
}

// One pooled connection, reused across sends until the mailbox settings
// change (a new password included).
let mailbox = null;

function smtpTransport(smtp) {
  if (mailbox?.smtp !== smtp) {
    mailbox?.transport.close();
    mailbox = {
      smtp,
      transport: nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        // Port 465 speaks TLS from the first byte; others must upgrade with
        // STARTTLS before the password is sent, at least in production.
        secure: smtp.port === 465,
        requireTLS: smtp.port !== 465 && config().production,
        auth: { user: smtp.user, pass: smtp.password },
        pool: true,
        maxConnections: 2,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      }),
    };
  }
  return mailbox.transport;
}

// Sends one email now: through Resend when it is configured, otherwise
// through the site's own mailbox over SMTP. Throws on a refused or failed
// send, so callers can retry.
export async function sendEmailNow({ to, subject, text, html, idempotencyKey }) {
  const { resendApiKey, smtp, from } = config().email;
  if (resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${resendApiKey}`,
        'content-type': 'application/json',
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Resend responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
    return;
  }
  if (!smtp) throw new Error('No email provider is configured.');
  const info = await smtpTransport(smtp).sendMail({ from, to, subject, text, html });
  if (info.rejected?.length) throw new Error(`The mail server refused ${info.rejected.join(', ')}`);
}

async function sendEmail(message) {
  if (!emailConfigured()) {
    if (!config().production) log.info('email (not sent: no email provider configured)', { to: message.to, subject: message.subject, body: message.body });
    return { skipped: true, reason: 'email_not_configured' };
  }
  const { text, html } = emailBodies(message);
  await sendEmailNow({ to: message.to, subject: message.subject, text, html, idempotencyKey: message.id });
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
