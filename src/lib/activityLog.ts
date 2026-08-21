import { prisma } from './prisma';

/**
 * Records one line for the dashboard's activity feed. Best-effort: a logging
 * failure must never surface as if the real mutation it's describing had
 * failed, so errors are swallowed here rather than propagated.
 */
export async function logActivity(summary: string): Promise<void> {
  try {
    await prisma.activityLogEntry.create({ data: { summary } });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentActivity(limit = 20) {
  return prisma.activityLogEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
