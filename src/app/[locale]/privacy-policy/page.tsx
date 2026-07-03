import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const alternates = buildAlternates(locale, "/privacy-policy");

  return {
    title: { absolute: t("privacyMetaTitle") },
    description: t("privacyMetaDescription"),
    alternates,
    openGraph: {
      title: t("privacyMetaTitle"),
      description: t("privacyMetaDescription"),
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div>
      <Breadcrumb items={[{ label: t("privacyTitle") }]} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("privacyTitle")}</h1>
        <p className="mt-2 text-sm text-text-2">{t("privacyLastUpdated")}</p>
        <div className="mt-8 whitespace-pre-wrap text-text-1">{t("privacyBody")}</div>
      </article>
    </div>
  );
}
