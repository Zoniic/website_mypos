"use server";

import { requireAdmin } from "@/lib/adminAuth";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, saveUploadedPdf } from "@/lib/uploads";

const locales = ["th", "en", "zh"] as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function readArticleFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    categoryId: Number(formData.get("categoryId") ?? 0),
    productSlug: String(formData.get("productSlug") ?? "").trim() || null,
    accessorySlug: String(formData.get("accessorySlug") ?? "").trim() || null,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    featured: formData.get("featured") === "on",
  };
}

async function readAssetFields(
  formData: FormData,
  slug: string,
  existingCoverUrl: string | null,
  existingPdfUrl: string | null
) {
  const coverFile = formData.get("coverImage") as File | null;
  const newCoverUrl = await saveUploadedImage(coverFile, "kb", `${slug}-cover`);
  const pdfFile = formData.get("pdf") as File | null;
  const newPdfUrl = await saveUploadedPdf(pdfFile, "kb", slug);

  return {
    coverImageUrl: newCoverUrl ?? existingCoverUrl,
    pdfUrl: newPdfUrl ?? existingPdfUrl,
  };
}

function revalidateKb(categorySlug?: string, articleSlug?: string) {
  revalidatePath("/[locale]/knowledge-base", "page");
  revalidatePath("/[locale]/knowledge-base/[section]", "page");
  if (categorySlug) revalidatePath("/[locale]/knowledge-base/[section]/[categorySlug]", "page");
  if (articleSlug) revalidatePath("/[locale]/knowledge-base/article/[slug]", "page");
}

export async function createKbArticle(_prevState: string | null, formData: FormData) {
  await requireAdmin();
  const fields = readArticleFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (!fields.categoryId) return "Category is required.";
  if (!String(formData.get("title_th") ?? "").trim()) return "Thai title is required.";

  let assets;
  try {
    assets = await readAssetFields(formData, fields.slug, null, null);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload file.";
  }

  let article;
  try {
    article = await prisma.kbArticle.create({ data: { ...fields, ...assets } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.kbArticleTranslation.create({
      data: {
        articleId: article.id,
        locale,
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        summary: String(formData.get(`summary_${locale}`) ?? "").trim(),
        body: String(formData.get(`body_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateKb();
  redirect("/admin/kb-articles");
}

export async function updateKbArticle(
  articleId: number,
  _prevState: string | null,
  formData: FormData
) {
  await requireAdmin();
  const fields = readArticleFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (!fields.categoryId) return "Category is required.";
  if (!String(formData.get("title_th") ?? "").trim()) return "Thai title is required.";

  const existing = await prisma.kbArticle.findUnique({ where: { id: articleId } });
  if (!existing) return "Article not found.";

  let assets;
  try {
    assets = await readAssetFields(formData, fields.slug, existing.coverImageUrl, existing.pdfUrl);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload file.";
  }

  try {
    await prisma.kbArticle.update({ where: { id: articleId }, data: { ...fields, ...assets } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.kbArticleTranslation.upsert({
      where: { articleId_locale: { articleId, locale } },
      create: {
        articleId,
        locale,
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        summary: String(formData.get(`summary_${locale}`) ?? "").trim(),
        body: String(formData.get(`body_${locale}`) ?? "").trim(),
      },
      update: {
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        summary: String(formData.get(`summary_${locale}`) ?? "").trim(),
        body: String(formData.get(`body_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateKb();
  redirect("/admin/kb-articles");
}

export async function deleteKbArticle(articleId: number) {
  await requireAdmin();
  await prisma.kbArticle.delete({ where: { id: articleId } });
  revalidateKb();
  redirect("/admin/kb-articles");
}
