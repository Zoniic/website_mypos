import { locales } from "@/i18n/routing";

/**
 * The public URL space under /{locale}, mirrored from src/app/[locale]. Proxy
 * uses it to answer unknown URLs with a real 404 status: a notFound() thrown
 * inside the streamed page can only add noindex to a 200 response.
 * Keep it in step when a page is added or removed under src/app/[locale].
 */
const STATIC_PAGES = new Set([
  "",
  "about",
  "accessories",
  "blog",
  "careers",
  "checkout",
  "compare",
  "contact",
  "industries",
  "knowledge-base",
  "knowledge-base/search",
  "privacy-policy",
  "products",
  "references",
  "search",
  "service",
  "software",
  "terms-of-service",
  "tools/savings-calculator",
]);

const KB_SECTIONS = new Set(["hardware", "software"]);

export type DynamicKind = "product" | "accessory" | "kbArticle" | "blog" | "career" | "reference" | "order";

const DYNAMIC_PREFIXES: [string, DynamicKind][] = [
  ["products", "product"],
  ["accessories", "accessory"],
  ["knowledge-base/article", "kbArticle"],
  ["blog", "blog"],
  ["careers", "career"],
  ["references", "reference"],
  ["order", "order"],
];

export type RouteMatch =
  | { type: "outside" } // no locale prefix, or not a public page path: leave it to next-intl
  | { type: "page" } // a known page with no slug to look up
  | { type: "unknown" }
  | { type: "dynamic"; kind: DynamicKind; slug: string };

/** Classify a request path. Slugs are returned decoded; malformed encoding counts as unknown. */
export function matchPublicRoute(pathname: string): RouteMatch {
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  if (!locale || !(locales as readonly string[]).includes(locale)) return { type: "outside" };

  const rest = segments.slice(1);
  const joined = rest.join("/");
  if (STATIC_PAGES.has(joined)) return { type: "page" };

  // solutions/* and industries/* are checked against the admin catalog elsewhere.
  if (rest.length === 2 && (rest[0] === "solutions" || rest[0] === "industries")) return { type: "page" };
  if (rest.length === 2 && rest[0] === "knowledge-base" && KB_SECTIONS.has(rest[1])) return { type: "page" };

  for (const [prefix, kind] of DYNAMIC_PREFIXES) {
    const parts = prefix.split("/");
    if (rest.length === parts.length + 1 && parts.every((p, i) => rest[i] === p)) {
      try {
        return { type: "dynamic", kind, slug: decodeURIComponent(rest[parts.length]) };
      } catch {
        return { type: "unknown" };
      }
    }
  }

  return { type: "unknown" };
}
