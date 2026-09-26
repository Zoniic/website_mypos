import { revalidatePath as nextRevalidatePath, revalidateTag } from "next/cache";

/**
 * Caching for the public site.
 *
 * Pages are served from Next's cache (ISR, see `revalidate` in
 * app/[locale]/layout.tsx) and the shared, admin-edited data behind them —
 * page copy, site settings, products — is cached under one tag. Every admin
 * save calls `revalidatePublicSite()` (via the `revalidatePath` wrapper
 * below), so edits still go live on the next page view.
 */
export const SITE_CONTENT_TAG = "site-content";

/** Safety net for writes that bypass the admin (seed scripts, direct SQL). */
export const SITE_CONTENT_TTL_SECONDS = 300;

export function revalidatePublicSite() {
  // expire: 0 → the next visitor gets fresh data, never a stale copy.
  revalidateTag(SITE_CONTENT_TAG, { expire: 0 });
  nextRevalidatePath("/[locale]", "layout");
  nextRevalidatePath("/sitemap.xml");
}

/**
 * Drop-in for next/cache's revalidatePath in admin actions that change
 * public content: revalidates the given path and purges the whole public
 * site, because copy, settings and products appear on many pages at once.
 */
export function revalidatePath(...args: Parameters<typeof nextRevalidatePath>) {
  nextRevalidatePath(...args);
  revalidatePublicSite();
}
