import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AccessoryForm, type AccessoryFormValues } from "../../AccessoryForm";
import { deleteAccessory, updateAccessory } from "../../actions";

export default async function EditAccessoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      <h1 className="text-2xl font-bold">Edit Accessory</h1>
      <div className="mt-6">
        <AccessoryForm action={boundUpdate} initialValues={initialValues} submitLabel="Save Changes" />
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
