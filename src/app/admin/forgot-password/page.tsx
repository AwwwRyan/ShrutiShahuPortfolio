import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createPasswordResetToken } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';
import { adminInputClasses, adminLabelClasses, adminButtonPrimary, adminStatusClasses } from '@/lib/adminStyles';

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
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-paper/10 bg-paper/[0.06] p-8">
        <h1 className="font-serif text-2xl text-paper">Forgot Password</h1>

        {sent ? (
          <p role="status" className={`mt-6 ${adminStatusClasses}`}>
            If that email is registered, a password reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form action={forgotPasswordAction} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className={adminLabelClasses}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="username"
                className={adminInputClasses}
              />
            </div>
            <button type="submit" className={`w-full ${adminButtonPrimary}`}>
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/admin/login" className="text-paper/70 underline underline-offset-4 hover:text-chartreuse">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
