import type { BusinessType } from "@/lib/products";
import type { SolutionSlug } from "@/data/solutions";

/**
 * One landing page per business type (/industries/<slug>). Slugs match the
 * BusinessType lookup table, so products and case studies tagged with a type
 * in the admin show up on its page automatically.
 */
export const industrySlugs = [
  "restaurant",
  "cafeteria",
  "buffet",
  "bakery",
  "retail",
  "convenience",
  "hotel",
  "themepark",
  "manufacturing",
] as const satisfies readonly BusinessType[];

export type IndustrySlug = (typeof industrySlugs)[number];

/** Solutions recommended on each industry page, most relevant first. */
export const industrySolutions: Record<IndustrySlug, SolutionSlug[]> = {
  restaurant: ["self-order", "pos", "kds", "queue-display"],
  cafeteria: ["self-order", "weigh-pay", "queue-display", "pos"],
  buffet: ["weigh-pay", "self-order", "pos"],
  bakery: ["weigh-pay", "pos"],
  retail: ["pos", "vending-online"],
  convenience: ["pos", "vending-online"],
  hotel: ["vending-online", "ticketing", "self-order", "pos"],
  themepark: ["ticketing", "vending-online", "pos"],
  manufacturing: ["vending-online", "self-order", "pos"],
};

export function isIndustrySlug(value: string): value is IndustrySlug {
  return (industrySlugs as readonly string[]).includes(value);
}
