import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { CATALOG_KEYS, buildCatalog, type Catalog } from "@/lib/catalog";
import { decodeSlugParam, slugKey } from "@/lib/slug";
import { HIDDEN_PRODUCTS_KEY, parseHiddenSlugs } from "@/lib/hiddenProducts";
import { matchPublicRoute } from "@/lib/routeMap";
import { tokenMatches } from "@/lib/orders";

const intlMiddleware = createMiddleware(routing);

// These routes have a known set of slugs. Rejecting unknown ones here, before
// the page starts streaming, lets us return a real 404 status — a notFound()
// thrown inside the streamed page can only add a noindex tag to a 200.
// The slugs include lines/types added in the admin catalog, so they're read
// from the DB (Proxy runs on Node.js) and kept for 30 s per server instance.
const fixedSlugRoutes: { pattern: RegExp; isValid: (catalog: Catalog, slug: string) => boolean }[] = [
  { pattern: /^\/(?:[a-z]{2}\/)?industries\/([^/]+)\/?$/, isValid: (c, slug) => c.businessTypes.some((t) => t.slug === slug) },
  { pattern: /^\/(?:[a-z]{2}\/)?solutions\/([^/]+)\/?$/, isValid: (c, slug) => c.solutions.some((s) => s.slug === slug) },
];

let catalogCache: { catalog: Catalog; at: number } | null = null;

async function loadCatalog(): Promise<Catalog> {
  if (catalogCache && Date.now() - catalogCache.at < 30_000) return catalogCache.catalog;
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...CATALOG_KEYS] } } });
    const catalog = buildCatalog(Object.fromEntries(rows.map((r) => [r.key, r.value])));
    catalogCache = { catalog, at: Date.now() };
    return catalog;
  } catch {
    // DB unreachable: fall back to the built-in lists rather than 404 real pages.
    return catalogCache?.catalog ?? buildCatalog({});
  }
}

async function isUnknownFixedSlug(pathname: string): Promise<boolean> {
  const route = fixedSlugRoutes.find(({ pattern }) => pattern.test(pathname));
  if (!route) return false;
  const slug = decodeURIComponent(pathname.match(route.pattern)![1]);
  return !route.isValid(await loadCatalog(), slug);
}

// Old product / KB article URLs ("/th/products/mypos-K1", "/th/products/mypos-k1",
// "/th/knowledge-base/article/Change%20paper%20K1") redirect permanently to the
// stored slug, so links shared before the slugs were made lowercase keep working.
// A slug matches when it differs only in case, spacing, punctuation or encoding.
const legacySlugRoutes: { pattern: RegExp; load: () => Promise<string[]> }[] = [
  { pattern: /^(\/(?:[a-z]{2}\/)?products\/)([^/]+)\/?$/, load: loadProductSlugs },
  { pattern: /^(\/(?:[a-z]{2}\/)?accessories\/)([^/]+)\/?$/, load: loadAccessorySlugs },
  { pattern: /^(\/(?:[a-z]{2}\/)?knowledge-base\/article\/)([^/]+)\/?$/, load: loadKbArticleSlugs },
];

const slugListCache = new Map<string, { slugs: string[]; at: number }>();

async function cachedSlugs(name: string, load: () => Promise<string[]>): Promise<string[]> {
  const hit = slugListCache.get(name);
  if (hit && Date.now() - hit.at < 30_000) return hit.slugs;
  try {
    const slugs = await load();
    slugListCache.set(name, { slugs, at: Date.now() });
    return slugs;
  } catch {
    // DB unreachable: serve the page as requested rather than redirect wrongly.
    return hit?.slugs ?? [];
  }
}

async function loadProductSlugs(): Promise<string[]> {
  const [rows, hidden] = await Promise.all([
    prisma.product.findMany({ select: { slug: true } }),
    prisma.siteSetting.findUnique({ where: { key: HIDDEN_PRODUCTS_KEY } }),
  ]);
  const hiddenSlugs = parseHiddenSlugs(hidden?.value);
  return rows.map((r) => r.slug).filter((s) => !hiddenSlugs.includes(s));
}

async function loadAccessorySlugs(): Promise<string[]> {
  return (await prisma.accessory.findMany({ select: { slug: true } })).map((r) => r.slug);
}

async function loadKbArticleSlugs(): Promise<string[]> {
  return (await prisma.kbArticle.findMany({ select: { slug: true } })).map((r) => r.slug);
}

/** The redirect target for an old-style slug URL, or null when the URL is already right (or unknown). */
async function legacySlugRedirect(request: NextRequest): Promise<URL | null> {
  const { pathname } = request.nextUrl;
  for (const { pattern, load } of legacySlugRoutes) {
    const match = pathname.match(pattern);
    if (!match) continue;
    const requested = decodeSlugParam(match[2]);
    const slugs = await cachedSlugs(match[1], load);
    if (slugs.includes(requested)) return null;
    const key = slugKey(requested);
    const target = key ? slugs.find((s) => slugKey(s) === key) : undefined;
    if (!target) return null;
    const url = request.nextUrl.clone();
    url.pathname = match[1] + encodeURIComponent(target);
    return url;
  }
  return null;
}

/** Does a page exist for this slug? Pages accept old-style slugs that differ only in case/spacing. */
function hasSlug(slugs: string[], requested: string): boolean {
  const key = slugKey(requested);
  return slugs.includes(requested) || (key !== "" && slugs.some((s) => slugKey(s) === key));
}

/** True when the URL is a known page shape but names a record that does not exist (or an unknown path). */
async function isMissingPage(request: NextRequest): Promise<boolean> {
  const match = matchPublicRoute(request.nextUrl.pathname);
  if (match.type === "outside" || match.type === "page") return false;
  if (match.type === "unknown") return true;

  try {
    switch (match.kind) {
      case "product":
      case "accessory":
      case "kbArticle": {
        const [name, load] =
          match.kind === "product"
            ? ["/products/", loadProductSlugs]
            : match.kind === "accessory"
              ? ["/accessories/", loadAccessorySlugs]
              : ["/knowledge-base/article/", loadKbArticleSlugs];
        if (hasSlug(await cachedSlugs(name, load), match.slug)) return false;
        // Not in the 30 s cache: it may have just been created, so ask the DB once.
        return !hasSlug(await load(), match.slug);
      }
      case "blog":
        return !(await prisma.blogPost.findUnique({ where: { slug: match.slug }, select: { id: true } }));
      case "career":
        return !(await prisma.jobPosting.findUnique({ where: { slug: match.slug }, select: { id: true } }));
      case "reference":
        return !(await prisma.referenceCase.findUnique({ where: { slug: match.slug }, select: { id: true } }));
      case "order": {
        const order = await prisma.order.findUnique({ where: { number: match.slug }, select: { accessToken: true } });
        // Same answer for "no such order" and "wrong link", as the page itself gives.
        return !order || !tokenMatches(order.accessToken, request.nextUrl.searchParams.get("t") ?? undefined);
      }
    }
  } catch {
    // DB unreachable: let the page render rather than 404 real URLs.
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValid = await verifySessionToken(token);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const legacyTarget = await legacySlugRedirect(request);
  if (legacyTarget) return NextResponse.redirect(legacyTarget, 308);

  if ((await isUnknownFixedSlug(pathname)) || (await isMissingPage(request))) {
    const locale = routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ?? routing.defaultLocale;
    return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url), { status: 404 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
