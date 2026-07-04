import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getKbArticleBySlug, getKbCategoryBySlug, toEmbedUrl } from "@/lib/kb";
import { getProductBySlug } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getKbArticleBySlug(slug, locale);
  if (!article) return {};
  const alternates = buildAlternates(locale, `/knowledge-base/article/${slug}`);

  return {
    title: { absolute: `${article.title} | ${siteConfig.name}` },
    description: article.summary,
    alternates,
  };
}

export default async function KbArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kb" });

  const article = await getKbArticleBySlug(slug, locale);
  if (!article) notFound();

  const category = await getKbCategoryBySlug(article.categorySlug, locale);
  const embedUrl = article.videoUrl ? toEmbedUrl(article.videoUrl) : null;

  const linkedProduct = article.productSlug ? await getProductBySlug(article.productSlug, locale) : null;
  const linkedAccessory = article.accessorySlug
    ? await prisma.accessory.findUnique({
        where: { slug: article.accessorySlug },
        include: { translations: { where: { locale } } },
      })
    : null;

  const articleUrl = `${siteConfig.url}/${locale}/knowledge-base/article/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.summary,
    image: article.coverImageUrl ? `${siteConfig.url}${article.coverImageUrl}` : undefined,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: articleUrl,
  };

  return (
    <div>
      <JsonLd data={articleSchema} />
      <Breadcrumb
        items={[
          { label: t("breadcrumb"), href: "/knowledge-base" },
          { label: t(`sections.${article.section}.title`), href: `/knowledge-base/${article.section}` },
          { label: article.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {category && <p className="text-sm font-semibold uppercase tracking-wide text-text-2">{category.name}</p>}
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        {article.summary && <p className="mt-4 text-lg text-text-2">{article.summary}</p>}

        {article.coverImageUrl && (
          <div className="mt-8">
            <PlaceholderImage ratio="16/9" label={article.title} src={article.coverImageUrl} />
          </div>
        )}

        {embedUrl && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe
              src={embedUrl}
              title={article.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {article.body && (
          <div className="mt-8 whitespace-pre-wrap text-text-1">{article.body}</div>
        )}

        {article.pdfUrl && (
          <a
            href={article.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 rounded-button border border-border-strong px-5 py-2.5 text-sm font-semibold text-text-1 transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:bg-surface-2 hover:shadow-[var(--shadow-glow-primary)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="transition-transform group-hover:translate-y-0.5"
            >
              <path
                d="M8 1v9m0 0l-3.5-3.5M8 10l3.5-3.5M2 13h12"
                stroke="currentColor"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("downloadPdf")}
          </a>
        )}

        {(linkedProduct || linkedAccessory) && (
          <div className="mt-10 rounded-xl border border-border p-5">
            <p className="text-sm font-semibold text-text-2">{t("relatedProduct")}</p>
            {linkedProduct && (
              <Link href={`/products/${linkedProduct.slug}`} className="mt-1 block font-semibold hover:underline">
                {linkedProduct.name}
              </Link>
            )}
            {linkedAccessory && (
              <Link href="/accessories" className="mt-1 block font-semibold hover:underline">
                {linkedAccessory.translations[0]?.name ?? linkedAccessory.slug}
              </Link>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
