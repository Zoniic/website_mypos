import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm, type CategoryFormValues } from "../../CategoryForm";
import { deleteKbCategory, updateKbCategory } from "../../actions";

const locales = ["th", "en", "zh"] as const;

export default async function EditKbCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);

  const category = await prisma.kbCategory.findUnique({
    where: { id: categoryId },
    include: { translations: true },
  });
  if (!category) notFound();

  const initialValues: CategoryFormValues = {
    slug: category.slug,
    section: category.section as "hardware" | "software",
    translations: Object.fromEntries(
      locales.map((locale) => [
        locale,
        { name: category.translations.find((t) => t.locale === locale)?.name ?? "" },
      ])
    ) as CategoryFormValues["translations"],
  };

  const boundUpdate = updateKbCategory.bind(null, categoryId);
  const boundDelete = deleteKbCategory.bind(null, categoryId);

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขหมวดคลังความรู้</h1>
      <div className="mt-6">
        <CategoryForm action={boundUpdate} initialValues={initialValues} submitLabel="บันทึก" />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Category
        </button>
      </form>
    </div>
  );
}
