import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { getJobPostingBySlug } from "@/lib/careers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobPostingBySlug(slug, locale);
  if (!job) return {};
  const alternates = buildAlternates(locale, `/careers/${slug}`);
  return {
    title: { absolute: `${job.title} | ${siteConfig.name}` },
    description: job.description.slice(0, 160),
    alternates,
  };
}

export default async function JobPostingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "careers" });
  const job = await getJobPostingBySlug(slug, locale);
  if (!job) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: t("breadcrumb"), href: "/careers" },
          { label: job.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
        <p className="mt-3 text-text-2">
          {job.department} · {job.location} · {job.employmentType}
        </p>

        {job.description && <div className="mt-8 whitespace-pre-wrap text-text-1">{job.description}</div>}

        <div className="mt-10">
          <Button
            href={`/contact?message=${encodeURIComponent(t("applyMessage", { title: job.title }))}`}
            variant="primary"
            size="lg"
          >
            {t("apply")}
          </Button>
        </div>
      </article>
    </>
  );
}
