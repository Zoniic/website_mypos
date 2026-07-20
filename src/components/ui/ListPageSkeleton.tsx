import { Skeleton } from "./Skeleton";
import { PaddedCardSkeleton, MediaCardSkeleton } from "./CardSkeleton";

function HeaderSkeleton() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="mt-10 h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-1.5 h-5 w-3/5 max-w-2xl" />
    </>
  );
}

/**
 * Route-level loading skeleton for card-grid list pages (products,
 * accessories, references, blog). Mirrors each page's real container width
 * and column breakpoints so the layout doesn't jump once data arrives.
 */
export function ListPageSkeleton({
  columns,
  card,
  count = 8,
  filterRow = false,
}: {
  columns: string;
  card: "padded" | "media";
  count?: number;
  filterRow?: boolean;
}) {
  return (
    <div>
      <HeaderSkeleton />
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {filterRow && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
        )}
        <div className={`mt-8 grid gap-6 ${columns}`}>
          {Array.from({ length: count }).map((_, i) =>
            card === "padded" ? (
              <PaddedCardSkeleton key={i} />
            ) : (
              <MediaCardSkeleton key={i} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
