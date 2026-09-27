// Append-only record of security-relevant and money-relevant actions: who did
// what to which record, from where. Written in the caller's transaction.

import { Prisma } from '@prisma/client';

export async function audit(db, { actorId = null, action, targetType = null, targetId = null, ipAddress = null, meta }) {
  await db.auditLog.create({
    data: { actorId, action, targetType, targetId, ipAddress, meta: meta ?? Prisma.JsonNull },
  });
}
