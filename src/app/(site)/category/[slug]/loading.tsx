import { LoadingShell } from '@/components/LoadingShell';
import { Skeleton } from '@/components/Skeleton';

export default function CategoryLoading() {
  return (
    <LoadingShell>
      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-10 w-64 sm:h-12 sm:w-80" />

        <div className="mt-12">
          <Skeleton className="h-7 w-32" />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="min-h-[14rem] rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </LoadingShell>
  );
}
