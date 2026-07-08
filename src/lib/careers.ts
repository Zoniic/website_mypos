import { prisma } from "@/lib/prisma";

export type JobPostingSummary = {
  id: number;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  title: string;
};

export type JobPosting = JobPostingSummary & { description: string };

type RowWithTranslations = {
  id: number;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  translations: { title: string; description?: string }[];
};

function toSummary(row: RowWithTranslations): JobPostingSummary {
  const translation = row.translations[0];
  return {
    id: row.id,
    slug: row.slug,
    department: row.department,
    location: row.location,
    employmentType: row.employmentType,
    title: translation?.title ?? row.slug,
  };
}

export async function getOpenJobPostings(locale: string): Promise<JobPostingSummary[]> {
  const rows = await prisma.jobPosting.findMany({
    where: { isOpen: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { translations: { where: { locale } } },
  });
  return rows.map(toSummary);
}

export async function getJobPostingBySlug(slug: string, locale: string): Promise<JobPosting | null> {
  const row = await prisma.jobPosting.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });
  if (!row) return null;
  return { ...toSummary(row), description: row.translations[0]?.description ?? "" };
}
