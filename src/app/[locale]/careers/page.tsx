import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getOpenJobPostings } from "@/lib/careers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  const alternates = buildAlternates(locale, "/careers");
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

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "careers" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const jobs = await getOpenJobPostings(locale);

  return (
    <>
      <Breadcrumb items={[{ label: tCommon("breadcrumbHome"), href: "/" }, { label: t("breadcrumb") }]} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>

        {jobs.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
            {t("noOpenings")}
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.slug}
                href={`/careers/${job.slug}`}
                className="block rounded-card border border-border bg-surface-1/40 p-6 outline-offset-2 transition-all hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="mt-2 text-sm text-text-2">
                  {job.department} · {job.location} · {job.employmentType}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
