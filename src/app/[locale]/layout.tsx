import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Prompt, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/siteSettings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileBar } from "@/components/layout/StickyMobileBar";
import { CookieConsent } from "@/components/layout/CookieConsent";
import "../globals.css";

const fontSans = Prompt({
  variable: "--font-sans-loaded",
  subsets: ["thai", "latin"],
  // Only the weights actually used in the UI (font-medium/semibold/bold + default 400).
  weight: ["400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: "MYPOS self-service and POS systems",
};

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
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-text-1">
        <NextIntlClientProvider>
          <MotionConfig reducedMotion="user">
            <Header />
            <main id="main-content" className="flex-1 pb-16 lg:pb-0">
              {children}
            </main>
            <Footer />
            <StickyMobileBar phone={settings.phone} lineUrl={settings.lineUrl} />
            <CookieConsent />
          </MotionConfig>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
