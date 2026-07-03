import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getAllProducts } from "@/lib/products";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsCommon" });
  const alternates = buildAlternates(locale, "/products");

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

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "productsCommon" });
  const tSolutionsCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const products = await getAllProducts(locale);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `${siteConfig.url}/${locale}/products/${product.slug}`,
        offers: {
          "@type": "Offer",
          priceCurrency: "THB",
          price: product.priceFrom,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <Breadcrumb
        items={[
          { label: tSolutionsCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumbProducts") },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("breadcrumbProducts")}
        </h1>
        <div className="mt-8">
          <ProductsExplorer products={products} />
        </div>
      </div>
    </>
  );
}
