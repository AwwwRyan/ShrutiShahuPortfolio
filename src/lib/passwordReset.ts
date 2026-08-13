import crypto from 'node:crypto';
import { prisma } from './prisma';
import { hashPassword } from './password';

const TOKEN_BYTES = 32;
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a password reset token for the given email, if an admin with that
 * email exists. Returns the raw (unhashed) token to embed in the reset link,
 * or null if no matching admin was found — callers should show the same
 * generic confirmation either way, to avoid leaking which emails are valid.
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return null;
  }

  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(rawToken),
      adminUserId: admin.id,
      expiresAt: new Date(Date.now() + EXPIRY_MS),
    },
  });

  return rawToken;
}

export type ResetPasswordResult = 'success' | 'invalid_or_expired';

/**
 * Validates a raw reset token (unused, unexpired), sets the new password,
 * and marks the token used — all in one transaction so a token can never be
 * spent twice even under concurrent requests.
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const tokenHash = hashToken(rawToken);
  const passwordHash = await hashPassword(newPassword);

  try {
    await prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({ where: { tokenHash } });

      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        throw new Error('invalid_or_expired');
      }

      await tx.adminUser.update({
        where: { id: resetToken.adminUserId },
        data: { passwordHash },
      });
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
    });
  } catch {
    return 'invalid_or_expired';
  }

  return 'success';
}
