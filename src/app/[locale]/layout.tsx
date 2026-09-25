import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Anuphan, Chakra_Petch, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileBar } from "@/components/layout/StickyMobileBar";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { TrackingScripts } from "@/components/analytics/TrackingScripts";
import { cleanTrackingId, cleanVerificationToken } from "@/lib/trackingIds";
import { QuoteCartProvider } from "@/lib/quoteCart";
import { ShopCartProvider } from "@/lib/shopCart";
import "../globals.css";

// Body/UI: Anuphan (Cadson Demak) — a loopless humanist Thai that stays
// readable at small sizes and doesn't look like every other Prompt/Kanit
// POS site.
const fontSans = Anuphan({
  variable: "--font-sans-loaded",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Display: Chakra Petch — squared, machined terminals that echo the hardware
// MYPOS builds (and its receipt/price digits). Headings and prices only.
const fontDisplay = Chakra_Petch({
  variable: "--font-display-loaded",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["500"],
});

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

// Content (products, page copy, references, accessories) is admin-editable
// in MySQL at runtime, so every page under this layout must be rendered
// dynamically per-request rather than prerendered at build time.
export const dynamic = "force-dynamic";

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
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
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
        <NextIntlClientProvider>
          <QuoteCartProvider>
            <ShopCartProvider>
            <MotionConfig reducedMotion="user">
              <Header shopOn={isOnlineOrderingOn(settings)} />
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
