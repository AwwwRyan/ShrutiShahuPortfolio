import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FolderTree, FileText, History } from 'lucide-react';
import { auth } from '@/auth';
import { getRecentActivity } from '@/lib/activityLog';
import { adminCardClasses } from '@/lib/adminStyles';

/** Relative time for recent entries, falling back to an absolute date/time further back — keeps the feed scannable without needing a moment/date-fns dependency for something this small. */
function formatActivityTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.round(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) {
    redirect('/admin/login');
  }

  const recentActivity = await getRecentActivity();

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

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-serif text-xl text-paper">
          <History className="h-5 w-5 text-paper/60" aria-hidden="true" />
          Recent activity
        </h2>
        <div className={`mt-4 ${adminCardClasses}`}>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-paper/60">Nothing logged yet — changes you make will show up here.</p>
          ) : (
            <ul className="divide-y divide-paper/10">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="text-sm text-paper">{entry.summary}</span>
                  <span className="shrink-0 text-xs text-paper/50">{formatActivityTime(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
