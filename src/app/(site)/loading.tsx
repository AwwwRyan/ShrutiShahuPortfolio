import { LoadingShell } from '@/components/LoadingShell';
import { Skeleton } from '@/components/Skeleton';

export default function HomeLoading() {
  return (
    <LoadingShell>
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="grid items-center gap-10 sm:grid-cols-[1.2fr_0.8fr] sm:gap-16">
            <div>
              <Skeleton className="h-10 w-64 sm:h-12 sm:w-80" />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-4 w-full max-w-lg" />
                <Skeleton className="h-4 w-2/3 max-w-md" />
              </div>
              <Skeleton className="mt-8 h-12 w-40 rounded-full" />
            </div>
            <Skeleton className="aspect-[4/5] w-full max-w-xs justify-self-center rounded-3xl sm:max-w-sm sm:justify-self-end" />
          </div>
        </section>

        <section className="border-y border-paper/10 bg-paper/[0.04]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <Skeleton className="h-9 w-40" />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="min-h-[12rem] rounded-2xl" />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <Skeleton className="h-9 w-40" />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <Skeleton className="h-9 w-48" />
          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, groupIndex) => (
              <div key={groupIndex}>
                <Skeleton className="h-4 w-32" />
                <div className="mt-4 flex flex-wrap gap-3">
                  {Array.from({ length: 5 }).map((_, chipIndex) => (
                    <Skeleton key={chipIndex} className="h-9 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </LoadingShell>
  );
}
