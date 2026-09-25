import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Invite } from "@/components/sections/Invite";
import { getSiteImages } from "@/lib/siteSettings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "software" });
  const alternates = buildAlternates(locale, "/software");

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

type FeatureItem = { title: string; description: string };

export default async function SoftwarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "software" });
  const features = t.raw("features.items") as FeatureItem[];
  const images = await getSiteImages();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${siteConfig.name} Software`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Android, Windows",
    url: `${siteConfig.url}/${locale}/software`,
  };

  return (
    <>
      <JsonLd data={softwareSchema} />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold text-primary-600">{t("hero.eyebrow")}</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-text-2">{t("hero.subtitle")}</p>
          <div className="mt-8">
            <Button href="/contact" variant="primary" size="lg">
              {t("hero.cta")}
            </Button>
          </div>
        </div>
        <PlaceholderImage
          ratio="4/3"
          label="Software UI photo"
          src={images["software-hero"]}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </section>

      <section className="border-y border-border bg-surface-0 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("features.title")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-card border border-border bg-surface-1/40 p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-text-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("screenshots.title")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderImage
            ratio="4/3"
            label="Dashboard screenshot"
            src={images["software-screenshot-dashboard"]}
          />
          <PlaceholderImage
            ratio="4/3"
            label="Menu management screenshot"
            src={images["software-screenshot-menu"]}
          />
          <PlaceholderImage
            ratio="4/3"
            label="Sales report screenshot"
            src={images["software-screenshot-sales"]}
          />
        </div>
      </section>

      <Invite />
    </>
  );
}
