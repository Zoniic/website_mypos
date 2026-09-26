import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { searchKbArticles, type KbSection } from "@/lib/kb";


// Reads searchParams (filters / query), so it renders per request; its
// data still comes from the shared cache (lib/siteCache).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const alternates = buildAlternates(locale, "/knowledge-base/search");
  return { alternates, robots: { index: false, follow: true } };
}

export default async function KbSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; section?: string }>;
}) {
  const { locale } = await params;
  const { q = "", section } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kb" });

  const results = await searchKbArticles(q, locale, section as KbSection | undefined);

  return (
    <div>
      <Breadcrumb
        items={[{ label: t("breadcrumb"), href: "/knowledge-base" }, { label: t("searchResultsTitle") }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("searchResultsTitle")}</h1>

        <form action="/knowledge-base/search" method="get" className="mt-6">
          {section && <input type="hidden" name="section" value={section} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border border-border-strong bg-surface-0 px-4 py-3 text-text-1"
          />
        </form>

        <p className="mt-4 text-sm text-text-2">
          {t("searchResultsCount", { count: results.length, query: q })}
        </p>

        <div className="mt-6 space-y-4">
          {results.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge-base/article/${article.slug}`}
              className="block rounded-xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="font-semibold">{article.title}</h2>
              <p className="mt-1 text-sm text-text-2">{article.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
