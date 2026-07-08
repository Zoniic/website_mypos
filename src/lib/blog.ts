import { prisma } from "@/lib/prisma";

export type BlogPostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  featured: boolean;
  createdAt: Date;
};

export type BlogPost = BlogPostSummary & { body: string };

type RowWithTranslations = {
  id: number;
  slug: string;
  coverImageUrl: string | null;
  featured: boolean;
  createdAt: Date;
  translations: { title: string; excerpt: string; body?: string }[];
};

function toSummary(row: RowWithTranslations): BlogPostSummary {
  const translation = row.translations[0];
  return {
    id: row.id,
    slug: row.slug,
    title: translation?.title ?? row.slug,
    excerpt: translation?.excerpt ?? "",
    coverImageUrl: row.coverImageUrl,
    featured: row.featured,
    createdAt: row.createdAt,
  };
}

export async function getAllBlogPosts(locale: string): Promise<BlogPostSummary[]> {
  const rows = await prisma.blogPost.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { translations: { where: { locale } } },
  });
  return rows.map(toSummary);
}

export async function getBlogPostBySlug(slug: string, locale: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });
  if (!row) return null;
  return { ...toSummary(row), body: row.translations[0]?.body ?? "" };
}
