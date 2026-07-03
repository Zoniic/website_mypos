import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrustLogoForm, type TrustLogoFormValues } from "../../TrustLogoForm";
import { deleteTrustLogo, updateTrustLogo } from "../../actions";

export default async function EditTrustLogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const logoId = Number(id);

  const logo = await prisma.trustLogo.findUnique({ where: { id: logoId } });
  if (!logo) notFound();

  const initialValues: TrustLogoFormValues = { name: logo.name, imageUrl: logo.imageUrl };
  const boundUpdate = updateTrustLogo.bind(null, logoId);
  const boundDelete = deleteTrustLogo.bind(null, logoId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Trust Logo</h1>
      <div className="mt-6">
        <TrustLogoForm action={boundUpdate} initialValues={initialValues} submitLabel="Save Changes" />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Logo
        </button>
      </form>
    </div>
  );
}
