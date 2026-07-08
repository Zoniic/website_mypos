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

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="animate-blob-a absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-primary-500), transparent 70%)" }}
          />
          <div
            className="animate-blob-b absolute -right-32 top-1/3 h-[22rem] w-[22rem] rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-accent-500), transparent 70%)" }}
          />
        </div>
        <FadeIn className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <span className="ticket-tag text-primary-300">{t("hero.eyebrow")}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-text-2">{t("hero.subtitle")}</p>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn x={-24} y={0} className="group overflow-hidden rounded-hero-asset shadow-card">
            <PlaceholderImage
              ratio="4/3"
              label="Factory / team photo"
              src={images["about-team"]}
              className="transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </FadeIn>
          <FadeIn x={24} y={0} delay={0.1}>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("story.title")}
            </h2>
            <p className="mt-4 text-text-2">{t("story.description")}</p>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-border bg-surface-0 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <FadeIn x={-24} y={0} delay={0.1} className="order-2 lg:order-1">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {t("why.title")}
              </h2>
              <p className="mt-4 text-text-2">{t("why.description")}</p>
            </FadeIn>
            <FadeIn
              x={24}
              y={0}
              className="order-1 group overflow-hidden rounded-hero-asset shadow-card lg:order-2"
            >
              <PlaceholderImage
                ratio="4/3"
                label="Product assembly photo"
                src={images["about-assembly"]}
                className="transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </FadeIn>
          </div>

          <FadeIn delay={0.15} className="mt-12">
            <dl className="grid grid-cols-3 gap-6 text-center">
              {stats.map((stat) => (
                <div key={stat.key} className="rounded-card border border-border-subtle bg-surface-1 px-4 py-6 shadow-card">
                  <dd className="bg-[image:var(--gradient-primary)] bg-clip-text text-3xl font-bold text-transparent">
                    <CountUp value={stat.value} />
                  </dd>
                  <dt className="mt-1 text-sm text-text-2">{t(`stats.${stat.key}`)}</dt>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </section>

      <OfficialPartners />

      <section className="relative overflow-hidden bg-surface-2 py-16 text-text-1 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="animate-blob-a absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-primary-500), transparent 70%)" }}
          />
        </div>
        <FadeIn scale={0.96} className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
          <p className="mt-4 text-text-2">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg">
              {t("cta.cta")}
            </Button>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
