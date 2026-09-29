import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AccessoryForm, type AccessoryFormValues } from "../../AccessoryForm";
import { deleteAccessory, updateAccessory } from "../../actions";
import { getCatalog } from "@/lib/catalog";

export default async function EditAccessoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const catalog = await getCatalog();
  const { id } = await params;
  const accessoryId = Number(id);

  const accessory = await prisma.accessory.findUnique({
    where: { id: accessoryId },
    include: { translations: true, categories: true },
  });

  if (!accessory) notFound();

  const findTranslation = (locale: string) =>
    accessory.translations.find((t) => t.locale === locale) ?? { name: "", description: "" };

  const initialValues: AccessoryFormValues = {
    slug: accessory.slug,
    categories: accessory.categories.map((c) => c.slug),
    imageUrl: accessory.imageUrl,
    onlinePrice: accessory.onlinePrice,
    shopeeUrl: accessory.shopeeUrl ?? "",
    lazadaUrl: accessory.lazadaUrl ?? "",
    translations: {
      th: findTranslation("th"),
      en: findTranslation("en"),
      zh: findTranslation("zh"),
    },
  };

  const boundUpdate = updateAccessory.bind(null, accessoryId);
  const boundDelete = deleteAccessory.bind(null, accessoryId);

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขอุปกรณ์เสริม</h1>
      <div className="mt-6">
        <AccessoryForm
          categoryOptions={catalog.categories}
          action={boundUpdate}
          initialValues={initialValues}
          submitLabel="บันทึก"
        />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Accessory
        </button>
      </form>
    </div>
  );
}
