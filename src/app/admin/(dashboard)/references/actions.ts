"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

const locales = ["th", "en", "zh"] as const;

function revalidateReferencePaths() {
  revalidatePath("/[locale]/references", "page");
  revalidatePath("/[locale]/solutions/[slug]", "page");
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
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";

  let images: { imageUrl: string | null; logoUrl: string | null };
  try {
    images = await readReferenceImageFields(formData, `case-${Date.now()}`, null, null);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  const count = await prisma.referenceCase.count();
  const referenceCase = await prisma.referenceCase.create({
    data: { businessType, sortOrder: count, ...images },
  });

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

  revalidateReferencePaths();
  redirect("/admin/references");
}

export async function updateReference(
  caseId: number,
  _prevState: string | null,
  formData: FormData
) {
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";

  const existing = await prisma.referenceCase.findUnique({ where: { id: caseId } });
  if (!existing) return "Case study not found.";

  let images: { imageUrl: string | null; logoUrl: string | null };
  try {
    images = await readReferenceImageFields(
      formData,
      `case-${caseId}`,
      existing.imageUrl,
      existing.logoUrl
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  await prisma.referenceCase.update({ where: { id: caseId }, data: { businessType, ...images } });

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

  revalidateReferencePaths();
  redirect("/admin/references");
}

export async function deleteReference(caseId: number) {
  await prisma.referenceCase.delete({ where: { id: caseId } });
  revalidateReferencePaths();
  redirect("/admin/references");
}
