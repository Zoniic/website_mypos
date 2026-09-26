import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { industrySlugs, industrySolutions as defaultIndustrySolutions, type IndustrySlug } from "@/data/industries";
import { defaultFooterGroups, defaultResourceLinks } from "@/data/navigation";
import { ONLINE_SOLUTIONS, isSolutionSlug, solutionGroups, type SolutionSlug } from "@/data/solutions";

/**
 * Admin-editable site structure: menus, the solutions recommended on each
 * industry page and which lines show the back-office band. Stored as JSON in
 * SiteSetting rows; anything missing or invalid falls back to the code
 * defaults, and items added in code later are merged in automatically.
 */
export const LOCALES = ["th", "en", "zh"] as const;
export type NavLabel = Partial<Record<(typeof LOCALES)[number], string>>;
export type NavItem = { key: string; href: string; hidden?: boolean; label?: NavLabel };
export type NavGroup = { key: string; items: NavItem[] };

export const MENU_KEYS = ["nav.solutions", "nav.categories", "nav.industries", "nav.resources", "nav.footer"] as const;
export type MenuKey = (typeof MENU_KEYS)[number];

const single = (items: NavItem[]): NavGroup[] => [{ key: "main", items }];

export const MENU_DEFAULTS: Record<MenuKey, NavGroup[]> = {
  "nav.solutions": solutionGroups.map((g) => ({ key: g.key, items: g.items.map((i) => ({ ...i })) })),
  "nav.categories": single(PRODUCT_CATEGORIES.map((c) => ({ key: c, href: c }))),
  "nav.industries": single(industrySlugs.map((s) => ({ key: s, href: `/industries/${s}` }))),
  "nav.resources": single(defaultResourceLinks.map((l) => ({ ...l }))),
  "nav.footer": defaultFooterGroups.map((g) => ({ key: g.key, items: g.items.map((i) => ({ ...i })) })),
};

/** Menus whose items are a fixed catalogue (the admin can hide/reorder but not add). */
export const MENU_ALLOWS_CUSTOM: Record<MenuKey, boolean> = {
  "nav.solutions": true,
  "nav.categories": false,
  "nav.industries": false,
  "nav.resources": true,
  "nav.footer": true,
};

export const CUSTOM_PREFIX = "custom-";

export function isValidHref(href: string): boolean {
  return /^\/[^\s]*$/.test(href) || /^https:\/\/\S+$/.test(href);
}

function cleanLabel(value: unknown): NavLabel | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const out: NavLabel = {};
  for (const l of LOCALES) {
    const v = (value as Record<string, unknown>)[l];
    if (typeof v === "string" && v.trim()) out[l] = v.trim().slice(0, 80);
  }
  return out.th || out.en || out.zh ? out : undefined;
}

/** Stored menu merged with the defaults. Built-in links keep their code href. */
export function resolveMenu(menu: MenuKey, stored: unknown): NavGroup[] {
  const defaults = MENU_DEFAULTS[menu];
  const builtIn = new Map<string, { href: string; group: string }>();
  for (const g of defaults) for (const i of g.items) builtIn.set(i.key, { href: i.href, group: g.key });
  const groupKeys = defaults.map((g) => g.key);

  const groups = new Map<string, NavItem[]>();
  const seen = new Set<string>();
  if (Array.isArray(stored)) {
    for (const g of stored) {
      if (typeof g !== "object" || g === null) continue;
      const key = String((g as { key?: unknown }).key ?? "");
      if (!groupKeys.includes(key) || groups.has(key)) continue;
      const items: NavItem[] = [];
      const rawItems = (g as { items?: unknown }).items;
      for (const raw of Array.isArray(rawItems) ? rawItems : []) {
        if (typeof raw !== "object" || raw === null) continue;
        const r = raw as Record<string, unknown>;
        const itemKey = String(r.key ?? "");
        if (!itemKey || seen.has(itemKey)) continue;
        const hidden = r.hidden === true;
        const known = builtIn.get(itemKey);
        if (known) {
          items.push({ key: itemKey, href: known.href, ...(hidden && { hidden }) });
        } else if (MENU_ALLOWS_CUSTOM[menu] && itemKey.startsWith(CUSTOM_PREFIX)) {
          const href = String(r.href ?? "").trim();
          const label = cleanLabel(r.label);
          if (!isValidHref(href) || !label) continue;
          items.push({ key: itemKey, href, label, ...(hidden && { hidden }) });
        } else continue;
        seen.add(itemKey);
      }
      groups.set(key, items);
    }
  }
  for (const key of groupKeys) if (!groups.has(key)) groups.set(key, []);
  // Links added in code after the admin saved: append to their default group.
  for (const [key, { href, group }] of builtIn) if (!seen.has(key)) groups.get(group)!.push({ key, href });

  const order = [...groups.keys()];
  return order.map((key) => ({ key, items: groups.get(key)! }));
}

export function resolveIndustrySolutions(stored: unknown): Record<IndustrySlug, SolutionSlug[]> {
  const out = { ...defaultIndustrySolutions };
  if (typeof stored !== "object" || stored === null) return out;
  for (const type of industrySlugs) {
    const list = (stored as Record<string, unknown>)[type];
    if (!Array.isArray(list)) continue;
    out[type] = [...new Set(list.map(String).filter(isSolutionSlug))];
  }
  return out;
}

export function resolveOnlineSolutions(stored: unknown): SolutionSlug[] {
  if (!Array.isArray(stored)) return [...ONLINE_SOLUTIONS];
  return [...new Set(stored.map(String).filter(isSolutionSlug))];
}

export const STRUCTURE_KEYS = [...MENU_KEYS, "map.industrySolutions", "map.onlineSolutions"] as const;
export type StructureKey = (typeof STRUCTURE_KEYS)[number];

export type SiteStructure = {
  menus: Record<MenuKey, NavGroup[]>;
  industrySolutions: Record<IndustrySlug, SolutionSlug[]>;
  onlineSolutions: SolutionSlug[];
};

function parse(raw: string | undefined): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function buildStructure(rows: Record<string, string>): SiteStructure {
  return {
    menus: Object.fromEntries(MENU_KEYS.map((k) => [k, resolveMenu(k, parse(rows[k]))])) as Record<MenuKey, NavGroup[]>,
    industrySolutions: resolveIndustrySolutions(parse(rows["map.industrySolutions"])),
    onlineSolutions: resolveOnlineSolutions(parse(rows["map.onlineSolutions"])),
  };
}

export const getSiteStructure = unstable_cache(
  async (): Promise<SiteStructure> => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...STRUCTURE_KEYS] } } });
    return buildStructure(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  },
  ["site-structure"],
  { tags: [SITE_CONTENT_TAG], revalidate: SITE_CONTENT_TTL_SECONDS },
);

/** Drops hidden links and groups left empty. */
export function visibleMenu(groups: NavGroup[]): NavGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.hidden) }))
    .filter((g) => g.items.length > 0);
}

/** A custom link's label in the visitor's language (Thai as the fallback). */
export function customLabel(item: NavItem, locale: string): string | undefined {
  if (!item.label) return undefined;
  return item.label[locale as keyof NavLabel] || item.label.th || item.label.en || item.label.zh;
}
