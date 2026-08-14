/** Shared skeleton block — pulses to indicate loading, freezes under prefers-reduced-motion. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-paper/10 motion-reduce:animate-none ${className}`}
    />
  );
}
