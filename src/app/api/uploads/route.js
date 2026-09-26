import { route } from '@/server/http';
import { badRequest } from '@/server/errors';
import { MAX_UPLOAD_BYTES, storeFile } from '@/server/storage';

const PURPOSES = new Set(['AVATAR', 'PROVIDER_MEDIA', 'EVENT_COVER', 'KYC_ID', 'KYC_PROOF', 'KYC_PORTFOLIO', 'MESSAGE', 'DISPUTE_EVIDENCE']);

// multipart/form-data with `file` and `purpose`. The file's real type is
// read from its first bytes; the name and declared type are only labels.
export const POST = route({ auth: 'required', limit: [{ policy: 'upload', by: 'user' }] }, async ({ req, viewer }) => {
  const length = Number(req.headers.get('content-length') || 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) throw badRequest('Files can be at most 4 MB.');
  let form;
  try {
    form = await req.formData();
  } catch {
    throw badRequest('Send the file as multipart form data.');
  }
  const file = form.get('file');
  const purpose = String(form.get('purpose') || '');
  if (!PURPOSES.has(purpose)) throw badRequest('Unknown upload purpose.');
  if (!file || typeof file.arrayBuffer !== 'function') throw badRequest('Choose a file to upload.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const stored = await storeFile({ ownerId: viewer.id, purpose, name: file.name, bytes });
  return { file: { ...stored, url: `/api/files/${stored.id}` } };
});
