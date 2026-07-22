import Image from "next/image";
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
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Case Study
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Logo</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <div className="relative h-10 w-14 overflow-hidden rounded-md bg-surface-0">
                    {c.imageUrl && (
                      <Image src={c.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{c.translations[0]?.business}</td>
                <td className="px-4 py-3 font-mono text-text-2">{c.slug}</td>
                <td className="px-4 py-3 text-text-2">{c.businessType}</td>
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-surface-0">
                    {c.logoUrl && (
                      <Image src={c.logoUrl} alt="" fill sizes="40px" className="object-contain p-1" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/references/${c.id}/edit`}
                    className="text-primary-600 rounded-sm outline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
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
