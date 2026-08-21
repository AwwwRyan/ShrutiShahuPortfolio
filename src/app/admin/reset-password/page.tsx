import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resetPasswordWithToken } from '@/lib/passwordReset';
import { adminLabelClasses, adminButtonPrimary, adminAlertClasses } from '@/lib/adminStyles';
import { PasswordInput } from '@/components/admin/PasswordInput';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';

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
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-paper/10 bg-paper/[0.06] p-8">
          <h1 className="font-serif text-2xl text-paper">Reset Password</h1>
          <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
            This reset link is missing or malformed.
          </p>
          <p className="mt-6 text-center text-sm">
            <Link
              href="/admin/forgot-password"
              className="text-paper/70 underline underline-offset-4 hover:text-chartreuse"
            >
              Request a new link
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-paper/10 bg-paper/[0.06] p-8">
        <h1 className="font-serif text-2xl text-paper">Reset Password</h1>

        {error === 'mismatch' && (
          <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
            Passwords do not match.
          </p>
        )}
        {error === 'expired' && (
          <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
            This link is invalid or has expired.
          </p>
        )}
        {error === 'invalid' && (
          <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
            Please enter a new password.
          </p>
        )}

        <form action={resetPasswordAction} className="mt-6 space-y-5">
          <input type="hidden" name="token" value={token} />
          <div>
            <label htmlFor="password" className={adminLabelClasses}>
              New password
            </label>
            <PasswordInput id="password" name="password" required autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={adminLabelClasses}>
              Confirm new password
            </label>
            <PasswordInput id="confirmPassword" name="confirmPassword" required autoComplete="new-password" />
          </div>
          <AdminSubmitButton className={`w-full ${adminButtonPrimary}`}>Set new password</AdminSubmitButton>
        </form>
      </div>
    </main>
  );
}
