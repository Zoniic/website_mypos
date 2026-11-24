import { getAccessoryBySlug } from "@/lib/accessories";
import { buildOgImage, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const accessory = await getAccessoryBySlug(slug, locale);

  return buildOgImage(accessory?.name ?? "MYPOS");
}
