import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CompareClient } from "@/components/products/CompareClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  return { title: { absolute: t("metaTitle") }, robots: { index: false } };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "compare" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });

  return (
    <>
      <Breadcrumb items={[{ label: tCommon("breadcrumbHome"), href: "/" }, { label: t("breadcrumb") }]} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>
        <CompareClient />
      </div>
    </>
  );
}
