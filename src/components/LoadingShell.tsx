import type { ReactNode } from 'react';

/** Slim indeterminate top progress bar, shown while a route segment streams in. */
function TopProgressBar() {
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
      className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-transparent"
    >
      <div className="h-full w-1/3 animate-[progress-slide_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-chartreuse via-paper to-chartreuse motion-reduce:hidden" />
    </div>
  );
}

/** Wraps every route's loading.tsx: the top progress bar plus that page's skeleton content. */
export function LoadingShell({ children }: { children: ReactNode }) {
  return (
    <>
      <TopProgressBar />
      {children}
    </>
  );
}
