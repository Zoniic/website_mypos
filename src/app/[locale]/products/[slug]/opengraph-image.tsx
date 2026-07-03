import { getProductBySlug } from "@/lib/products";
import { buildOgImage, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);

  return buildOgImage(product?.name ?? "MYPOS");
}
