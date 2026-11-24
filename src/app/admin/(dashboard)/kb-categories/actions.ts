"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { emojiFormError } from "@/lib/emoji";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { slugFormError } from "@/lib/slug";

const locales = ["th", "en", "zh"] as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function revalidateKb() {
  revalidatePath("/[locale]/knowledge-base", "page");
  revalidatePath("/[locale]/knowledge-base/[section]", "page");
}

export async function createKbCategory(_prevState: string | null, formData: FormData) {
  const admin = await requireAdmin();
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const slug = String(formData.get("slug") ?? "").trim();
  const section = String(formData.get("section") ?? "hardware").trim();
  const slugError = slugFormError(slug);
  if (slugError) return slugError;
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";

  const count = await prisma.kbCategory.count({ where: { section } });

  let category;
  try {
    category = await prisma.kbCategory.create({ data: { slug, section, sortOrder: count } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.kbCategoryTranslation.create({
      data: {
        categoryId: category.id,
        locale,
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateKb();
  await auditEntity(admin, "KbCategory", null, await loadSnapshot("KbCategory", category.id));
  redirect("/admin/kb-categories");
}

export async function updateKbCategory(
  categoryId: number,
  _prevState: string | null,
  formData: FormData
) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("KbCategory", categoryId);
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const slug = String(formData.get("slug") ?? "").trim();
  const section = String(formData.get("section") ?? "hardware").trim();
  const slugError = slugFormError(slug);
  if (slugError) return slugError;
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";

  try {
    await prisma.kbCategory.update({ where: { id: categoryId }, data: { slug, section } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.kbCategoryTranslation.upsert({
      where: { categoryId_locale: { categoryId, locale } },
      create: { categoryId, locale, name: String(formData.get(`name_${locale}`) ?? "").trim() },
      update: { name: String(formData.get(`name_${locale}`) ?? "").trim() },
    });
  }

  revalidateKb();
  await auditEntity(admin, "KbCategory", before, await loadSnapshot("KbCategory", categoryId));
  redirect("/admin/kb-categories");
}

export async function deleteKbCategory(categoryId: number) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("KbCategory", categoryId);
  const articleCount = await prisma.kbArticle.count({ where: { categoryId } });
  if (articleCount > 0) {
    throw new Error(
      `Cannot delete: ${articleCount} article(s) still use this category. Move or delete them first.`
    );
  }
  await prisma.kbCategory.delete({ where: { id: categoryId } });
  await auditEntity(admin, "KbCategory", before, null);
  revalidateKb();
  redirect("/admin/kb-categories");
}
