import { Skeleton } from "./Skeleton";

const ratioClass = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
} as const;

/** Matches the padded card shape used by ProductCard / AccessoriesExplorer. */
export function PaddedCardSkeleton() {
  return (
    <div className="h-full rounded-card border border-border bg-surface-1/40 p-4">
      <Skeleton className={`${ratioClass["1/1"]} w-full rounded-lg`} />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-2 h-5 w-20 rounded-full" />
    </div>
  );
}

/** Matches the edge-to-edge image card shape used by References / blog list. */
export function MediaCardSkeleton({
  ratio = "4/3",
  lines = 2,
}: {
  ratio?: keyof typeof ratioClass;
  lines?: number;
}) {
  return (
    <div className="h-full overflow-hidden rounded-card border border-border bg-surface-1/40">
      <Skeleton className={`${ratioClass[ratio]} w-full rounded-none`} />
      <div className="p-6">
        <Skeleton className="h-5 w-2/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`mt-2 h-4 ${i === lines - 1 ? "w-1/3" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}
