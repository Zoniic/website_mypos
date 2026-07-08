import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { getAllAccessories } from "@/lib/accessories";
import { AccessoriesExplorer } from "@/components/accessories/AccessoriesExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessories" });
  const alternates = buildAlternates(locale, "/accessories");

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

export default async function AccessoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "accessories" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tProducts = await getTranslations({ locale, namespace: "productsCommon" });
  const items = await getAllAccessories(locale);

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>

        <div className="mt-8">
          <AccessoriesExplorer
            items={items}
            initialCategory={category ?? ""}
            filterLabel={tProducts("filterCategory")}
            allLabel={tProducts("allLabel")}
            noResults={tProducts("noResults")}
          />
        </div>

        <div className="mt-10">
          <Button href="/contact" variant="primary">
            {t("cta")}
          </Button>
        </div>
      </div>
    </>
  );
}
