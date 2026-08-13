import { LoadingShell } from '@/components/LoadingShell';
import { Skeleton } from '@/components/Skeleton';

export default function ContactLoading() {
  return (
    <LoadingShell>
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-3 h-10 w-64 sm:h-12" />

        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-48" />
        </div>

        <Skeleton className="mt-12 h-7 w-40" />
        <div className="mt-6 space-y-5">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </main>
    </LoadingShell>
  );
}
