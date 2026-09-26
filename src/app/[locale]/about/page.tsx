import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { OfficialPartners } from "@/components/sections/OfficialPartners";
import { CountUp } from "@/components/ui/CountUp";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";
import { PageSections } from "@/components/layout/PageSections";
import { getPageSections } from "@/lib/pageLayout";

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

  const order = await getPageSections("about");

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-sm font-semibold text-primary-600">{t("hero.eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-2">{t("hero.subtitle")}</p>
        </FadeIn>
      </section>

      <PageSections
        order={order}
        blocks={{
          story: (
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <FadeIn>
                  <PlaceholderImage
                    ratio="4/3"
                    label="Factory / team photo"
                    src={images["about-team"]}
                    machine="kiosk"
                    tone="ember"
                    className="!rounded-[22px]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </FadeIn>
                <FadeIn delay={0.08}>
                  <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
                    {t("story.title")}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-text-2">{t("story.description")}</p>
                </FadeIn>
              </div>
            </section>
          ),
          why: (
            <section className="border-y border-border bg-surface-0 py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                  <FadeIn delay={0.08} className="order-2 lg:order-1">
                    <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
                      {t("why.title")}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-text-2">{t("why.description")}</p>
                  </FadeIn>
                  <FadeIn className="order-1 lg:order-2">
                    <PlaceholderImage
                      ratio="4/3"
                      label="Product assembly photo"
                      src={images["about-assembly"]}
                      machine="pos"
                      className="!rounded-[22px]"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </FadeIn>
                </div>

                {stats.some((stat) => stat.value.trim() !== "") && (
                  <dl className="mt-14 grid gap-8 sm:grid-cols-3">
                    {stats
                      .filter((stat) => stat.value.trim() !== "")
                      .map((stat) => (
                        <div key={stat.key} className="border-t-2 border-text-1 pt-4">
                          <dd className="font-display text-4xl font-semibold tracking-tight">
                            <CountUp value={stat.value} />
                          </dd>
                          <dt className="mt-1 text-sm text-text-2">{t(`stats.${stat.key}`)}</dt>
                        </div>
                      ))}
                  </dl>
                )}
              </div>
            </section>
          ),
          partners: (
            <OfficialPartners />
          ),
          cta: (
            <section className="bg-ink text-white">
              <FadeIn className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <h2 className="max-w-3xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                  {t("cta.title")}
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">{t("cta.description")}</p>
                <div className="mt-8">
                  <Button href="/contact?topic=demo" variant="primary" size="lg">
                    {t("cta.cta")}
                  </Button>
                </div>
              </FadeIn>
            </section>
          ),
        }}
      />
    </>
  );
}
