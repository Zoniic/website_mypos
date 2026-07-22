import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminKbCategoriesPage() {
  const categories = await prisma.kbCategory.findMany({
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    include: { translations: { where: { locale: "en" } }, _count: { select: { articles: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Base Categories</h1>
        <Link
          href="/admin/kb-categories/new"
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Category
        </Link>
      </div>
      <p className="mt-1 text-text-2">
        Hardware / Software sections shown on the public /knowledge-base pages.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Section</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Name (en)</th>
              <th className="px-4 py-3 font-medium">Articles</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 capitalize text-text-2">{category.section}</td>
                <td className="px-4 py-3 font-mono text-xs">{category.slug}</td>
                <td className="px-4 py-3 font-medium">
                  {category.translations[0]?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-text-2">{category._count.articles}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/kb-categories/${category.id}/edit`}
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
