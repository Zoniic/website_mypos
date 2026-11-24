import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { getAccessoryBySlug, getRelatedAccessories } from "@/lib/accessories";
import { accessoryDisplayPrice } from "@/lib/accessoryPrice";
import { ACCESSORY_COPY_NAMESPACE, accessoryCopy } from "@/data/accessoryCopy";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SpecList } from "@/components/products/SpecList";
import { DatasheetViewer } from "@/components/products/DatasheetViewer";
import { StockBadge } from "@/components/products/StockBadge";
import { AddToCompareButton } from "@/components/products/AddToCompareButton";
import { AccessoryCard } from "@/components/accessories/AccessoryCard";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { MarketplaceLinks } from "@/components/commerce/MarketplaceLinks";
import { TrackView } from "@/components/analytics/TrackView";
import { toEmbedUrl } from "@/lib/kb";
import { decodeSlugParam } from "@/lib/slug";
import { absoluteUrl, schemaAvailability } from "@/lib/structuredData";

// Empty list = render each page on its first visit, then serve it from
// the cache (ISR). Without this export the route renders on every request.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  const accessory = await getAccessoryBySlug(decodeSlugParam(rawSlug), locale);
  if (!accessory) return {};

  const alternates = buildAlternates(locale, `/accessories/${accessory.slug}`);
  const title = `${accessory.name} | MYPOS`;
  const description = accessory.description || accessory.name;
  const images = [accessory.imageUrl, ...accessory.galleryUrls].filter(Boolean).map((url) => absoluteUrl(url!));

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
      ...(images.length ? { images } : {}),
    },
  };
}

