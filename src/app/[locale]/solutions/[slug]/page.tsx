import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getProductsByCategory } from "@/lib/products";
import { getSiteImages } from "@/lib/siteSettings";
import {
  isOnlineSolution,
  isSolutionSlug,
  solutionCategory,
  solutionMachine,
  solutionMessageKey,
} from "@/data/solutions";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SolutionHero } from "@/components/sections/SolutionHero";
import { SolutionSubNav } from "@/components/solutions/SolutionSubNav";
import { PainGain, type PainGainItem } from "@/components/sections/PainGain";
import { SelfServiceBenefits } from "@/components/sections/SelfServiceBenefits";
import { HowItWorks, type StepItem } from "@/components/sections/HowItWorks";
import { References, type CaseItem } from "@/components/sections/References";
import { CompareTable } from "@/components/sections/CompareTable";
import { FaqAccordion, type FaqItem } from "@/components/sections/FaqAccordion";
import { Invite } from "@/components/sections/Invite";
import { BackOfficeBand, SolutionDetails, type FeatureItem, type SpecRow } from "@/components/sections/SolutionDetails";


// Empty list = render each page on its first visit, then serve it from
// the cache (ISR). Without this export the route renders on every request.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSolutionSlug(slug)) return {};

  const key = solutionMessageKey[slug];
  const t = await getTranslations({ locale, namespace: `solutions.${key}` });
  const alternates = buildAlternates(locale, `/solutions/${slug}`);

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

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!isSolutionSlug(slug)) {
    notFound();
  }

  setRequestLocale(locale);

  const key = solutionMessageKey[slug];
  const t = await getTranslations({ locale, namespace: `solutions.${key}` });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommonUi = await getTranslations({ locale, namespace: "common" });

  // Lists are admin-editable copy: a missing or malformed one renders as
  // empty instead of crashing the page. Features/specs exist only on the
  // newer lines; case studies only where real ones exist.
  const list = <T,>(key: string): T[] => {
    const value: unknown = t.has(key) ? t.raw(key) : [];
    return Array.isArray(value) ? (value as T[]) : [];
  };
  const painGainItems = list<PainGainItem>("painGain");
  const steps = list<StepItem>("steps");
  const cases = list<CaseItem>("cases");
  const faqItems = list<FaqItem>("faq");
  const features = list<FeatureItem>("features");
  const specs = list<SpecRow>("specs");
  const navLabel = tNav(`solutionsItems.${key}`);
  const categoryProducts = await getProductsByCategory(solutionCategory[slug], locale);
  const images = await getSiteImages();

  const breadcrumbItems = [
    { label: tCommon("breadcrumbHome"), href: "/" },
    { label: navLabel },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tCommon("breadcrumbHome"),
        item: `${siteConfig.url}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: navLabel,
        item: `${siteConfig.url}/${locale}/solutions/${slug}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <Breadcrumb items={breadcrumbItems} />
      <SolutionHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        ctaPrimary={tCommonUi("requestQuote")}
        // Point at the model comparison when there are products to compare,
        // otherwise at the features/specs.
        ctaSecondary={categoryProducts.length ? tCommon("compareCta") : tCommon("featuresTitle")}
        ctaSecondaryHref={categoryProducts.length ? "#compare" : features.length || specs.length ? "#details" : "#how-it-works"}
        imageLabel={`${navLabel} photo`}
        imageUrl={images[`solution-${slug}`]}
        machine={solutionMachine[slug]}
      />
      <SolutionSubNav
        items={[
          { id: "pain-gain", label: tCommon("painGainTitle") },
          ...(features.length || specs.length ? [{ id: "details", label: tCommon("featuresTitle") }] : []),
          { id: "how-it-works", label: tCommon("howItWorksTitle") },
          ...(cases.length ? [{ id: "cases", label: tCommon("referencesTitle") }] : []),
          ...(categoryProducts.length ? [{ id: "compare", label: tCommon("compareTitle") }] : []),
          { id: "faq", label: tCommon("faqTitle") },
        ]}
      />
      <PainGain
        id="pain-gain"
        title={tCommon("painGainTitle")}
        painLabel={tCommon("painLabel")}
        gainLabel={tCommon("gainLabel")}
        items={painGainItems}
      />
      {slug === "self-order" && <SelfServiceBenefits />}
      <SolutionDetails
        id="details"
        featuresTitle={tCommon("featuresTitle")}
        features={features}
        specsTitle={tCommon("specsTitle")}
        specs={specs}
      />
      <HowItWorks id="how-it-works" title={tCommon("howItWorksTitle")} steps={steps} />
      {cases.length > 0 && (
        <References
          id="cases"
          title={tCommon("referencesTitle")}
          note={tCommon("referencesNote")}
          problemLabel={tCommon("problemLabel")}
          installLabel={tCommon("installLabel")}
          resultLabel={tCommon("resultLabel")}
          cases={cases}
        />
      )}
      {categoryProducts.length > 0 && (
        <CompareTable
          title={tCommon("compareTitle")}
          modelLabel={tCommon("compareModel")}
          screenLabel={tCommon("compareScreen")}
          osLabel={tCommon("compareOs")}
          priceLabel={tCommon("comparePrice")}
          products={categoryProducts}
        />
      )}
      {isOnlineSolution(slug) && (
        <BackOfficeBand
          title={tCommon("backOfficeTitle")}
          body={tCommon("backOfficeBody")}
          cta={tCommon("backOfficeCta")}
        />
      )}
      <FaqAccordion id="faq" title={tCommon("faqTitle")} items={faqItems} />
      <Invite />
    </>
  );
}
