import { prisma } from "@/lib/prisma";
import { ArticleForm } from "../ArticleForm";
import { createKbArticle } from "../actions";

export default async function NewKbArticlePage() {
  const categories = await prisma.kbCategory.findMany({
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    include: { translations: { where: { locale: "en" } } },
  });

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    section: category.section,
    slug: category.slug,
    name: category.translations[0]?.name ?? category.slug,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">New Knowledge Base Article</h1>
      {categoryOptions.length === 0 ? (
        <p className="mt-4 text-text-2">
          Create a category first under Admin → Knowledge Base Categories.
        </p>
      ) : (
        <div className="mt-6">
          <ArticleForm action={createKbArticle} categories={categoryOptions} submitLabel="Create" />
        </div>
      )}
    </div>
  );
}
