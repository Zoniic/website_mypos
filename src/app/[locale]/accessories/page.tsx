import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessories" });
  const alternates = buildAlternates(locale, "/accessories");

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates,
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
  };
}

type AccessoryItem = { slug: string; name: string; description: string };

export default async function AccessoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "accessories" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const items = t.raw("items") as AccessoryItem[];

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.slug} className="rounded-2xl border border-border p-4">
              <PlaceholderImage ratio="1/1" label={`${item.name} photo`} />
              <h3 className="mt-4 font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-text-2">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button href="/contact" variant="primary">
            {t("cta")}
          </Button>
        </div>
      </div>
    </>
  );
}
