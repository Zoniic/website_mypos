import { getTranslations } from "next-intl/server";
import { isSolutionSlug, solutionMessageKey } from "@/data/solutions";
import { buildOgImage, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!isSolutionSlug(slug)) {
    return buildOgImage("MYPOS");
  }

  const key = solutionMessageKey[slug];
  const t = await getTranslations({ locale, namespace: `solutions.${key}` });

  return buildOgImage(t("hero.title"));
}
