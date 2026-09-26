import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Anuphan, Chakra_Petch } from "next/font/google";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { getLogoUrl, getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileBar } from "@/components/layout/StickyMobileBar";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { TrackingScripts } from "@/components/analytics/TrackingScripts";
import { CONSENT_KEY } from "@/lib/analytics";
import { cleanTrackingId, cleanVerificationToken } from "@/lib/trackingIds";
import { QuoteCartProvider } from "@/lib/quoteCart";
import { ShopCartProvider } from "@/lib/shopCart";
import { getHeaderNav } from "@/lib/navView";
import "../globals.css";

// Body/UI: Anuphan (Cadson Demak) — a loopless humanist Thai that stays
// readable at small sizes and doesn't look like every other Prompt/Kanit
// POS site.
const fontSans = Anuphan({
  variable: "--font-sans-loaded",
  subsets: ["thai", "latin"],
  // Variable font: one file per subset covers every weight (was 4 weights ×
  // 2 subsets = 8 files). Body text is the LCP element on most pages, and it
  // repaints when this font arrives, so fewer files = earlier LCP.
  weight: "variable",
});

// Display: Chakra Petch — squared, machined terminals that echo the hardware
// MYPOS builds (and its receipt/price digits). Headings and prices only.
const fontDisplay = Chakra_Petch({
  variable: "--font-display-loaded",
  subsets: ["thai", "latin"],
  // Headings use 600/700 only; every extra weight is two more preloaded
  // files competing with the page on slow mobile connections.
  weight: ["600", "700"],
});



// Empty list = render each page on its first visit, then serve it from
// the cache (ISR). Without this export the route renders on every request.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const google = cleanVerificationToken(settings.googleSiteVerification);
  const bing = cleanVerificationToken(settings.bingSiteVerification);
  const facebook = cleanVerificationToken(settings.facebookDomainVerification);
  const other: Record<string, string> = {};
  if (bing) other["msvalidate.01"] = bing;
  if (facebook) other["facebook-domain-verification"] = facebook;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: "MYPOS self-service and POS systems",
    verification: { google: google || undefined, other },
  };
}

// Pages are cached (ISR) and refreshed in the background at most every 5
// minutes; admin saves purge them immediately (lib/siteCache). Pages that
// read searchParams (product filters, search, order status) stay dynamic.
export const revalidate = 300;

/**
 * Namespaces used by client components ("use client" + useTranslations).
 * Only these are sent to the browser — shipping every namespace made each
 * page carry the whole site's copy in its HTML. Add a namespace here when a
 * client component starts using it (a missing one logs MISSING_MESSAGE).
 */
const CLIENT_NAMESPACES = [
  "checkout",
  "common",
  "compare",
  "contact",
  "cookieConsent",
  "nav",
  "productsCommon",
  "savingsCalculator",
  "shop",
  "stickyBar",
] as const;

function pickClientMessages(messages: Record<string, unknown>) {
  const picked: Record<string, unknown> = {};
  for (const ns of CLIENT_NAMESPACES) if (ns in messages) picked[ns] = messages[ns];
  // Sub-trees used by client components inside larger namespaces.
  const home = messages.home as Record<string, unknown> | undefined;
  if (home?.faq) picked.home = { faq: home.faq };
  const industries = messages.industries as Record<string, unknown> | undefined;
  if (industries?.common) picked.industries = { common: industries.common };
  return picked;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const settings = await getSiteSettings();

  return (
    <html
      lang={locale}
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
      // The consent script below sets data-consent before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: returning visitors who already chose never
            see the server-rendered cookie banner (CookieConsent.tsx). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}))document.documentElement.dataset.consent="1"}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text-1">
        <TrackingScripts
          ids={{
            // NEXT_PUBLIC_GA_ID stays as a fallback for deployments that set GA in env.
            ga4Id: cleanTrackingId("ga4Id", settings.ga4Id || process.env.NEXT_PUBLIC_GA_ID),
            gtmId: cleanTrackingId("gtmId", settings.gtmId),
            metaPixelId: cleanTrackingId("metaPixelId", settings.metaPixelId),
            tiktokPixelId: cleanTrackingId("tiktokPixelId", settings.tiktokPixelId),
            lineTagId: cleanTrackingId("lineTagId", settings.lineTagId),
            googleAdsId: cleanTrackingId("googleAdsId", settings.googleAdsId),
            googleAdsLeadLabel: cleanTrackingId("googleAdsLeadLabel", settings.googleAdsLeadLabel),
            googleAdsPurchaseLabel: cleanTrackingId("googleAdsPurchaseLabel", settings.googleAdsPurchaseLabel),
          }}
        />
        <NextIntlClientProvider messages={pickClientMessages((await getMessages()) as Record<string, unknown>)}>
          <QuoteCartProvider>
            <ShopCartProvider>
            <MotionConfig reducedMotion="user">
              <Header shopOn={isOnlineOrderingOn(settings)} nav={await getHeaderNav(locale)} logoUrl={await getLogoUrl()} />
              <main id="main-content" className="flex-1 pb-16 lg:pb-0">
                {children}
              </main>
              <Footer />
              <StickyMobileBar phone={settings.phone} lineUrl={settings.lineUrl} />
              <CookieConsent />
            </MotionConfig>
            </ShopCartProvider>
          </QuoteCartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
