import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Markdown } from "@/components/ui/Markdown";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBlogPostBySlug } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) return {};
  const alternates = buildAlternates(locale, `/blog/${slug}`);
  return {
    title: { absolute: `${post.title} | ${siteConfig.name}` },
    description: post.excerpt,
    alternates,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? `${siteConfig.url}${post.coverImageUrl}` : undefined,
    datePublished: post.createdAt.toISOString(),
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/${locale}/blog/${slug}`,
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <Breadcrumb
        items={[
          { label: t("breadcrumb"), href: "/blog" },
          { label: post.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-text-2">{post.excerpt}</p>}

        {post.coverImageUrl && (
          <div className="mt-8">
            <PlaceholderImage
              ratio="16/9"
              label={post.title}
              src={post.coverImageUrl}
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
        )}

        {post.body && (
          <div className="mt-8">
            <Markdown body={post.body} locale={locale} />
          </div>
        )}
      </article>
    </>
  );
}
