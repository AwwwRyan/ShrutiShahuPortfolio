import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FolderTree, FileText } from 'lucide-react';
import { auth } from '@/auth';
import { adminCardClasses } from '@/lib/adminStyles';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <h1 className="font-serif text-3xl text-paper">Admin Dashboard</h1>
      <p className="mt-2 text-paper/70">Signed in as {session.user?.email}</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/admin/categories"
          className={`group flex items-center gap-4 transition-colors hover:border-chartreuse/40 ${adminCardClasses}`}
        >
          <span className="blob-mask flex h-12 w-12 shrink-0 items-center justify-center bg-chartreuse/15 text-chartreuse">
            <FolderTree className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <div className="font-serif text-lg text-paper">Manage categories</div>
            <div className="text-sm text-paper/60">Categories, subcategories, and projects</div>
          </div>
        </Link>

        <Link
          href="/admin/site-content"
          className={`group flex items-center gap-4 transition-colors hover:border-chartreuse/40 ${adminCardClasses}`}
        >
          <span className="blob-mask flex h-12 w-12 shrink-0 items-center justify-center bg-chartreuse/15 text-chartreuse">
            <FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <div className="font-serif text-lg text-paper">About Me &amp; contact info</div>
            <div className="text-sm text-paper/60">Bio, photo, resume, contact and social links</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
