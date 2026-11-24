import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { getAllAccessories } from "@/lib/accessories";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, schemaAvailability } from "@/lib/structuredData";
import { accessoryDisplayPrice } from "@/lib/accessoryPrice";
import { AccessoriesExplorer } from "@/components/accessories/AccessoriesExplorer";
import { getCatalog, publishedCategories } from "@/lib/catalog";


// Reads searchParams (filters / query), so it renders per request; its
// data still comes from the shared cache (lib/siteCache).
export const dynamic = "force-dynamic";

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
  const priced = items
    .map((item) => ({ item, price: accessoryDisplayPrice(item, shopOn) }))
    .filter((entry): entry is { item: (typeof items)[number]; price: number } => entry.price !== null);
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: priced.map(({ item, price }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        description: item.description,
        sku: item.slug,
        url: `${siteConfig.url}/${locale}/accessories/${item.slug}`,
        brand: { "@type": "Brand", name: "MYPOS" },
        ...(item.imageUrl ? { image: absoluteUrl(item.imageUrl) } : {}),
        offers: {
          "@type": "Offer",
          url: `${siteConfig.url}/${locale}/accessories/${item.slug}`,
          priceCurrency: "THB",
          price,
          availability: schemaAvailability(item.stockStatus),
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
            categoryOrder={publishedCategories(await getCatalog())}
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
