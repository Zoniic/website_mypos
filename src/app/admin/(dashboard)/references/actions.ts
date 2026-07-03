"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const locales = ["th", "en", "zh"] as const;

function revalidateReferencePaths() {
  revalidatePath("/[locale]/references", "page");
  revalidatePath("/[locale]/solutions/[slug]", "page");
}

export async function createReference(_prevState: string | null, formData: FormData) {
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!businessType) return "Business type is required.";

  const count = await prisma.referenceCase.count();
  const referenceCase = await prisma.referenceCase.create({
    data: { businessType, sortOrder: count },
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

  await prisma.referenceCase.update({ where: { id: caseId }, data: { businessType } });

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
