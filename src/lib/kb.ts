import { prisma } from "@/lib/prisma";

export type KbSection = "hardware" | "software";

export type KbCategorySummary = {
  id: number;
  slug: string;
  section: KbSection;
  name: string;
  articleCount: number;
};

export type KbArticleSummary = {
  id: number;
  slug: string;
  categorySlug: string;
  section: KbSection;
  title: string;
  summary: string;
  featured: boolean;
};

export type KbArticle = KbArticleSummary & {
  body: string;
  coverImageUrl: string | null;
  pdfUrl: string | null;
  videoUrl: string | null;
  productSlug: string | null;
  accessorySlug: string | null;
};

export async function getAllKbArticleSlugs(): Promise<string[]> {
  const rows = await prisma.kbArticle.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getKbCategories(
  section: KbSection,
  locale: string
): Promise<KbCategorySummary[]> {
  const rows = await prisma.kbCategory.findMany({
    where: { section },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
      _count: { select: { articles: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    section: row.section as KbSection,
    name: row.translations[0]?.name ?? row.slug,
    articleCount: row._count.articles,
  }));
}

export async function getKbCategoryBySlug(slug: string, locale: string) {
  const row = await prisma.kbCategory.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    section: row.section as KbSection,
    name: row.translations[0]?.name ?? row.slug,
  };
}

export async function getKbArticlesByCategory(
  categorySlug: string,
  locale: string
): Promise<KbArticleSummary[]> {
  const rows = await prisma.kbArticle.findMany({
    where: { category: { slug: categorySlug } },
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale } }, category: true },
  });
  return rows.map(toSummary);
}

export async function getFeaturedKbArticles(
  section: KbSection,
  locale: string
): Promise<KbArticleSummary[]> {
  const rows = await prisma.kbArticle.findMany({
    where: { featured: true, category: { section } },
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale } }, category: true },
  });
  return rows.map(toSummary);
}

export async function getKbArticleBySlug(slug: string, locale: string): Promise<KbArticle | null> {
  const row = await prisma.kbArticle.findUnique({
    where: { slug },
    include: { translations: { where: { locale } }, category: true },
  });
  if (!row) return null;
  const translation = row.translations[0];
  return {
    ...toSummary(row),
    body: translation?.body ?? "",
    coverImageUrl: row.coverImageUrl,
    pdfUrl: row.pdfUrl,
    videoUrl: row.videoUrl,
    productSlug: row.productSlug,
    accessorySlug: row.accessorySlug,
  };
}

export async function searchKbArticles(
  query: string,
  locale: string,
  section?: KbSection
): Promise<KbArticleSummary[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const rows = await prisma.kbArticle.findMany({
    where: {
      category: section ? { section } : undefined,
      translations: {
        some: {
          locale,
          OR: [
            { title: { contains: trimmed } },
            { summary: { contains: trimmed } },
            { body: { contains: trimmed } },
          ],
        },
      },
    },
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale } }, category: true },
  });
  return rows.map(toSummary);
}

type RowWithTranslationsAndCategory = {
  id: number;
  slug: string;
  featured: boolean;
  translations: { title: string; summary: string }[];
  category: { slug: string; section: string };
};

function toSummary(row: RowWithTranslationsAndCategory): KbArticleSummary {
  const translation = row.translations[0];
  return {
    id: row.id,
    slug: row.slug,
    categorySlug: row.category.slug,
    section: row.category.section as KbSection,
    title: translation?.title ?? row.slug,
    summary: translation?.summary ?? "",
    featured: row.featured,
  };
}

/** Extracts a YouTube/Google Drive embeddable URL, or null if unrecognized. */
export function toEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
    }
    if (url.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }
    if (url.hostname.includes("drive.google.com")) {
      return videoUrl.replace("/view", "/preview");
    }
    return null;
  } catch {
    return null;
  }
}
