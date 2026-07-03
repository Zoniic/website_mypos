import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getFeaturedKbArticles, getKbArticlesByCategory, getKbCategories, type KbSection } from "@/lib/kb";

const SECTIONS: KbSection[] = ["hardware", "software"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}): Promise<Metadata> {
  const { locale, section } = await params;
  const t = await getTranslations({ locale, namespace: "kb" });
  const alternates = buildAlternates(locale, `/knowledge-base/${section}`);

  return {
    title: { absolute: `${t(`sections.${section}.title`)} | ${t("title")} | ${siteConfig.name}` },
    description: t(`sections.${section}.description`),
    alternates,
  };
}

export default async function KbSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  if (!SECTIONS.includes(section as KbSection)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kb" });

  const categories = await getKbCategories(section as KbSection, locale);
  const [categoriesWithArticles, featuredArticles] = await Promise.all([
    Promise.all(
      categories.map(async (category) => ({
        category,
        articles: await getKbArticlesByCategory(category.slug, locale),
      }))
    ),
    getFeaturedKbArticles(section as KbSection, locale),
  ]);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: t("breadcrumb"), href: "/knowledge-base" },
          { label: t(`sections.${section}.title`) },
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t(`sections.${section}.title`)}
        </h1>
        <p className="mt-3 text-lg text-text-2">{t(`sections.${section}.description`)}</p>

        <form action="/knowledge-base/search" method="get" className="mt-8 max-w-xl">
          <input type="hidden" name="section" value={section} />
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

        {featuredArticles.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">{t("recommendedTitle")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/knowledge-base/article/${article.slug}`}
                  className="block rounded-xl border border-primary/40 bg-primary/5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-text-2">{article.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 space-y-10">
          {categoriesWithArticles.map(({ category, articles }) => (
            <section key={category.id}>
              <h2 className="text-xl font-semibold">{category.name}</h2>
              {articles.length === 0 ? (
                <p className="mt-2 text-sm text-text-2">{t("noArticles")}</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/knowledge-base/article/${article.slug}`}
                      className="block rounded-xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-text-2">{article.summary}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
          {categoriesWithArticles.length === 0 && (
            <p className="text-text-2">{t("noArticles")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
