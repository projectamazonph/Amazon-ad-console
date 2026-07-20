import { PrismaClient } from '../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization — PrismaClient cannot be instantiated at build time
// (no DATABASE_URL available during `next build`). We defer to first use.
let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    if (globalForPrisma.prisma) {
      _prisma = globalForPrisma.prisma;
    } else {
      const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
      _prisma = new PrismaClient({ adapter });
    }
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma;
  }
  return _prisma;
}

// Backward-compatible alias
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});
