import { redirect } from 'next/navigation';
import { createPasswordResetToken } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';

async function forgotPasswordAction(formData: FormData) {
  'use server';

  const email = formData.get('email');
  if (typeof email === 'string' && email.length > 0) {
    const token = await createPasswordResetToken(email);
    if (token) {
      const resetUrl = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
  }

  // Always redirect to the same confirmation, whether or not the email
  // matched an admin account — avoids leaking which emails are registered.
  redirect('/admin/forgot-password?sent=1');
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sent } = await searchParams;

  return (
    <main>
      <h1>Forgot Password</h1>
      {sent ? (
        <p role="status">
          If that email is registered, a password reset link has been sent. Check your inbox.
        </p>
      ) : (
        <form action={forgotPasswordAction}>
          <label>
            Email
            <input type="email" name="email" required autoComplete="username" />
          </label>
          <button type="submit">Send reset link</button>
        </form>
      )}
      <p>
        <a href="/admin/login">Back to login</a>
      </p>
    </main>
  );
}
