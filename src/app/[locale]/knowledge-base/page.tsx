import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/ui/FadeIn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kb" });
  const alternates = buildAlternates(locale, "/knowledge-base");

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

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kb" });

  const sections = [
    { key: "hardware", href: "/knowledge-base/hardware" },
    { key: "software", href: "/knowledge-base/software" },
  ] as const;

  return (
    <div>
      <Breadcrumb items={[{ label: t("breadcrumb") }]} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-text-2">{t("subtitle")}</p>

        <form action="/knowledge-base/search" method="get" className="mt-8 max-w-xl">
          <label className="block">
            <span className="sr-only">{t("searchPlaceholder")}</span>
            <input
              type="search"
              name="q"
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-lg border border-border-strong bg-surface-0 px-4 py-3 text-text-1"
            />
          </label>
        </form>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {sections.map((section, index) => (
            <FadeIn key={section.key} delay={index * 0.1}>
              <Link
                href={section.href}
                className="block h-full rounded-2xl border border-border p-8 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-2xl font-semibold">{t(`sections.${section.key}.title`)}</h2>
                <p className="mt-2 text-text-2">{t(`sections.${section.key}.description`)}</p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
