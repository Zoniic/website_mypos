import { Skeleton } from "./Skeleton";

/**
 * Fallback loading skeleton for routes without their own loading.tsx
 * (detail pages, about/contact/solutions/software/service, etc). Mirrors the
 * common shape across those pages — breadcrumb, title block, then a media +
 * text region — so navigation doesn't flash a blank page or an unrelated
 * spinner.
 */
export default function GenericPageSkeleton() {
  return (
    <div>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-3/4 max-w-xl sm:h-11" />
        <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
        <Skeleton className="mt-1.5 h-5 w-2/3 max-w-2xl" />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <Skeleton className="aspect-[4/3] w-full rounded-hero-asset" />
          <div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
