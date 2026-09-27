// Sending through the site's own mailbox. A small SMTP server on this
// machine stands in for the host's mail server and records what arrives.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';

process.env.DATABASE_URL ||= 'postgresql://test@localhost:5432/unused';
process.env.AUTH_SECRET ||= 'test-secret-that-is-long-enough-for-config';
delete process.env.RESEND_API_KEY;
delete process.env.EMAIL_FROM;

const received = [];
const server = createServer((socket) => {
  let inData = false;
  let data = '';
  let auth = null;
  let buffer = '';
  socket.write('220 mail.test ESMTP\r\n');
  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    let index;
    while ((index = buffer.indexOf('\r\n')) !== -1) {
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      if (inData) {
        if (line === '.') {
          inData = false;
          received.push({ auth, data });
          data = '';
          socket.write('250 2.0.0 queued\r\n');
        } else {
          data += `${line.startsWith('..') ? line.slice(1) : line}\n`;
        }
        continue;
      }
      const command = line.toUpperCase();
      if (command.startsWith('EHLO')) socket.write('250-mail.test\r\n250 AUTH PLAIN LOGIN\r\n');
      else if (command.startsWith('AUTH PLAIN ')) {
        const [, user, pass] = Buffer.from(line.slice(11), 'base64').toString('utf8').split('\0');
        auth = { user, pass };
        socket.write(pass === 'mailbox-password' ? '235 2.7.0 ok\r\n' : '535 5.7.8 bad credentials\r\n');
      } else if (command.startsWith('MAIL FROM') || command.startsWith('RCPT TO')) socket.write('250 ok\r\n');
      else if (command === 'DATA') {
        inData = true;
        socket.write('354 go ahead\r\n');
      } else if (command === 'QUIT') socket.end('221 bye\r\n');
      else socket.write('250 ok\r\n');
    }
  });
});

let config;
let mail;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.env.SMTP_HOST = '127.0.0.1';
  process.env.SMTP_PORT = String(server.address().port);
  process.env.SMTP_USER = 'jambo@twendezetu.com';
  process.env.SMTP_PASSWORD = 'mailbox-password';
  config = await import('../../src/server/config.js');
  config.resetConfigForTests();
  mail = await import('../../src/server/notify/dispatch.js');
});

after(() => new Promise((resolve) => server.close(resolve)));

test('a mailbox login counts as a configured email provider', () => {
  assert.equal(mail.emailConfigured(), true);
  assert.equal(config.config().email.from, 'Twendezetu <jambo@twendezetu.com>');
});

test('a reset email goes out through the mailbox, from the mailbox', async () => {
  const link = 'https://twendezetu.com/sign-in?reset=abc123DEF456ghi789JKL012mno345';
  const message = mail.passwordResetEmail({ name: 'Neema Wanjiru', link, minutes: 30 });
  await mail.sendEmailNow({ to: 'neema@example.com', ...message });

  assert.equal(received.length, 1);
  const [{ auth, data }] = received;
  assert.deepEqual(auth, { user: 'jambo@twendezetu.com', pass: 'mailbox-password' });
  assert.match(data, /^From: Twendezetu <jambo@twendezetu\.com>$/m);
  assert.match(data, /^To: neema@example\.com$/m);
  assert.match(data, /^Subject: Reset your Twendezetu password$/m);
  assert.match(data, /Hi Neema,/);
  // The link survives transfer encoding in the plain-text part.
  const plain = data.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
  assert.ok(plain.includes(link));
});

test('a refused login is an error the caller can retry', async () => {
  process.env.SMTP_PASSWORD = 'wrong';
  config.resetConfigForTests();
  await assert.rejects(mail.sendEmailNow({ to: 'neema@example.com', subject: 'x', text: 'x', html: '<p>x</p>' }), /Invalid login|535/);
});
