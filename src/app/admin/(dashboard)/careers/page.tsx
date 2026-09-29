import Link from "next/link";
import { AdminGuide } from "../AdminGuide";
import { prisma } from "@/lib/prisma";

export default async function AdminCareersPage() {
  const jobs = await prisma.jobPosting.findMany({
    include: { translations: { where: { locale: "th" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ร่วมงานกับเรา</h1>
        <Link
          href="/admin/careers/new"
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Job Posting
        </Link>
      </div>
      <AdminGuide section="careers" />

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Open</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-4 py-3 font-medium">{job.translations[0]?.title}</td>
                <td className="px-4 py-3 text-text-2">{job.department}</td>
                <td className="px-4 py-3 text-text-2">{job.location}</td>
                <td className="px-4 py-3">{job.isOpen ? "Yes" : ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/careers/${job.id}/edit`} className="text-primary-600 rounded-sm outline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
