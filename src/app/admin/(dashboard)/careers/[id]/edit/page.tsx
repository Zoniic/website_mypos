import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobPostingForm, type JobPostingFormValues } from "../../JobPostingForm";
import { deleteJobPosting, updateJobPosting } from "../../actions";

export default async function EditJobPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);

  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { translations: true },
  });

  if (!job) notFound();

  const findTranslation = (locale: string) =>
    job.translations.find((t) => t.locale === locale) ?? { title: "", description: "" };

  const initialValues: JobPostingFormValues = {
    slug: job.slug,
    department: job.department,
    location: job.location,
    employmentType: job.employmentType,
    isOpen: job.isOpen,
    translations: {
      th: findTranslation("th"),
      en: findTranslation("en"),
      zh: findTranslation("zh"),
    },
  };

  const boundUpdate = updateJobPosting.bind(null, jobId);
  const boundDelete = deleteJobPosting.bind(null, jobId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Job Posting</h1>
      <div className="mt-6">
        <JobPostingForm action={boundUpdate} initialValues={initialValues} submitLabel="Save Changes" />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Job Posting
        </button>
      </form>
    </div>
  );
}
