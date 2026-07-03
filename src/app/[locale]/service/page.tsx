import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { HowItWorks, type StepItem } from "@/components/sections/HowItWorks";
import { FaqAccordion, type FaqItem } from "@/components/sections/FaqAccordion";
import { Invite } from "@/components/sections/Invite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "service" });
  const alternates = buildAlternates(locale, "/service");

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

type ServiceType = { title: string; description: string };

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "service" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const serviceTypes = t.raw("types.items") as ServiceType[];
  const steps = t.raw("process.steps") as StepItem[];
  const faqItems = t.raw("faq.items") as FaqItem[];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tCommon("breadcrumbHome"), item: `${siteConfig.url}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb"), item: `${siteConfig.url}/${locale}/service` },
    ],
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumb
        items={[
          { label: tCommon("breadcrumbHome"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 text-lg text-text-2">{t("hero.subtitle")}</p>
        <div className="mt-8">
          <Button href="/contact" variant="primary" size="lg">
            {t("hero.cta")}
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-surface-0 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">{t("types.title")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {serviceTypes.map((item) => (
              <div key={item.title} className="rounded-2xl bg-surface-1 p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-text-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks title={t("process.title")} steps={steps} />
      <FaqAccordion title={t("faq.title")} items={faqItems} />
      <Invite />
    </>
  );
}
