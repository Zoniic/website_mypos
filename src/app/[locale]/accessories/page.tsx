import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { getAllAccessories } from "@/lib/accessories";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/structuredData";
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
  const settings = await getSiteSettings();
  const shopOn = isOnlineOrderingOn(settings);

  // Priced accessories as Products with offers, so they can show price in search.
  const pageUrl = `${siteConfig.url}/${locale}/accessories`;
  const priced = items.filter((item) => shopOn && item.onlinePrice !== undefined);
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: priced.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        description: item.description,
        sku: item.slug,
        brand: { "@type": "Brand", name: "MYPOS" },
        ...(item.imageUrl ? { image: absoluteUrl(item.imageUrl) } : {}),
        offers: {
          "@type": "Offer",
          url: pageUrl,
          priceCurrency: "THB",
          price: item.onlinePrice,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
    })),
  };

  return (
    <>
      {priced.length > 0 && <JsonLd data={itemListSchema} />}
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
            shopOn={shopOn}
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