export default async function AccessoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  const accessory = await getAccessoryBySlug(decodeSlugParam(rawSlug), locale);
  if (!accessory) notFound();

  setRequestLocale(locale);

  const tDetail = await getTranslations({ locale, namespace: "productDetail" });
  const tCommon = await getTranslations({ locale, namespace: "productsCommon" });
  const tAccessories = await getTranslations({ locale, namespace: "accessories" });
  const tSolutionsCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tShop = await getTranslations({ locale, namespace: "shop" });
  const tCopy = await getTranslations({ locale, namespace: ACCESSORY_COPY_NAMESPACE });
  const copy = (key: Parameters<typeof accessoryCopy>[2]) => accessoryCopy(tCopy, locale, key);
  const format = await getFormatter({ locale });
  const settings = await getSiteSettings();
  const shopOn = isOnlineOrderingOn(settings);

  const related = await getRelatedAccessories(accessory, locale);
  const sellsOnline = shopOn && accessory.onlinePrice !== undefined;
  const price = accessoryDisplayPrice(accessory, shopOn);
  const pageUrl = `${siteConfig.url}/${locale}/accessories/${accessory.slug}`;
  const images = [accessory.imageUrl, ...accessory.galleryUrls].filter(Boolean).map((url) => absoluteUrl(url!));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tSolutionsCommon("breadcrumbHome"), item: `${siteConfig.url}/${locale}` },
      { "@type": "ListItem", position: 2, name: tAccessories("breadcrumb"), item: `${siteConfig.url}/${locale}/accessories` },
      { "@type": "ListItem", position: 3, name: accessory.name, item: pageUrl },
    ],
  };

  // Price is only claimed when the owner entered one.
  const offerPrice = sellsOnline ? accessory.onlinePrice : price;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: accessory.name,
    ...(accessory.description ? { description: accessory.description } : {}),
    url: pageUrl,
    sku: accessory.slug,
    brand: { "@type": "Brand", name: "MYPOS" },
    ...(images.length ? { image: images } : {}),
    ...(offerPrice !== null && offerPrice !== undefined
      ? {
          offers: {
            "@type": "Offer",
            url: pageUrl,
            priceCurrency: "THB",
            price: offerPrice,
            availability: schemaAvailability(accessory.stockStatus),
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "MYPOS" },
          },
        }
      : {}),
  };

  const embedUrl = accessory.videoUrl ? toEmbedUrl(accessory.videoUrl) : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={productSchema} />
      <TrackView
        item={{ id: accessory.slug, name: accessory.name, price: offerPrice ?? 0, category: "accessory" }}
      />

      <Breadcrumb
        items={[
          { label: tSolutionsCommon("breadcrumbHome"), href: "/" },
          { label: tAccessories("breadcrumb"), href: "/accessories" },
          { label: accessory.name },
        ]}
      />

      <section
        data-edit-admin={`/admin/goto/accessory/${accessory.slug}`}
        className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8"
      >
        <ProductGallery name={accessory.name} imageUrl={accessory.imageUrl} galleryUrls={accessory.galleryUrls} />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{accessory.name}</h1>
          {sellsOnline ? (
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-text-1">
                {format.number(accessory.onlinePrice!, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm text-text-2">{tShop("priceInclVat")}</span>
            </p>
          ) : (
            price !== null && (
              <p className="mt-3 text-2xl font-semibold text-text-1">
                {tCommon("priceFrom")}{" "}
                {format.number(price, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
              </p>
            )
          )}
          <div className="mt-2">
            <StockBadge
              status={accessory.stockStatus}
              leadTimeDays={accessory.leadTimeDays}
              labels={{
                inStock: tDetail("stockInStock"),
                preorder: tDetail("stockPreorder"),
                outOfStock: tDetail("stockOutOfStock"),
                leadTime: tDetail.raw("leadTimeLabel"),
              }}
            />
          </div>
          {accessory.description && <p className="mt-4 text-text-2">{accessory.description}</p>}

          <div className="mt-8 flex flex-wrap gap-4">
            {sellsOnline && (
              <AddToCartButton
                kind="accessory"
                slug={accessory.slug}
                name={accessory.name}
                imageUrl={accessory.imageUrl}
                unitPrice={accessory.onlinePrice!}
                category="accessory"
                labels={{ add: tShop("addToCart"), added: tShop("added"), viewCart: tShop("viewCart") }}
              />
            )}
            <Button href={`/contact?product=${accessory.slug}`} variant={sellsOnline ? "ghost" : "primary"} size="lg">
              {tDetail("requestQuote")}
            </Button>
            {settings.lineUrl && (
              <Button href={settings.lineUrl} external variant="line" size="lg">
                {tDetail("lineQuote")}
              </Button>
            )}
            <AddToCompareButton
              kind="accessory"
              slug={accessory.slug}
              name={accessory.name}
              imageUrl={accessory.imageUrl}
              priceFrom={price}
              addLabel={tCommon("addToCompare")}
              removeLabel={tCommon("removeFromCompare")}
            />
          </div>
          <MarketplaceLinks
            className="mt-8 border-t border-border pt-6"
            size="lg"
            label={tShop("buyOn")}
            itemName={accessory.name}
            shopee={accessory.shopeeUrl}
            lazada={accessory.lazadaUrl}
          />

          {accessory.compatibleProducts.length > 0 && (
            <div className="mt-6 rounded-card bg-surface-1 p-4">
              <h2 className="text-sm font-semibold text-text-1">{copy("compatibleTitle")}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {accessory.compatibleProducts.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-0 px-3 py-1.5 text-sm font-medium text-text-1 outline-offset-2 transition-colors hover:border-primary-400/40 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                    >
                      {product.name}
                      <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {accessory.specs.length > 0 && <SpecList title={tDetail("specsTitle")} rows={accessory.specs} />}

      {accessory.datasheetUrl && (
        <DatasheetViewer
          title={tDetail("datasheetTitle")}
          url={accessory.datasheetUrl}
          downloadLabel={tDetail("datasheetDownload")}
          unavailableLabel={tDetail("datasheetUnavailable")}
        />
      )}

      {embedUrl && (
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">{tDetail("videoTitle")}</h2>
          <div className="mt-6 aspect-video overflow-hidden rounded-card bg-surface-2">
            <iframe
              src={embedUrl}
              title={`${accessory.name} video`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">{copy("relatedTitle")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <AccessoryCard key={item.slug} item={item} shopOn={shopOn} heading="h3" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
