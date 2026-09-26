import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { searchSite } from "@/lib/search";


// Reads searchParams (filters / query), so it renders per request; its
// data still comes from the shared cache (lib/siteCache).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: { absolute: t("metaTitle") }, robots: { index: false } };
}

const typeLabelKey = {
  product: "sectionProducts",
  accessory: "sectionAccessories",
  reference: "sectionReferences",
  kb: "sectionKb",
} as const;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "search" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const query = q?.trim() ?? "";
  const results = query ? await searchSite(query, locale) : [];

  return (
    <>
      <Breadcrumb items={[{ label: tCommon("breadcrumbHome"), href: "/" }, { label: t("breadcrumb") }]} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>

        <form action={`/${locale}/search`} method="get" className="mt-6">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t("placeholder")}
            className="w-full rounded-lg border border-border-strong bg-surface-0 px-4 py-3 text-base focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
            autoFocus
          />
        </form>

        {query && (
          <p className="mt-6 text-sm text-text-2">{t("resultsCount", { count: results.length, query })}</p>
        )}

        {query && results.length === 0 && (
          <p className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
            {t("noResults")}
          </p>
        )}

        {results.length > 0 && (
          <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
            {results.map((result, index) => (
              <li key={`${result.type}-${result.href}-${index}`}>
                <Link
                  href={result.href}
                  className="block px-5 py-4 -outline-offset-2 transition-colors hover:bg-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-primary-600">
                    {t(typeLabelKey[result.type])}
                  </span>
                  <p className="mt-1 font-semibold text-text-1">{result.title}</p>
                  {result.snippet && (
                    <p className="mt-1 line-clamp-2 text-sm text-text-2">{result.snippet}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
