import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminReferencesPage() {
  const cases = await prisma.referenceCase.findMany({
    include: { translations: { where: { locale: "th" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Case Studies</h1>
        <Link
          href="/admin/references/new"
          className="rounded-button bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-text-1 shadow-[var(--shadow-glow-primary)]"
        >
          + New Case Study
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.translations[0]?.business}</td>
                <td className="px-4 py-3 text-text-2">{c.businessType}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/references/${c.id}/edit`}
                    className="text-primary-400 hover:underline"
                  >
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
