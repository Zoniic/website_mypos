"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

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
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return "Slug is required.";
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";

  let images: { imageUrl: string | null; logoUrl: string | null };
  try {
    images = await readReferenceImageFields(formData, slug, null, null);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

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
  redirect("/admin/references");
}

export async function updateReference(
  caseId: number,
  _prevState: string | null,
  formData: FormData
) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return "Slug is required.";
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";

  const existing = await prisma.referenceCase.findUnique({ where: { id: caseId } });
  if (!existing) return "Case study not found.";

  let images: { imageUrl: string | null; logoUrl: string | null };
  try {
    images = await readReferenceImageFields(formData, slug, existing.imageUrl, existing.logoUrl);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

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

  revalidateReferencePaths(slug);
  redirect("/admin/references");
}

export async function deleteReference(caseId: number) {
  await prisma.referenceCase.delete({ where: { id: caseId } });
  revalidateReferencePaths();
  redirect("/admin/references");
}
