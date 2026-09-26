// Structured, single-line JSON logs. Hosting platforms index these fields, so
// a request can be traced by requestId across log lines.

const SECRET_KEYS = /pass(word)?|token|secret|authorization|cookie|otp|accountEnc|idNumber/i;

function scrub(value, depth = 0) {
  if (value == null || depth > 4) return value;
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
  if (Array.isArray(value)) return value.map((item) => scrub(item, depth + 1));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, SECRET_KEYS.test(key) ? '[redacted]' : scrub(item, depth + 1)]),
    );
  }
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function write(level, message, fields) {
  if (process.env.NODE_ENV === 'test' && level !== 'error') return;
  const line = JSON.stringify({ level, time: new Date().toISOString(), msg: message, ...scrub(fields || {}) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  info: (message, fields) => write('info', message, fields),
  warn: (message, fields) => write('warn', message, fields),
  error: (message, fields) => write('error', message, fields),
};
