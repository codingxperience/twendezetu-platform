// Ticket codes and QR payloads.
//
// A ticket code looks like "TW-7Q2K-M9XD": 40 random bits in Crockford
// base32, readable over a noisy gate. The QR code carries the code plus an
// HMAC signature, "TW1.TW-7Q2K-M9XD.4F9K2M7QXA", so a scanner can reject a
// forged or mistyped QR before looking anything up.

import { crockford, crockfordFromBytes, hmac, safeEqual } from '../security/crypto.js';

export function newTicketCode() {
  return `TW-${crockford(4)}-${crockford(4)}`;
}

function signature(code) {
  return crockfordFromBytes(hmac('ticket', code), 10);
}

export function qrPayload(code) {
  return `TW1.${code}.${signature(code)}`;
}

// Accepts a scanned QR payload or a code typed by door staff. Returns
// { code, signed, authentic }: typed codes are unsigned and still valid,
// they just cannot be checked offline.
export function parseScan(input) {
  const raw = String(input || '').trim().toUpperCase();
  if (raw.startsWith('TW1.')) {
    const [, code, sig] = raw.split('.');
    if (!code || !sig) return { code: null, signed: true, authentic: false };
    return { code, signed: true, authentic: safeEqual(sig, signature(code)) };
  }
  const compact = raw.replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (!compact.startsWith('TW') || compact.length !== 10) return { code: null, signed: false, authentic: false };
  return { code: `TW-${compact.slice(2, 6)}-${compact.slice(6, 10)}`, signed: false, authentic: true };
}

// A QR grid (7×7 cells) derived from the signature: a visual fingerprint
// that makes two tickets look different at a glance in My Twende. The
// scannable QR is rendered separately from qrPayload().
export function fingerprintCells(code) {
  const bytes = hmac('ticket-fingerprint', code);
  return Array.from({ length: 49 }, (_value, index) => ((bytes[index % bytes.length] >> (index % 8)) & 1 ? '#14201F' : '#F7F1E6'));
}
