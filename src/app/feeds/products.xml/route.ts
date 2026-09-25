import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { absoluteUrl } from "@/lib/structuredData";

/**
 * Product feed (RSS 2.0 + Google "g:" namespace), the format both Google
 * Merchant Center (free Shopping listings / Shopping ads) and Meta Commerce
 * Manager (Facebook & Instagram shop, dynamic ads) accept. Register this
 * URL once in each as a scheduled feed:
 *   https://<domain>/feeds/products.xml
 *
 * Only items the site actually sells at a fixed price are listed (online
 * ordering on, online price set, photo uploaded) — both platforms reject
 * items whose landing page doesn't show the same price.
 */
export const dynamic = "force-dynamic";

const LOCALE = "th";

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Strip control characters XML 1.0 forbids.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function availability(stockStatus: string): string {
  if (stockStatus === "out_of_stock") return "out_of_stock";
  // Google's "preorder" requires an availability_date we don't track.
  if (stockStatus === "preorder") return "backorder";
  return "in_stock";
}

type FeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  images: string[];
  price: number;
  availability: string;
  productType: string;
};

function itemXml(item: FeedItem): string {
  const [image, ...more] = item.images;
  const fields = [
    `<g:id>${xml(item.id)}</g:id>`,
    `<g:title>${xml(item.title.slice(0, 150))}</g:title>`,
    `<g:description>${xml(item.description.slice(0, 5000))}</g:description>`,
    `<g:link>${xml(item.link)}</g:link>`,
    `<g:image_link>${xml(image)}</g:image_link>`,
    ...more.slice(0, 10).map((url) => `<g:additional_image_link>${xml(url)}</g:additional_image_link>`),
    `<g:availability>${item.availability}</g:availability>`,
    `<g:price>${item.price.toFixed(2)} THB</g:price>`,
    `<g:brand>MYPOS</g:brand>`,
    `<g:condition>new</g:condition>`,
    `<g:identifier_exists>no</g:identifier_exists>`,
    `<g:product_type>${xml(item.productType)}</g:product_type>`,
  ];
  return `    <item>\n${fields.map((f) => `      ${f}`).join("\n")}\n    </item>`;
}

export async function GET() {
  const settings = await getSiteSettings();
  const items: FeedItem[] = [];

  if (isOnlineOrderingOn(settings)) {
    const [products, accessories] = await Promise.all([
      prisma.product.findMany({
        where: { onlinePrice: { not: null }, imageUrl: { not: null } },
        include: { translations: { where: { locale: LOCALE } }, categories: true },
      }),
      prisma.accessory.findMany({
        where: { onlinePrice: { not: null }, imageUrl: { not: null } },
        include: { translations: { where: { locale: LOCALE } } },
      }),
    ]);

    for (const p of products) {
      const tr = p.translations[0];
      items.push({
        id: `product-${p.slug}`,
        title: tr?.name ?? p.slug,
        description: tr?.highlight || tr?.name || p.slug,
        link: `${siteConfig.url}/${LOCALE}/products/${p.slug}`,
        images: [p.imageUrl!, ...p.galleryUrls.split(",").filter(Boolean)].map(absoluteUrl),
        price: p.onlinePrice!,
        availability: availability(p.stockStatus),
        productType: `POS & Self-service > ${p.categories.map((c) => c.slug).join(", ") || "pos"}`,
      });
    }
    for (const a of accessories) {
      const tr = a.translations[0];
      items.push({
        id: `accessory-${a.slug}`,
        title: tr?.name ?? a.slug,
        description: tr?.description || tr?.name || a.slug,
        link: `${siteConfig.url}/${LOCALE}/accessories`,
        images: [absoluteUrl(a.imageUrl!)],
        price: a.onlinePrice!,
        availability: "in_stock",
        productType: "POS & Self-service > Accessories",
      });
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MYPOS</title>
    <link>${siteConfig.url}/${LOCALE}</link>
    <description>MYPOS POS and self-service hardware</description>
${items.map(itemXml).join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
