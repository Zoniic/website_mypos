import { getTranslations } from "next-intl/server";
import { findSolution, getCatalog } from "@/lib/catalog";
import { buildOgImage, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const line = findSolution(await getCatalog(), slug);
  if (!line) {
    return buildOgImage("MYPOS");
  }

  const t = await getTranslations({ locale, namespace: `solutions.${line.key}` });

  return buildOgImage(t("hero.title"));
}
