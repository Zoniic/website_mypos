import type { Metadata } from "next";
import { Suspense } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { PHONE_LABEL_FALLBACK, PHONE_LABEL_KEY, googleMapsOpenUrl, isGoogleMapsEmbedUrl } from "@/lib/siteDisplay";
import { companyInfo, getSiteImages, getSiteSettings, type CompanyPhone } from "@/lib/siteSettings";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";

// Site copy is read from the database; until the "mapOpen" row exists there (messages/*.json is only the seed), use this label.
const MAP_OPEN_FALLBACK: Record<string, string> = {
  th: "เปิดใน Google Maps",
  en: "Open in Google Maps",
  zh: "在 Google 地图中打开",
};

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
  const company = companyInfo(settings, locale, tFooter("address"));
  const phoneLabel = (kind: CompanyPhone["kind"]) => {
    const key = PHONE_LABEL_KEY[kind];
    return tFooter.has(key) ? tFooter(key) : (PHONE_LABEL_FALLBACK[kind][locale] ?? PHONE_LABEL_FALLBACK[kind].en);
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    legalName: company.legalName || undefined,
    url: `${siteConfig.url}/${locale}/contact`,
    telephone: company.phone || undefined,
    email: company.email || undefined,
    address: company.address || undefined,
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
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="rounded-card border border-emerald-600/30 bg-emerald-50 p-6">
              <h2 className="text-lg font-semibold text-text-1">{t("lineTitle")}</h2>
              <p className="mt-2 text-sm text-text-2">{t("lineDescription")}</p>
              <div className="mt-4 flex items-center gap-6">
                <PlaceholderImage
                  ratio="1/1"
                  label="LINE QR code"
                  className="w-32 shrink-0"
                  src={images["line-qr-code"]}
                  slot="line-qr-code"
                  sizes="128px"
                />
                {settings.lineUrl && (
                  <Button href={settings.lineUrl} external variant="line">
                    {t("lineCta")}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {company.phones.length > 0 && (
                <div className="rounded-card border border-border p-6">
                  <h2 className="text-lg font-semibold">{t("callTitle")}</h2>
                  <ul className="mt-2 space-y-1">
                    {company.phones.map((phone) => (
                      <li key={phone.kind}>
                        {/* Labels only when both numbers are shown. */}
                        {company.phones.length > 1 && (
                          <span className="block text-sm font-medium text-text-1">{phoneLabel(phone.kind)}</span>
                        )}
                        <a
                          href={`tel:${phone.tel}`}
                          className="rounded-sm text-text-2 outline-offset-2 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                        >
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {company.email && (
                <div className="rounded-card border border-border p-6">
                  <h2 className="text-lg font-semibold">{t("emailTitle")}</h2>
                  <a
                    href={`mailto:${company.email}`}
                    className="mt-2 block rounded-sm text-text-2 outline-offset-2 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                  >
                    {company.email}
                  </a>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold">{t("mapTitle")}</h2>
              {company.legalName && <p className="mt-1 text-sm font-medium text-text-1">{company.legalName}</p>}
              <p className="mt-1 text-sm text-text-2">{company.address}</p>
              {isGoogleMapsEmbedUrl(settings.mapEmbedUrl) ? (
                <iframe
                  title={t("mapTitle")}
                  src={settings.mapEmbedUrl.trim()}
                  className="mt-3 h-64 w-full rounded-card border border-border"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="mt-3 flex items-center gap-3 rounded-card border border-border bg-surface-1 p-4">
                  <MapPin className="size-5 shrink-0 text-primary-600" aria-hidden="true" />
                  <div>
                    <Button
                      href={googleMapsOpenUrl(settings.mapEmbedUrl, company.address)}
                      external
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink className="size-4" aria-hidden="true" />}
                    >
                      {t.has("mapOpen") ? t("mapOpen") : MAP_OPEN_FALLBACK[locale] ?? MAP_OPEN_FALLBACK.en}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-card border border-border p-6">
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
