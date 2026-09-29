import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PartnerForm, type PartnerFormValues } from "../../PartnerForm";
import { deleteOfficialPartner, updateOfficialPartner } from "../../actions";

export default async function EditOfficialPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partnerId = Number(id);

  const partner = await prisma.officialPartner.findUnique({ where: { id: partnerId } });
  if (!partner) notFound();

  const initialValues: PartnerFormValues = {
    name: partner.name,
    websiteUrl: partner.websiteUrl ?? "",
    imageUrl: partner.imageUrl,
  };
  const boundUpdate = updateOfficialPartner.bind(null, partnerId);
  const boundDelete = deleteOfficialPartner.bind(null, partnerId);

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขพาร์ทเนอร์</h1>
      <div className="mt-6">
        <PartnerForm action={boundUpdate} initialValues={initialValues} submitLabel="บันทึก" />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Partner
        </button>
      </form>
    </div>
  );
}
