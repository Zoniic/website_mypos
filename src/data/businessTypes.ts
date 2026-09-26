/**
 * The closed list of business types (industry landing pages, product and
 * case-study tags). Shared by the BusinessType type, admin checkboxes,
 * industry pages and prisma/seed-categories.ts — add a type here, re-run
 * that seed, and give it copy under `industries.<type>` and
 * `productsCommon.businessTypes.<type>`.
 */
export const BUSINESS_TYPES = [
  "restaurant",
  "cafeteria",
  "buffet",
  "bakery",
  "retail",
  "convenience",
  "hotel",
  "themepark",
  "manufacturing",
  "office",
  "school",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
