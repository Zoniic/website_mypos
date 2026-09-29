import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getProductsByBusinessType } from "@/lib/products";
import { getReferenceCasesByBusinessType } from "@/lib/references";
import { getSiteImages } from "@/lib/siteSettings";
import { getSiteStructure } from "@/lib/siteStructure";
import { findBusinessType, findSolution, getCatalog, type CatalogSolution } from "@/lib/catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { SolutionHero } from "@/components/sections/SolutionHero";
import { PainGain, type PainGainItem } from "@/components/sections/PainGain";
import { HowItWorks, type StepItem } from "@/components/sections/HowItWorks";
import { References } from "@/components/sections/References";
import { CompareTable } from "@/components/sections/CompareTable";
import { FaqAccordion, type FaqItem } from "@/components/sections/FaqAccordion";
import { Invite } from "@/components/sections/Invite";
import { PageSections } from "@/components/layout/PageSections";
import { getPageSections } from "@/lib/pageLayout";
import { RecommendedSolutions } from "@/components/industries/RecommendedSolutions";

// Empty list = render each page on its first visit, then serve it from
// the cache (ISR). Without this export the route renders on every request.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale, type } = await params;
  const businessType = findBusinessType(await getCatalog(), type);
  if (!businessType) return {};

  const t = await getTranslations({ locale, namespace: `industries.${type}` });
  const alternates = buildAlternates(locale, `/industries/${type}`);

  return {
    title: { absolute: t("metaTitle") },
    // Types added in the admin stay out of search until published.
    ...(!businessType.published && { robots: { index: false, follow: false } }),
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

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  const catalog = await getCatalog();
  if (!findBusinessType(catalog, type)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: `industries.${type}` });
  const tc = await getTranslations({ locale, namespace: "industries.common" });
  const tSolutionsCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tProducts = await getTranslations({ locale, namespace: "productsCommon" });

  const [products, cases, images] = await Promise.all([
    getProductsByBusinessType(type, locale),
    getReferenceCasesByBusinessType(type, locale),
    getSiteImages(),
  ]);

  // Admin-editable lists: missing or malformed ones render as empty.
  const list = <T,>(key: string): T[] => {
    const value: unknown = t.has(key) ? t.raw(key) : [];
    return Array.isArray(value) ? (value as T[]) : [];
  };
  const painGain = list<PainGainItem>("painGain");
  const steps = list<StepItem>("steps");
  const faq = list<FaqItem>("faq");
  const blurbs = (tc.has("solutionBlurbs") ? tc.raw("solutionBlurbs") : {}) as Record<string, string>;
  const typeLabel = tProducts(`businessTypes.${type}`);

  // Recommended lines, as arranged in the admin (Navigation → industries).
  // Unpublished lines are skipped until they go live.
  const recommended = ((await getSiteStructure()).industrySolutions[type] ?? [])
    .map((slug) => findSolution(catalog, slug))
    .filter((line): line is CatalogSolution => line !== undefined && line.published);
  const solutions = recommended.map((line) => ({
    slug: line.slug,
    label: tNav(`solutionsItems.${line.key}`),
    blurb: blurbs[line.key] ?? "",
    machine: line.machine,
  }));

  const pageUrl = `${siteConfig.url}/${locale}/industries/${type}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tSolutionsCommon("breadcrumbHome"), item: `${siteConfig.url}/${locale}` },
      { "@type": "ListItem", position: 2, name: tc("breadcrumb"), item: `${siteConfig.url}/${locale}/industries` },
      { "@type": "ListItem", position: 3, name: typeLabel, item: pageUrl },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const order = await getPageSections("industry", type);
  const shown = (id: string) => order.includes(id);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {shown("faq") && faq.length > 0 && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[
          { label: tSolutionsCommon("breadcrumbHome"), href: "/" },
          { label: tc("breadcrumb"), href: "/industries" },
          { label: typeLabel },
        ]}
      />
      <SolutionHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        ctaPrimary={tc("ctaDemo")}
        ctaPrimaryHref={`/contact?topic=demo&industry=${type}`}
        ctaSecondary={shown("recommended") && solutions.length ? tc("solutionsTitle") : tc("stepsTitle")}
        ctaSecondaryHref={shown("recommended") && solutions.length ? "#solutions" : "#how-it-works"}
        imageLabel={`${typeLabel} photo`}
        imageUrl={images[`industry-${type}`]}
        imageSlot={`industry-${type}`}
        machine={recommended[0]?.machine ?? "kiosk"}
      />
      <PageSections
        page="industry"
        variant={type}
        order={order}
        blocks={{
          painGain: (
            <PainGain
              id="pain-gain"
              title={tc("painGainTitle")}
              painLabel={tc("painLabel")}
              gainLabel={tc("gainLabel")}
              items={painGain}
            />
          ),
          recommended: solutions.length > 0 && (
            <RecommendedSolutions
              id="solutions"
              title={tc("solutionsTitle")}
              lede={tc("solutionsLede")}
              viewLabel={tc("viewSolution")}
              items={solutions}
            />
          ),
          howItWorks: <HowItWorks id="how-it-works" title={tc("stepsTitle")} steps={steps} />,
          products: products.length > 0 && (
            <>
              <CompareTable
                title={tc("productsTitle")}
                modelLabel={tSolutionsCommon("compareModel")}
                screenLabel={tSolutionsCommon("compareScreen")}
                osLabel={tSolutionsCommon("compareOs")}
                priceLabel={tSolutionsCommon("comparePrice")}
                products={products}
              />
              <div className="mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                <Button href={`/products?businessType=${type}`} variant="ghost" size="sm">
                  {tc("viewAllProducts")}
                </Button>
              </div>
            </>
          ),
          cases: cases.length > 0 && (
            <References
              id="cases"
              title={tc("casesTitle")}
              note={tc("casesNote")}
              problemLabel={tSolutionsCommon("problemLabel")}
              installLabel={tSolutionsCommon("installLabel")}
              resultLabel={tSolutionsCommon("resultLabel")}
              cases={cases}
            />
          ),
          savings: (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col items-start justify-between gap-6 rounded-card border border-primary-200 bg-primary-50 p-8 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{tc("calculatorTitle")}</h2>
                  <p className="mt-2 max-w-xl text-text-2">{tc("calculatorBody")}</p>
                </div>
                <Button href="/tools/savings-calculator" variant="primary">
                  {tc("calculatorCta")}
                </Button>
              </div>
            </section>
          ),
          faq: faq.length > 0 && <FaqAccordion id="faq" title={tc("faqTitle")} items={faq} />,
          invite: <Invite />,
        }}
      />
    </>
  );
}
