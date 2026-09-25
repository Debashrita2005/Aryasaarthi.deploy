// AryaSaarthi — Prisma singleton (hot-reload-safe for Next.js dev)
import { PrismaClient } from '@prisma/client';

import path from 'path';

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  dbUrl = `file:${path.resolve(process.cwd(), 'prisma', 'dev.db')}`;
  process.env.DATABASE_URL = dbUrl;
} else if (dbUrl.startsWith('file:') && !path.isAbsolute(dbUrl.replace(/^file:/, ''))) {
  const relPath = dbUrl.replace(/^file:\.?\/?/, '');
  const targetPath = relPath.startsWith('prisma') ? relPath : path.join('prisma', relPath);
  dbUrl = `file:${path.resolve(process.cwd(), targetPath)}`;
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
