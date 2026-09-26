"use server";

// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const locales = ["th", "en", "zh"] as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function readJobFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    department: String(formData.get("department") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    employmentType: String(formData.get("employmentType") ?? "full-time"),
    isOpen: formData.get("isOpen") === "on",
  };
}

function revalidateCareerPaths(slug?: string) {
  revalidatePath("/[locale]/careers", "page");
  if (slug) revalidatePath(`/[locale]/careers/${slug}`, "page");
}

export async function createJobPosting(_prevState: string | null, formData: FormData) {
  const fields = readJobFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (!fields.department) return "Department is required.";
  if (!String(formData.get("title_th") ?? "").trim()) return "Thai title is required.";

  const count = await prisma.jobPosting.count();
  let job;
  try {
    job = await prisma.jobPosting.create({ data: { ...fields, sortOrder: count } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.jobPostingTranslation.create({
      data: {
        jobId: job.id,
        locale,
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        description: String(formData.get(`description_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateCareerPaths();
  redirect("/admin/careers");
}

export async function updateJobPosting(jobId: number, _prevState: string | null, formData: FormData) {
  const fields = readJobFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (!fields.department) return "Department is required.";
  if (!String(formData.get("title_th") ?? "").trim()) return "Thai title is required.";

  const existing = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!existing) return "Job posting not found.";

  try {
    await prisma.jobPosting.update({ where: { id: jobId }, data: fields });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.jobPostingTranslation.upsert({
      where: { jobId_locale: { jobId, locale } },
      create: {
        jobId,
        locale,
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        description: String(formData.get(`description_${locale}`) ?? "").trim(),
      },
      update: {
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        description: String(formData.get(`description_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateCareerPaths(fields.slug);
  redirect("/admin/careers");
}

export async function deleteJobPosting(jobId: number) {
  await prisma.jobPosting.delete({ where: { id: jobId } });
  revalidateCareerPaths();
  redirect("/admin/careers");
}
