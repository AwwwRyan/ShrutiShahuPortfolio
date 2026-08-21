import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Prisma's default maxWait (2s) is too short for Neon: a free-tier compute
    // auto-suspends after a few minutes idle, and waking it back up on the next
    // query can take longer than that — hit this for real on a $transaction
    // called right after a slow multi-file gallery upload (no DB activity
    // during the upload gave Neon time to suspend before the write started).
    transactionOptions: { maxWait: 10000, timeout: 20000 },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
