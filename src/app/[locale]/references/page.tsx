import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ReferencesExplorer } from "@/components/references/ReferencesExplorer";
import { getAllReferenceCases } from "@/lib/references";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "references" });
  const alternates = buildAlternates(locale, "/references");

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

export default async function ReferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "references" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tProducts = await getTranslations({ locale, namespace: "productsCommon" });

  const cases = await getAllReferenceCases(locale);
  const businessTypeLabels = tProducts.raw("businessTypes") as Record<string, string>;

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
          <ReferencesExplorer
            cases={cases}
            businessTypeLabels={businessTypeLabels}
            filterLabel={t("filterLabel")}
            allLabel={tProducts("allLabel")}
            noResults={t("noResults")}
            clearFilters={t("clearFilters")}
            noPhoto={t("noPhoto")}
            problemLabel={tCommon("problemLabel")}
            installLabel={tCommon("installLabel")}
            resultLabel={tCommon("resultLabel")}
          />
        </div>
      </div>
    </>
  );
}
