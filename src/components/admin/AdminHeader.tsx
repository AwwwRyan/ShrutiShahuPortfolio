import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { AdminNav } from './AdminNav';
import { AdminSubmitButton } from './AdminSubmitButton';
import { adminButtonSecondary } from '@/lib/adminStyles';

/** Calls auth() itself — same independent-data-fetch pattern as the public Footer.tsx calling getSiteContent(). */
export async function AdminHeader() {
  const session = await auth();

  return (
    <header className="border-b border-paper/10 bg-navy-teal/30">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={session ? '/admin' : '/admin/login'} className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Shruti Shahu" className="h-9 w-9 shrink-0" />
          <span className="font-serif text-lg font-semibold tracking-tight text-paper">Admin</span>
        </Link>

        {session && (
          <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto">
            <AdminNav />
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-paper/50 md:inline">{session.user?.email}</span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/admin/login' });
                }}
              >
                <AdminSubmitButton className={adminButtonSecondary}>Log out</AdminSubmitButton>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
