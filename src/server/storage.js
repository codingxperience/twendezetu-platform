// File uploads: identity documents, business proof, portfolio photos,
// message attachments and dispute evidence.
//
// The declared content type is never trusted: the first bytes decide what a
// file is. Location metadata is stripped from JPEGs before anything is
// stored. Private files (KYC, evidence) go to a private bucket and are only
// ever streamed through the application after an access check.
//
// Storage is Supabase Storage when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// are set; otherwise, outside production, files are kept in Postgres so the
// whole product works on a laptop.

import { createHash } from 'node:crypto';
import { config } from './config.js';
import { prisma } from './db.js';
import { badRequest, unavailable } from './errors.js';
import { randomToken } from './security/crypto.js';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const RULES = {
  AVATAR: { visibility: 'PUBLIC', types: ['image/jpeg', 'image/png', 'image/webp'] },
  PROVIDER_MEDIA: { visibility: 'PUBLIC', types: ['image/jpeg', 'image/png', 'image/webp'] },
  EVENT_COVER: { visibility: 'PUBLIC', types: ['image/jpeg', 'image/png', 'image/webp'] },
  KYC_ID: { visibility: 'PRIVATE', types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
  KYC_PROOF: { visibility: 'PRIVATE', types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
  KYC_PORTFOLIO: { visibility: 'PRIVATE', types: ['image/jpeg', 'image/png', 'image/webp'] },
  MESSAGE: { visibility: 'PRIVATE', types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
  DISPUTE_EVIDENCE: { visibility: 'PRIVATE', types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
};

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };

export function sniffType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length >= 5 && bytes.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
  return null;
}

// Removes APP1 (EXIF/XMP) and APP13 (IPTC) segments from a JPEG. These carry
// GPS coordinates and camera serials; the image data is untouched.
export function stripJpegMetadata(bytes) {
  if (sniffType(bytes) !== 'image/jpeg') return bytes;
  const parts = [bytes.subarray(0, 2)];
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return bytes; // malformed; keep original
    const marker = bytes[offset + 1];
    if (marker === 0xda) {
      parts.push(bytes.subarray(offset));
      return Buffer.concat(parts);
    }
    const length = bytes.readUInt16BE(offset + 2);
    const end = offset + 2 + length;
    if (end > bytes.length) return bytes;
    if (marker !== 0xe1 && marker !== 0xed) parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  return bytes;
}

function storageMode() {
  const { supabaseUrl, serviceRoleKey, databaseFallback } = config().storage;
  if (supabaseUrl && serviceRoleKey) return 'SUPABASE';
  if (databaseFallback) return 'DATABASE';
  return null;
}

async function supabaseRequest(method, path, init = {}) {
  const { supabaseUrl, serviceRoleKey } = config().storage;
  const response = await fetch(`${supabaseUrl}/storage/v1/${path}`, {
    method,
    ...init,
    headers: { authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, ...(init.headers || {}) },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Storage responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
  return response;
}

function sanitizeName(name) {
  const base = String(name || 'file').split(/[\\/]/).pop();
  return base.replace(/[^\w.\- ]+/g, '').slice(0, 80) || 'file';
}

export async function storeFile({ ownerId, purpose, name, bytes }) {
  const rules = RULES[purpose];
  if (!rules) throw badRequest('Unknown upload purpose.');
  if (!bytes?.length) throw badRequest('The file is empty.');
  if (bytes.length > MAX_UPLOAD_BYTES) throw badRequest('Files can be at most 4 MB.');

  const mime = sniffType(bytes);
  if (!mime || !rules.types.includes(mime)) {
    throw badRequest(rules.types.includes('application/pdf') ? 'Upload a JPG, PNG, WebP or PDF file.' : 'Upload a JPG, PNG or WebP image.');
  }

  const clean = mime === 'image/jpeg' ? stripJpegMetadata(bytes) : bytes;
  const mode = storageMode();
  if (!mode) throw unavailable('File uploads are not configured yet.');

  const bucket = rules.visibility === 'PUBLIC' ? config().storage.publicBucket : config().storage.privateBucket;
  const key = `${purpose.toLowerCase()}/${ownerId}/${randomToken(12)}.${EXTENSIONS[mime]}`;

  if (mode === 'SUPABASE') {
    await supabaseRequest('POST', `object/${bucket}/${key}`, {
      headers: { 'content-type': mime, 'x-upsert': 'false', 'cache-control': 'max-age=31536000' },
      body: clean,
    });
  }

  return prisma.fileObject.create({
    data: {
      ownerId,
      purpose,
      visibility: rules.visibility,
      driver: mode,
      bucket,
      key,
      name: sanitizeName(name),
      mime,
      size: clean.length,
      sha256: createHash('sha256').update(clean).digest('hex'),
      data: mode === 'DATABASE' ? clean : null,
    },
    select: { id: true, name: true, mime: true, size: true, purpose: true, visibility: true },
  });
}

export async function readFileBytes(file) {
  if (file.driver === 'DATABASE') {
    const row = await prisma.fileObject.findUnique({ where: { id: file.id }, select: { data: true } });
    return row?.data ? Buffer.from(row.data) : null;
  }
  const response = await supabaseRequest('GET', `object/${file.bucket}/${file.key}`);
  return Buffer.from(await response.arrayBuffer());
}

export function publicUrl(fileId) {
  return `/api/files/${fileId}`;
}
