import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/siteSettings";
import { organizationSameAs } from "@/lib/structuredData";
import { getFeaturedProducts } from "@/lib/products";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { TrustLogos } from "@/components/sections/TrustLogos";
import { About } from "@/components/sections/About";
import { Solutions } from "@/components/sections/Solutions";
import { ReceiptTape } from "@/components/sections/ReceiptTape";
import { Pricing } from "@/components/sections/Pricing";
import { Integrations } from "@/components/sections/Integrations";
import { UseCases } from "@/components/sections/UseCases";
import { SelfServiceBenefits } from "@/components/sections/SelfServiceBenefits";
import { WhyMypos } from "@/components/sections/WhyMypos";
import { PopularProducts } from "@/components/sections/PopularProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Invite } from "@/components/sections/Invite";
import { PageSections } from "@/components/layout/PageSections";
import { getPageSections } from "@/lib/pageLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const alternates = buildAlternates(locale, "/");

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];
  const featuredProducts = await getFeaturedProducts(locale);
  const settings = await getSiteSettings();
  const order = await getPageSections("home");

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/brand/logo.png`,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    sameAs: organizationSameAs(settings),
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

  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: featuredProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `${siteConfig.url}/${locale}/products/${product.slug}`,
        offers: {
          "@type": "Offer",
          priceCurrency: "THB",
          price: product.priceFrom,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      {order.includes("faq") && <JsonLd data={faqSchema} />}
      <JsonLd data={productListSchema} />

      <PageSections
        order={order}
        blocks={{
          hero: <Hero />,
          trustLogos: <TrustLogos />,
          solutions: <Solutions />,
          receiptTape: <ReceiptTape />,
          selfServiceBenefits: <SelfServiceBenefits />,
          useCases: <UseCases />,
          popularProducts: <PopularProducts />,
          integrations: <Integrations />,
          pricing: <Pricing />,
          whyMypos: <WhyMypos />,
          testimonials: <Testimonials />,
          about: <About />,
          faq: <Faq />,
          invite: <Invite />,
        }}
      />
    </>
  );
}
