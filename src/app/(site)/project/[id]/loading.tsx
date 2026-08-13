import { LoadingShell } from '@/components/LoadingShell';
import { Skeleton } from '@/components/Skeleton';

export default function ProjectLoading() {
  return (
    <LoadingShell>
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-10 w-3/4 sm:h-12" />

        <div className="mt-4 flex gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        <Skeleton className="mt-8 aspect-video w-full rounded-2xl" />

        <div className="mt-8 max-w-2xl space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </main>
    </LoadingShell>
  );
}
