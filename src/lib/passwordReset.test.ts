import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import { hashPassword, verifyPassword } from './password';
import { createPasswordResetToken, resetPasswordWithToken } from './passwordReset';

const RUN = `test-pwreset-${Date.now()}`;

async function makeAdmin(suffix: string) {
  return prisma.adminUser.create({
    data: {
      email: `${RUN}-${suffix}@example.com`,
      passwordHash: await hashPassword('original-password'),
    },
  });
}

describe('password reset flow', () => {
  afterAll(async () => {
    await prisma.adminUser.deleteMany({ where: { email: { startsWith: RUN } } });
    await prisma.$disconnect();
  });

  it('returns null for an email with no matching admin', async () => {
    const token = await createPasswordResetToken(`${RUN}-nobody@example.com`);
    expect(token).toBeNull();
  });

  it('resets the password with a valid token, and the token is single-use', async () => {
    const admin = await makeAdmin('single-use');

    const token = await createPasswordResetToken(admin.email);
    expect(token).not.toBeNull();

    const firstAttempt = await resetPasswordWithToken(token!, 'new-password-123');
    expect(firstAttempt).toBe('success');

    const updated = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
    await expect(verifyPassword('new-password-123', updated.passwordHash)).resolves.toBe(true);

    const secondAttempt = await resetPasswordWithToken(token!, 'another-password-456');
    expect(secondAttempt).toBe('invalid_or_expired');

    const stillUpdated = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
    await expect(verifyPassword('new-password-123', stillUpdated.passwordHash)).resolves.toBe(
      true,
    );
  });

  it('rejects an expired token', async () => {
    const admin = await makeAdmin('expired');

    const rawToken = 'expired-raw-token-for-test';
    const crypto = await import('node:crypto');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        adminUserId: admin.id,
        expiresAt: new Date(Date.now() - 1000), // already expired
      },
    });

    const result = await resetPasswordWithToken(rawToken, 'irrelevant-password');
    expect(result).toBe('invalid_or_expired');
  });

  it('rejects a token that does not exist', async () => {
    const result = await resetPasswordWithToken('not-a-real-token', 'irrelevant-password');
    expect(result).toBe('invalid_or_expired');
  });
});
