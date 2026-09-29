import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { getAllBlogPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const alternates = buildAlternates(locale, "/blog");
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

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const posts = await getAllBlogPosts(locale);

  return (
    <>
      <Breadcrumb items={[{ label: tCommon("breadcrumbHome"), href: "/" }, { label: t("breadcrumb") }]} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-text-2">{t("subtitle")}</p>

        {posts.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
            {t("noPosts")}
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                data-edit-admin={`/admin/goto/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-1/40 outline-offset-2 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                <PlaceholderImage ratio="16/9" label={post.title} src={post.coverImageUrl ?? undefined} />
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-text-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
