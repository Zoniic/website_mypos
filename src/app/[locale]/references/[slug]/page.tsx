import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { getReferenceCaseBySlug } from "@/lib/references";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const referenceCase = await getReferenceCaseBySlug(slug, locale);
  if (!referenceCase) return {};

  const alternates = buildAlternates(locale, `/references/${slug}`);
  const title = `${referenceCase.business} | ${siteConfig.name}`;

  return {
    title: { absolute: title },
    description: referenceCase.result,
    alternates,
    openGraph: {
      title,
      description: referenceCase.result,
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "article",
    },
  };
}

export default async function ReferenceCaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const referenceCase = await getReferenceCaseBySlug(slug, locale);
  if (!referenceCase) notFound();

  const t = await getTranslations({ locale, namespace: "references" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tProducts = await getTranslations({ locale, namespace: "productsCommon" });
  const businessTypeLabels = tProducts.raw("businessTypes") as Record<string, string>;

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb"), href: "/references" },
          { label: referenceCase.business },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {referenceCase.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-surface-2">
            <Image
              src={referenceCase.imageUrl}
              alt={`${referenceCase.business} — on-site installation`}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          {referenceCase.logoUrl && (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-0">
              <Image src={referenceCase.logoUrl} alt={`${referenceCase.business} logo`} fill sizes="48px" className="object-contain p-1" />
            </span>
          )}
          <div>
            <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-2">
              {businessTypeLabels[referenceCase.businessType] ?? referenceCase.businessType}
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{referenceCase.business}</h1>
          </div>
        </div>

        <dl className="mt-8 space-y-6">
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-text-2">
              {tCommon("problemLabel")}
            </dt>
            <dd className="mt-2 text-text-1">{referenceCase.problem}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-text-2">
              {tCommon("installLabel")}
            </dt>
            <dd className="mt-2 text-text-1">{referenceCase.install}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-text-2">
              {tCommon("resultLabel")}
            </dt>
            <dd className="mt-2 text-lg font-semibold text-primary-600">{referenceCase.result}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/references" variant="line">
            {t("backToReferences")}
          </Button>
          <Button href="/contact" variant="primary">
            {t("askAboutThisCase")}
          </Button>
        </div>
      </div>
    </>
  );
}
