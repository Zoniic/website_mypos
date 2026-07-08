import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReferenceForm, type ReferenceFormValues } from "../../ReferenceForm";
import { deleteReference, updateReference } from "../../actions";

export default async function EditReferencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseId = Number(id);

  const referenceCase = await prisma.referenceCase.findUnique({
    where: { id: caseId },
    include: { translations: true },
  });

  if (!referenceCase) notFound();

  const findTranslation = (locale: string) =>
    referenceCase.translations.find((t) => t.locale === locale) ?? {
      business: "",
      problem: "",
      install: "",
      result: "",
    };

  const initialValues: ReferenceFormValues = {
    businessType: referenceCase.businessType,
    imageUrl: referenceCase.imageUrl,
    logoUrl: referenceCase.logoUrl,
    translations: {
      th: findTranslation("th"),
      en: findTranslation("en"),
      zh: findTranslation("zh"),
    },
  };

  const boundUpdate = updateReference.bind(null, caseId);
  const boundDelete = deleteReference.bind(null, caseId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Case Study</h1>
      <div className="mt-6">
        <ReferenceForm action={boundUpdate} initialValues={initialValues} submitLabel="Save Changes" />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Case Study
        </button>
      </form>
    </div>
  );
}
