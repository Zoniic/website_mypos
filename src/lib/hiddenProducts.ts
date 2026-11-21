import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";

/**
 * Products hidden from the public site without deleting them: the slugs are
 * listed (comma-separated) in the SiteSetting row with this key. The schema
 * has no publish flag on Product.
 *
 * Show a product again: `npx tsx prisma/hide-test-product.ts --restore --write`
 * or edit/delete the SiteSetting row.
 */
export const HIDDEN_PRODUCTS_KEY = "hiddenProductSlugs";

export const parseHiddenSlugs = (value: string | null | undefined): string[] =>
  (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);

/** Cached with the other shared site data; purged by admin saves. */
export const getHiddenProductSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const row = await prisma.siteSetting.findUnique({ where: { key: HIDDEN_PRODUCTS_KEY } });
    return parseHiddenSlugs(row?.value);
  },
  ["hidden-product-slugs"],
  { tags: [SITE_CONTENT_TAG], revalidate: SITE_CONTENT_TTL_SECONDS }
);

/** Drops hidden products from a list. */
export async function withoutHidden<T extends { slug: string }>(items: T[]): Promise<T[]> {
  const hidden = await getHiddenProductSlugs();
  return hidden.length === 0 ? items : items.filter((item) => !hidden.includes(item.slug));
}
