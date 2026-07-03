import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getProductsByCategory } from "@/lib/products";
import { getSiteImages } from "@/lib/siteSettings";
import {
  isSolutionSlug,
  solutionCategory,
  solutionMessageKey,
} from "@/data/solutions";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SolutionHero } from "@/components/sections/SolutionHero";
import { PainGain, type PainGainItem } from "@/components/sections/PainGain";
import { HowItWorks, type StepItem } from "@/components/sections/HowItWorks";
import { References, type CaseItem } from "@/components/sections/References";
import { CompareTable } from "@/components/sections/CompareTable";
import { FaqAccordion, type FaqItem } from "@/components/sections/FaqAccordion";
import { Invite } from "@/components/sections/Invite";

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

  const painGainItems = t.raw("painGain") as PainGainItem[];
  const steps = t.raw("steps") as StepItem[];
  const cases = t.raw("cases") as CaseItem[];
  const faqItems = t.raw("faq") as FaqItem[];
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
        ctaSecondary={tCommon("compareCta")}
        imageLabel={`${navLabel} photo`}
        imageUrl={images[`solution-${slug}`]}
      />
      <PainGain
        title={tCommon("painGainTitle")}
        painLabel={tCommon("painLabel")}
        gainLabel={tCommon("gainLabel")}
        items={painGainItems}
      />
      <HowItWorks title={tCommon("howItWorksTitle")} steps={steps} />
      <References
        title={tCommon("referencesTitle")}
        note={tCommon("referencesNote")}
        problemLabel={tCommon("problemLabel")}
        installLabel={tCommon("installLabel")}
        resultLabel={tCommon("resultLabel")}
        cases={cases}
      />
      <CompareTable
        title={tCommon("compareTitle")}
        modelLabel={tCommon("compareModel")}
        screenLabel={tCommon("compareScreen")}
        osLabel={tCommon("compareOs")}
        priceLabel={tCommon("comparePrice")}
        products={categoryProducts}
      />
      <FaqAccordion title={tCommon("faqTitle")} items={faqItems} />
      <Invite />
    </>
  );
}
