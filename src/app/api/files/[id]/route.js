import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { readFileBytes } from '@/server/storage';

// Streams a stored file. Public media is cacheable by anyone; private files
// (identity documents, evidence, attachments) only reach their owner, the
// other people in the conversation or case, and the trust team.
export const GET = route({ auth: 'optional' }, async ({ params, viewer }) => {
  const file = await prisma.fileObject.findUnique({
    where: { id: params.id },
    select: { id: true, ownerId: true, purpose: true, visibility: true, driver: true, bucket: true, key: true, mime: true, name: true },
  });
  if (!file) throw notFound();
  if (file.visibility === 'PRIVATE' && !(await canRead(file, viewer))) throw notFound();

  const bytes = await readFileBytes(file);
  if (!bytes) throw notFound();
  const inline = file.mime.startsWith('image/');
  return new Response(bytes, {
    headers: {
      'content-type': file.mime,
      'content-length': String(bytes.length),
      'content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${file.name.replace(/"/g, '')}"`,
      'cache-control': file.visibility === 'PUBLIC' ? 'public, max-age=31536000, immutable' : 'private, no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
});

async function canRead(file, viewer) {
  if (!viewer) return false;
  if (file.ownerId === viewer.id) return true;
  if (['ADMIN', 'MODERATOR'].includes(viewer.role)) return true;
  if (file.purpose === 'MESSAGE') {
    const message = await prisma.message.findFirst({ where: { fileId: file.id }, select: { threadId: true } });
    if (!message) return false;
    return Boolean(await prisma.threadParticipant.findUnique({ where: { threadId_userId: { threadId: message.threadId, userId: viewer.id } } }));
  }
  if (file.purpose === 'DISPUTE_EVIDENCE') {
    return Boolean(
      await prisma.disputeEvidence.findFirst({
        where: { fileId: file.id, dispute: { OR: [{ openedById: viewer.id }, { respondentId: viewer.id }] } },
        select: { id: true },
      }),
    );
  }
  return false;
}
