import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SpecList } from "@/components/products/SpecList";
import { DatasheetViewer } from "@/components/products/DatasheetViewer";
import { ProductCard } from "@/components/products/ProductCard";
import { StockBadge } from "@/components/products/StockBadge";
import { AddToCompareButton } from "@/components/products/AddToCompareButton";
import { toEmbedUrl } from "@/lib/kb";
import { solutionMachine } from "@/data/solutions";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { MarketplaceLinks } from "@/components/commerce/MarketplaceLinks";
import { TrackView } from "@/components/analytics/TrackView";
import { absoluteUrl, schemaAvailability } from "@/lib/structuredData";

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
  const images = [product.imageUrl, ...product.galleryUrls].filter(Boolean).map((url) => absoluteUrl(url!));

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
      // Uploaded product photos beat the generated OG card when shared.
      ...(images.length ? { images } : {}),
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
  const tShop = await getTranslations({ locale, namespace: "shop" });
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

  const sellsOnline = isOnlineOrderingOn(settings) && product.onlinePrice !== undefined;
  const productUrl = `${siteConfig.url}/${locale}/products/${product.slug}`;
  const productImages = [product.imageUrl, ...product.galleryUrls].filter(Boolean).map((url) => absoluteUrl(url!));

  // Google shows price, stock and brand in results from this.
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: t("highlight"),
    url: productUrl,
    sku: product.slug,
    brand: { "@type": "Brand", name: "MYPOS" },
    manufacturer: { "@type": "Organization", name: "MYPOS" },
    ...(productImages.length ? { image: productImages } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "THB",
      price: product.onlinePrice ?? product.priceFrom,
      availability: schemaAvailability(product.stockStatus),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "MYPOS" },
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={productSchema} />
      <TrackView
        item={{
          id: product.slug,
          name: product.name,
          price: product.onlinePrice ?? product.priceFrom,
          category: product.categories[0],
        }}
      />

      <Breadcrumb items={breadcrumbItems} />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ProductGallery
          name={product.name}
          imageUrl={product.imageUrl}
          galleryUrls={product.galleryUrls}
          machine={product.categories[0] ? solutionMachine[product.categories[0]] : undefined}
        />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{product.name}</h1>
          {sellsOnline ? (
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-text-1">
                {format.number(product.onlinePrice!, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm text-text-2">{tShop("priceInclVat")}</span>
            </p>
          ) : (
            <p className="mt-3 text-2xl font-semibold text-text-1">
              {tCommon("priceFrom")}{" "}
              {format.number(product.priceFrom, {
                style: "currency",
                currency: "THB",
                maximumFractionDigits: 0,
              })}
            </p>
          )}
          <div className="mt-2">
            <StockBadge
              status={product.stockStatus}
              leadTimeDays={product.leadTimeDays}
              labels={{
                inStock: tDetail("stockInStock"),
                preorder: tDetail("stockPreorder"),
                outOfStock: tDetail("stockOutOfStock"),
                leadTime: tDetail.raw("leadTimeLabel"),
              }}
            />
          </div>
          <p className="mt-4 text-text-2">{t("highlight")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            {sellsOnline && (
              <AddToCartButton
                kind="product"
                slug={product.slug}
                name={product.name}
                imageUrl={product.imageUrl}
                unitPrice={product.onlinePrice!}
                category={product.categories[0]}
                labels={{ add: tShop("addToCart"), added: tShop("added"), viewCart: tShop("viewCart") }}
              />
            )}
            <Button href={`/contact?product=${product.slug}`} variant={sellsOnline ? "ghost" : "primary"} size="lg">
              {tDetail("requestQuote")}
            </Button>
            {settings.lineUrl && (
              <Button href={settings.lineUrl} external variant="line" size="lg">
                {tDetail("lineQuote")}
              </Button>
            )}
            <AddToCompareButton
              slug={product.slug}
              name={product.name}
              imageUrl={product.imageUrl}
              priceFrom={product.priceFrom}
              addLabel={tCommon("addToCompare")}
              removeLabel={tCommon("removeFromCompare")}
            />
          </div>
          <MarketplaceLinks
            className="mt-8 border-t border-border pt-6"
            size="lg"
            label={tShop("buyOn")}
            itemName={product.name}
            shopee={product.shopeeUrl}
            lazada={product.lazadaUrl}
          />
        </div>
      </section>

      <SpecList title={tDetail("specsTitle")} highlight={t("highlight")} rows={specRows} />

      <DatasheetViewer
        title={tDetail("datasheetTitle")}
        url={product.datasheetUrl}
        downloadLabel={tDetail("datasheetDownload")}
        unavailableLabel={tDetail("datasheetUnavailable")}
      />

      {product.videoUrl &&
        (() => {
          const embedUrl = toEmbedUrl(product.videoUrl!);
          if (!embedUrl) return null;
          return (
            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold tracking-tight">{tDetail("videoTitle")}</h2>
              <div className="mt-6 aspect-video overflow-hidden rounded-card bg-surface-2">
                <iframe
                  src={embedUrl}
                  title={`${product.name} video`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          );
        })()}

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
