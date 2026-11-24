"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { emojiFormError } from "@/lib/emoji";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { saveUploadedImage } from "@/lib/uploads";
import { trashReplacedFiles } from "@/lib/storageCleanup";
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

function revalidateReferencePaths(slug?: string) {
  revalidatePath("/[locale]/references", "page");
  revalidatePath("/[locale]/solutions/[slug]", "page");
  if (slug) revalidatePath(`/[locale]/references/${slug}`, "page");
}

async function readReferenceImageFields(
  formData: FormData,
  baseName: string,
  existingImageUrl: string | null,
  existingLogoUrl: string | null
) {
  const siteImageFile = formData.get("siteImage") as File | null;
  const logoImageFile = formData.get("logoImage") as File | null;

  const newImageUrl = await saveUploadedImage(siteImageFile, "references", baseName);
  const newLogoUrl = await saveUploadedImage(logoImageFile, "references", `${baseName}-logo`);

  return {
    imageUrl: newImageUrl ?? existingImageUrl,
    logoUrl: newLogoUrl ?? existingLogoUrl,
  };
}

export async function createReference(_prevState: string | null, formData: FormData) {
  const admin = await requireAdmin();
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const slug = String(formData.get("slug") ?? "").trim();
  const slugError = slugFormError(slug);
  if (slugError) return slugError;
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";
  if (!String(formData.get("business_th") ?? "").trim()) return "Thai business name is required.";

  let images: { imageUrl: string | null; logoUrl: string | null };
  try {
    images = await readReferenceImageFields(formData, slug, null, null);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }
  if (!images.imageUrl) return "Site photo is required.";

  const count = await prisma.referenceCase.count();
  let referenceCase;
  try {
    referenceCase = await prisma.referenceCase.create({
      data: { slug, businessType, sortOrder: count, ...images },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.referenceCaseTranslation.create({
      data: {
        caseId: referenceCase.id,
        locale,
        business: String(formData.get(`business_${locale}`) ?? "").trim(),
        problem: String(formData.get(`problem_${locale}`) ?? "").trim(),
        install: String(formData.get(`install_${locale}`) ?? "").trim(),
        result: String(formData.get(`result_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateReferencePaths(slug);
  await auditEntity(admin, "ReferenceCase", null, await loadSnapshot("ReferenceCase", referenceCase.id));
  redirect("/admin/references");
}

export async function updateReference(
  caseId: number,
  _prevState: string | null,
  formData: FormData
) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("ReferenceCase", caseId);
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const slug = String(formData.get("slug") ?? "").trim();
  const slugError = slugFormError(slug);
  if (slugError) return slugError;
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";
  if (!String(formData.get("business_th") ?? "").trim()) return "Thai business name is required.";

  const existing = await prisma.referenceCase.findUnique({ where: { id: caseId } });
  if (!existing) return "Case study not found.";

  let images: { imageUrl: string | null; logoUrl: string | null };
  try {
    images = await readReferenceImageFields(formData, slug, existing.imageUrl, existing.logoUrl);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }
  if (!images.imageUrl) return "Site photo is required.";

  try {
    await prisma.referenceCase.update({ where: { id: caseId }, data: { slug, businessType, ...images } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.referenceCaseTranslation.upsert({
      where: { caseId_locale: { caseId, locale } },
      create: {
        caseId,
        locale,
        business: String(formData.get(`business_${locale}`) ?? "").trim(),
        problem: String(formData.get(`problem_${locale}`) ?? "").trim(),
        install: String(formData.get(`install_${locale}`) ?? "").trim(),
        result: String(formData.get(`result_${locale}`) ?? "").trim(),
      },
      update: {
        business: String(formData.get(`business_${locale}`) ?? "").trim(),
        problem: String(formData.get(`problem_${locale}`) ?? "").trim(),
        install: String(formData.get(`install_${locale}`) ?? "").trim(),
        result: String(formData.get(`result_${locale}`) ?? "").trim(),
      },
    });
  }

  await trashReplacedFiles([
    existing.imageUrl !== images.imageUrl ? existing.imageUrl : null,
    existing.logoUrl !== images.logoUrl ? existing.logoUrl : null,
  ]);

  revalidateReferencePaths(slug);
  await auditEntity(admin, "ReferenceCase", before, await loadSnapshot("ReferenceCase", caseId));
  redirect("/admin/references");
}

export async function deleteReference(caseId: number) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("ReferenceCase", caseId);
  const deleted = await prisma.referenceCase.delete({ where: { id: caseId } });
  await auditEntity(admin, "ReferenceCase", before, null);
  await trashReplacedFiles([deleted.imageUrl, deleted.logoUrl]);
  revalidateReferencePaths();
  redirect("/admin/references");
}
