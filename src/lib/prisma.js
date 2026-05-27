// Singleton PrismaClient. Next.js hot-reloads modules in dev, so without this
// the process collects a fresh client on every reload and exhausts the
// SQLite connection pool. In prod a new module instance is created exactly
// once, so the global handle is harmless.
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
