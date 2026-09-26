import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getCatalog, publishedBusinessTypes } from "@/lib/catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BusinessTypeIcon } from "@/components/ui/BusinessTypeIcon";
import { Invite } from "@/components/sections/Invite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "industries.index" });
  const alternates = buildAlternates(locale, "/industries");

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

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "industries" });
  const tProducts = await getTranslations({ locale, namespace: "productsCommon" });
  const tSolutionsCommon = await getTranslations({ locale, namespace: "solutionsCommon" });

  const items = publishedBusinessTypes(await getCatalog()).map(({ slug: type, icon }) => ({
    type,
    icon,
    label: tProducts(`businessTypes.${type}`),
    title: t(`${type}.hero.title`),
  }));

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      url: `${siteConfig.url}/${locale}/industries/${item.type}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <Breadcrumb
        items={[
          { label: tSolutionsCommon("breadcrumbHome"), href: "/" },
          { label: t("common.breadcrumb") },
        ]}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeader
          title={t("index.title")}
          as="h1"
          lede={t("index.lede")}
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <FadeIn key={item.type} delay={(index % 3) * 0.06}>
              <Link
                href={`/industries/${item.type}`}
                className="group flex h-full flex-col rounded-card border border-border bg-surface-1/40 p-6 outline-offset-2 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <BusinessTypeIcon type={item.icon} size={20} />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{item.label}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-2">{item.title}</p>
                <span
                  aria-hidden
                  className="mt-4 text-primary-600 transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
      <Invite />
    </>
  );
}
