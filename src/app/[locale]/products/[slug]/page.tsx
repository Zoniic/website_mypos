import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/siteSettings";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SpecList } from "@/components/products/SpecList";
import { DatasheetViewer } from "@/components/products/DatasheetViewer";
import { ProductCard } from "@/components/products/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: `products.items.${slug}` });
  const alternates = buildAlternates(locale, `/products/${slug}`);
  const title = `${product.name} | MYPOS`;
  const description = t("highlight");

  return {
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: `products.items.${slug}` });
  const tDetail = await getTranslations({ locale, namespace: "productDetail" });
  const tCommon = await getTranslations({ locale, namespace: "productsCommon" });
  const tSolutionsCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const format = await getFormatter({ locale });
  const settings = await getSiteSettings();

  const related = await getRelatedProducts(product, locale);

  const specRows = [
    { label: tDetail("screenSize"), value: product.specs.screenSize },
    { label: tDetail("os"), value: product.specs.os },
    { label: tDetail("cpu"), value: product.specs.cpu },
    { label: tDetail("ram"), value: product.specs.ram },
    { label: tDetail("storage"), value: product.specs.storage },
    { label: tDetail("connectivity"), value: product.specs.connectivity.join(", ") },
    { label: tDetail("dimensions"), value: product.specs.dimensions },
    { label: tDetail("weight"), value: product.specs.weight },
    {
      label: tDetail("warranty"),
      value: tDetail("warrantyValue", { months: product.specs.warrantyMonths }),
    },
  ];

  const breadcrumbItems = [
    { label: tSolutionsCommon("breadcrumbHome"), href: "/" },
    { label: tCommon("breadcrumbProducts"), href: "/products" },
    { label: product.name },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tSolutionsCommon("breadcrumbHome"), item: `${siteConfig.url}/${locale}` },
      { "@type": "ListItem", position: 2, name: tCommon("breadcrumbProducts"), item: `${siteConfig.url}/${locale}/products` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteConfig.url}/${locale}/products/${product.slug}` },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: t("highlight"),
    url: `${siteConfig.url}/${locale}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: product.priceFrom,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={productSchema} />

      <Breadcrumb items={breadcrumbItems} />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ProductGallery
          name={product.name}
          imageUrl={product.imageUrl}
          galleryUrls={product.galleryUrls}
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-text-1">
            {tCommon("priceFrom")}{" "}
            {format.number(product.priceFrom, {
              style: "currency",
              currency: "THB",
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="mt-4 text-text-2">{t("highlight")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={`/contact?product=${product.slug}`} variant="primary" size="lg">
              {tDetail("requestQuote")}
            </Button>
            <Button href={settings.lineUrl} external variant="line" size="lg">
              {tDetail("lineQuote")}
            </Button>
          </div>
        </div>
      </section>

      <SpecList title={tDetail("specsTitle")} highlight={t("highlight")} rows={specRows} />

      <DatasheetViewer
        title={tDetail("datasheetTitle")}
        url={product.datasheetUrl}
        downloadLabel={tDetail("datasheetDownload")}
        unavailableLabel={tDetail("datasheetUnavailable")}
      />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">{tDetail("relatedTitle")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
