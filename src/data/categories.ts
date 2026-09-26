/**
 * The closed list of product categories (one per hardware line). Shared by
 * the ProductCategory type, the admin category checkboxes and
 * prisma/seed-categories.ts — add a line here, then re-run that seed.
 */
export const PRODUCT_CATEGORIES = [
  "self-order",
  "pos",
  "kds",
  "weigh-pay",
  "queue-display",
  "vending-online",
  "vending-offline",
  "ticketing",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
