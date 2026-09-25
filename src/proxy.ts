import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { isIndustrySlug } from "@/data/industries";
import { isSolutionSlug } from "@/data/solutions";

const intlMiddleware = createMiddleware(routing);

// These routes have a fixed set of slugs. Rejecting unknown ones here, before
// the page starts streaming, lets us return a real 404 status — a notFound()
// thrown inside the streamed page can only add a noindex tag to a 200.
const fixedSlugRoutes: { pattern: RegExp; isValid: (slug: string) => boolean }[] = [
  { pattern: /^\/(?:[a-z]{2}\/)?industries\/([^/]+)\/?$/, isValid: isIndustrySlug },
  { pattern: /^\/(?:[a-z]{2}\/)?solutions\/([^/]+)\/?$/, isValid: isSolutionSlug },
];

function isUnknownFixedSlug(pathname: string): boolean {
  return fixedSlugRoutes.some(({ pattern, isValid }) => {
    const match = pathname.match(pattern);
    return match !== null && !isValid(decodeURIComponent(match[1]));
  });
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

  if (isUnknownFixedSlug(pathname)) {
    const locale = routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ?? routing.defaultLocale;
    return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url), { status: 404 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
