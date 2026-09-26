import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { solutionCategory, solutionGroups, solutionMachine, solutionMessageKey, solutionSlugs } from "@/data/solutions";
import type { MachineKind } from "@/components/ui/MachineArt";

/**
 * Product lines (/solutions/<slug>) and business types (/industries/<slug>):
 * the built-in ones from src/data plus those the admin adds in
 * /admin/catalog. Added ones live in SiteSetting ("catalog.solutions",
 * "catalog.businessTypes") and start unpublished — reachable for preview but
 * noindex, and left out of menus, pickers and the sitemap until published.
 */
export const MACHINE_KINDS: readonly MachineKind[] = ["kiosk", "pos", "kds", "scale", "queue", "vending", "ticket"];
export const SOLUTION_GROUPS = solutionGroups.map((g) => g.key);
export const BUSINESS_ICONS = [...BUSINESS_TYPES, "generic"] as const;

export type CatalogSolution = {
  slug: string;
  /** Key of its copy under the `solutions` messages and `nav.solutionsItems`. */
  key: string;
  /** Product category shown in its comparison table. */
  category: string;
  machine: MachineKind;
  /** Header menu group it starts in. */
  group: string;
  builtIn: boolean;
  published: boolean;
};

export type CatalogBusinessType = { slug: string; icon: string; builtIn: boolean; published: boolean };

export type Catalog = {
  solutions: CatalogSolution[];
  businessTypes: CatalogBusinessType[];
  /** Every product category, built-in first. */
  categories: string[];
};

export const SLUG_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** "self-checkout" → "selfCheckout", the convention of the built-in message keys. */
export function slugToKey(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

const groupOfBuiltIn = (slug: string) =>
  solutionGroups.find((g) => g.items.some((i) => i.href === `/solutions/${slug}`))?.key ?? SOLUTION_GROUPS[0];

const BUILT_IN_SOLUTIONS: CatalogSolution[] = solutionSlugs.map((slug) => ({
  slug,
  key: solutionMessageKey[slug],
  category: solutionCategory[slug],
  machine: solutionMachine[slug],
  group: groupOfBuiltIn(slug),
  builtIn: true,
  published: true,
}));

const BUILT_IN_TYPES: CatalogBusinessType[] = BUSINESS_TYPES.map((slug) => ({
  slug,
  icon: slug,
  builtIn: true,
  published: true,
}));

function parseArray(raw: string | undefined): Record<string, unknown>[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null) : [];
  } catch {
    return [];
  }
}

export function parseCustomSolutions(raw: string | undefined): CatalogSolution[] {
  const taken = new Set(BUILT_IN_SOLUTIONS.flatMap((s) => [s.slug, s.key]));
  const out: CatalogSolution[] = [];
  for (const r of parseArray(raw)) {
    const slug = String(r.slug ?? "");
    const key = slugToKey(slug);
    if (!SLUG_PATTERN.test(slug) || taken.has(slug) || taken.has(key)) continue;
    taken.add(slug).add(key);
    const machine = MACHINE_KINDS.includes(r.machine as MachineKind) ? (r.machine as MachineKind) : "kiosk";
    const category = SLUG_PATTERN.test(String(r.category ?? "")) ? String(r.category) : slug;
    const group = SOLUTION_GROUPS.includes(String(r.group) as (typeof SOLUTION_GROUPS)[number]) ? String(r.group) : SOLUTION_GROUPS[0];
    out.push({ slug, key, category, machine, group, builtIn: false, published: r.published === true });
  }
  return out;
}

export function parseCustomBusinessTypes(raw: string | undefined): CatalogBusinessType[] {
  const taken = new Set<string>(BUSINESS_TYPES);
  const out: CatalogBusinessType[] = [];
  for (const r of parseArray(raw)) {
    const slug = String(r.slug ?? "");
    if (!SLUG_PATTERN.test(slug) || taken.has(slug)) continue;
    taken.add(slug);
    const icon = (BUSINESS_ICONS as readonly string[]).includes(String(r.icon)) ? String(r.icon) : "generic";
    out.push({ slug, icon, builtIn: false, published: r.published === true });
  }
  return out;
}

export function buildCatalog(rows: Record<string, string>): Catalog {
  const solutions = [...BUILT_IN_SOLUTIONS, ...parseCustomSolutions(rows["catalog.solutions"])];
  const categories = [...new Set([...PRODUCT_CATEGORIES, ...solutions.map((s) => s.category)])];
  return {
    solutions,
    businessTypes: [...BUILT_IN_TYPES, ...parseCustomBusinessTypes(rows["catalog.businessTypes"])],
    categories,
  };
}

export const CATALOG_KEYS = ["catalog.solutions", "catalog.businessTypes"] as const;

export const getCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...CATALOG_KEYS] } } });
    return buildCatalog(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  },
  ["catalog"],
  { tags: [SITE_CONTENT_TAG], revalidate: SITE_CONTENT_TTL_SECONDS },
);

export const publishedSolutions = (c: Catalog) => c.solutions.filter((s) => s.published);
export const publishedBusinessTypes = (c: Catalog) => c.businessTypes.filter((t) => t.published);
export const findSolution = (c: Catalog, slug: string) => c.solutions.find((s) => s.slug === slug);
export const findBusinessType = (c: Catalog, slug: string) => c.businessTypes.find((t) => t.slug === slug);

/** Categories of published lines (unpublished lines' categories stay out of public filters). */
export function publishedCategories(c: Catalog): string[] {
  const hidden = new Set(c.solutions.filter((s) => !s.published).map((s) => s.category));
  const shown = new Set(publishedSolutions(c).map((s) => s.category));
  return c.categories.filter((cat) => shown.has(cat) || !hidden.has(cat));
}

/** Drawing for a product category (products without a photo). */
export function machineForCategory(c: Catalog, category: string | undefined): MachineKind | undefined {
  return category ? c.solutions.find((s) => s.category === category)?.machine : undefined;
}
