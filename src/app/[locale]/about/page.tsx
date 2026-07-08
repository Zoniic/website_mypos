import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Button } from "@/components/ui/Button";
import { OfficialPartners } from "@/components/sections/OfficialPartners";
import { CountUp } from "@/components/ui/CountUp";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const alternates = buildAlternates(locale, "/about");

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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const images = await getSiteImages();
  const settings = await getSiteSettings();

  const stats = [
    { key: "clients", value: settings.statsClients },
    { key: "years", value: settings.statsYears },
    { key: "support", value: settings.statsSupport },
  ] as const;

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <section className="bg-ink py-16 text-text-1">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <span className="ticket-tag text-text-2">{t("hero.eyebrow")}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-text-2">{t("hero.subtitle")}</p>
          <div aria-hidden className="mx-auto mt-8 flex justify-center text-text-2">
            <span className="barcode-bars" />
          </div>
        </div>
      </section>

      <section className="bg-ink border-t border-border-subtle">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <PlaceholderImage ratio="4/3" label="Factory / team photo" src={images["about-team"]} />
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-1">
              {t("story.title")}
            </h2>
            <p className="mt-4 text-text-2">{t("story.description")}</p>
          </div>
        </div>
      </section>

      <div aria-hidden className="receipt-rule text-border-strong" />

      <section className="bg-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-2xl font-bold tracking-tight text-paper-text-1">
              {t("why.title")}
            </h2>
            <p className="mt-4 text-paper-text-2">{t("why.description")}</p>
          </div>
          <div className="order-1 lg:order-2">
            <PlaceholderImage
              ratio="4/3"
              label="Product assembly photo"
              src={images["about-assembly"]}
            />
          </div>
        </div>
      </section>

      <section className="bg-paper pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-paper-2 px-6 py-5 shadow-sm">
            <p className="ticket-tag text-paper-text-2">{t("hero.eyebrow")}</p>
            <dl className="mt-4 divide-y divide-paper-text-2/15">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <dt className="text-sm text-paper-text-2">{t(`stats.${stat.key}`)}</dt>
                  <dd className="font-mono text-2xl font-semibold tabular-nums text-paper-text-1">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div aria-hidden className="receipt-rule text-paper-text-2" />

      <div className="bg-ink">
        <OfficialPartners />
      </div>

      <div aria-hidden className="receipt-rule text-border-strong" />

      <section className="bg-ink py-16 text-text-1">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight">{t("cta.title")}</h2>
          <p className="mt-4 text-text-2">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg">
              {t("cta.cta")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
