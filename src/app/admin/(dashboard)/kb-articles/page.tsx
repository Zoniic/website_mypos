import Link from "next/link";
import { AdminGuide } from "../AdminGuide";
import { prisma } from "@/lib/prisma";

export default async function AdminKbArticlesPage() {
  const articles = await prisma.kbArticle.findMany({
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: { translations: { where: { locale: "en" } }, category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Base Articles</h1>
        <Link
          href="/admin/kb-articles/new"
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Article
        </Link>
      </div>
      <AdminGuide section="kbArticles" />

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Title (en)</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="px-4 py-3 font-medium">
                  {article.translations[0]?.title ?? "—"}
                </td>
                <td className="px-4 py-3 text-text-2">
                  [{article.category.section}] {article.category.slug}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{article.slug}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/kb-articles/${article.id}/edit`}
                    className="text-primary-600 rounded-sm outline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <p className="p-6 text-center text-text-2">
            No articles yet. Create a category first, then add articles.
          </p>
        )}
      </div>
    </div>
  );
}
