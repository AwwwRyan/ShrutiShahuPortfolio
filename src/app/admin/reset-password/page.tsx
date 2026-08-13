import { redirect } from 'next/navigation';
import { resetPasswordWithToken } from '@/lib/passwordReset';

async function resetPasswordAction(formData: FormData) {
  'use server';

  const token = formData.get('token');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (typeof token !== 'string' || typeof password !== 'string' || password.length === 0) {
    redirect(`/admin/reset-password?token=${token}&error=invalid`);
  }

  if (password !== confirmPassword) {
    redirect(`/admin/reset-password?token=${token}&error=mismatch`);
  }

  const result = await resetPasswordWithToken(token, password);

  if (result !== 'success') {
    redirect(`/admin/reset-password?token=${token}&error=expired`);
  }

  redirect('/admin/login?reset=1');
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token, error } = await searchParams;

  if (typeof token !== 'string' || token.length === 0) {
    return (
      <main>
        <h1>Reset Password</h1>
        <p role="alert">This reset link is missing or malformed.</p>
        <p>
          <a href="/admin/forgot-password">Request a new link</a>
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Reset Password</h1>
      {error === 'mismatch' && <p role="alert">Passwords do not match.</p>}
      {error === 'expired' && <p role="alert">This link is invalid or has expired.</p>}
      {error === 'invalid' && <p role="alert">Please enter a new password.</p>}
      <form action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <label>
          New password
          <input type="password" name="password" required autoComplete="new-password" />
        </label>
        <label>
          Confirm new password
          <input type="password" name="confirmPassword" required autoComplete="new-password" />
        </label>
        <button type="submit">Set new password</button>
      </form>
    </main>
  );
}
