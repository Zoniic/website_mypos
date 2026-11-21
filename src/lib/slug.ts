/**
 * Slug helpers shared by the pages, the proxy, the admin and the data scripts.
 *
 * A URL-safe slug is lowercase a-z, 0-9 and single hyphens ("mypos-k1").
 * Older content has slugs with capitals, spaces and parentheses; those keep
 * working through `slugKey` (see src/proxy.ts and the lookups in lib/*.ts).
 */

export const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isSafeSlug = (slug: string): boolean => SAFE_SLUG.test(slug);

/** Percent-decodes a route param. Next.js hands dynamic params over still encoded. */
export function decodeSlugParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** "mypos-FM-EA-SLIM-22-(Desktop)" -> "mypos-fm-ea-slim-22-desktop". Empty string if nothing usable is left. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Case-, space- and encoding-insensitive identity of a slug. Two slugs with
 * the same key are the same page, so an old link maps to the new slug.
 */
export const slugKey = (raw: string): string => slugify(decodeSlugParam(raw));
