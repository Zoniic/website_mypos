import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { CATALOG_KEYS, buildCatalog, type Catalog } from "@/lib/catalog";

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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValid = await verifySessionToken(token);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (await isUnknownFixedSlug(pathname)) {
    const locale = routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ?? routing.defaultLocale;
    return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url), { status: 404 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
