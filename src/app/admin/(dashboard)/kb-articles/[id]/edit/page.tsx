import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm, type ArticleFormValues } from "../../ArticleForm";
import { deleteKbArticle, updateKbArticle } from "../../actions";

const locales = ["th", "en", "zh"] as const;

export default async function EditKbArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);

  const [article, categories] = await Promise.all([
    prisma.kbArticle.findUnique({ where: { id: articleId }, include: { translations: true } }),
    prisma.kbCategory.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
      include: { translations: { where: { locale: "en" } } },
    }),
  ]);
  if (!article) notFound();

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    section: category.section,
    slug: category.slug,
    name: category.translations[0]?.name ?? category.slug,
  }));

  const initialValues: ArticleFormValues = {
    slug: article.slug,
    categoryId: article.categoryId,
    productSlug: article.productSlug ?? "",
    accessorySlug: article.accessorySlug ?? "",
    videoUrl: article.videoUrl ?? "",
    featured: article.featured,
    coverImageUrl: article.coverImageUrl,
    pdfUrl: article.pdfUrl,
    translations: Object.fromEntries(
      locales.map((locale) => {
        const t = article.translations.find((tr) => tr.locale === locale);
        return [locale, { title: t?.title ?? "", summary: t?.summary ?? "", body: t?.body ?? "" }];
      })
    ) as ArticleFormValues["translations"],
  };

  const boundUpdate = updateKbArticle.bind(null, articleId);
  const boundDelete = deleteKbArticle.bind(null, articleId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Knowledge Base Article</h1>
      <div className="mt-6">
        <ArticleForm
          action={boundUpdate}
          categories={categoryOptions}
          initialValues={initialValues}
          submitLabel="Save Changes"
        />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Article
        </button>
      </form>
    </div>
  );
}
