import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { adminInputClasses, adminLabelClasses, adminButtonPrimary, adminAlertClasses, adminStatusClasses } from '@/lib/adminStyles';
import { PasswordInput } from '@/components/admin/PasswordInput';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';

async function loginAction(formData: FormData) {
  'use server';

  // With the default redirect:true, signIn() swallows a bad-credentials failure by
  // performing its OWN internal redirect() (to a bare /admin/login, no error info) —
  // it never actually throws anything for a try/catch to catch. redirect:false disables
  // that internal redirect, which is what makes it throw a real, catchable AuthError
  // (CredentialsSignin) on failure instead — we do the redirect ourselves either way.
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/admin/login?error=1');
    }
    throw error;
  }

  redirect('/admin');
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-paper/10 bg-paper/[0.06] p-8">
        <h1 className="font-serif text-2xl text-paper">Admin Login</h1>

        {error && (
          <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
            Invalid email or password.
          </p>
        )}
        {reset && (
          <p role="status" className={`mt-4 ${adminStatusClasses}`}>
            Your password has been reset. You can log in now.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-5">
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
          <div>
            <label htmlFor="password" className={adminLabelClasses}>
              Password
            </label>
            <PasswordInput id="password" name="password" required autoComplete="current-password" />
          </div>
          <AdminSubmitButton className={`w-full ${adminButtonPrimary}`}>Log in</AdminSubmitButton>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/admin/forgot-password" className="text-paper/70 underline underline-offset-4 hover:text-chartreuse">
            Forgot password?
          </Link>
        </p>
      </div>
    </main>
  );
}
