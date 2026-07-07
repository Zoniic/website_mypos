import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const alternates = buildAlternates(locale, "/contact");

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates,
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const settings = await getSiteSettings();
  const images = await getSiteImages();

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    url: `${siteConfig.url}/${locale}/contact`,
    telephone: settings.phone,
    email: settings.email,
    address: tFooter("address"),
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="rounded-2xl border border-emerald-600 bg-emerald-50 p-6">
              <h2 className="text-lg font-semibold">{t("lineTitle")}</h2>
              <p className="mt-2 text-sm text-text-2">{t("lineDescription")}</p>
              <div className="mt-4 flex items-center gap-6">
                <PlaceholderImage
                  ratio="1/1"
                  label="LINE QR code"
                  className="w-32 shrink-0"
                  src={images["line-qr-code"]}
                />
                <Button href={settings.lineUrl} external variant="line">
                  {t("lineCta")}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold">{t("callTitle")}</h2>
                <a
                  href={`tel:${settings.phone}`}
                  className="mt-2 block text-text-2 hover:text-text-1"
                >
                  {settings.phoneDisplay}
                </a>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold">{t("emailTitle")}</h2>
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-2 block text-text-2 hover:text-text-1"
                >
                  {settings.email}
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">{t("mapTitle")}</h2>
              <p className="mt-1 text-sm text-text-2">{tFooter("address")}</p>
              <iframe
                title={t("mapTitle")}
                src={settings.mapEmbedUrl}
                className="mt-3 h-64 w-full rounded-2xl border border-border"
                loading="lazy"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("formTitle")}</h2>
            <div className="mt-4">
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
