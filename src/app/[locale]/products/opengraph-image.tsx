import { getTranslations } from "next-intl/server";
import { buildOgImage, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsCommon" });

  return buildOgImage(t("breadcrumbProducts"));
}
