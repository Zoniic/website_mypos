import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Button } from "@/components/ui/Button";

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

const stats = [
  { key: "clients", value: "500+" },
  { key: "years", value: "10+" },
  { key: "support", value: "24/7" },
] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 text-lg text-text-2">{t("hero.subtitle")}</p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <PlaceholderImage ratio="4/3" label="Factory / team photo" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("story.title")}</h2>
          <p className="mt-4 text-text-2">{t("story.description")}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="order-2 lg:order-1">
          <h2 className="text-2xl font-bold tracking-tight">{t("why.title")}</h2>
          <p className="mt-4 text-text-2">{t("why.description")}</p>
        </div>
        <div className="order-1 lg:order-2">
          <PlaceholderImage ratio="4/3" label="Product assembly photo" />
        </div>
      </section>

      <section className="border-y border-border bg-surface-0 py-16">
        <dl className="mx-auto grid max-w-7xl grid-cols-3 gap-6 px-4 text-center sm:px-6 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.key}>
              <dd className="text-3xl font-bold">{stat.value}</dd>
              <dt className="mt-1 text-sm text-text-2">{t(`stats.${stat.key}`)}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-surface-2 py-16 text-text-1">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">{t("cta.title")}</h2>
          <p className="mt-4 text-text-2">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact" variant="line" size="lg">
              {t("cta.cta")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
