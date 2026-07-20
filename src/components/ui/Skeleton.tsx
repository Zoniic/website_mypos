/** Base shimmer block for loading states. Respects prefers-reduced-motion. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none ${className}`}
    />
  );
}
