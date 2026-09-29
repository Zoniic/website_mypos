import { ReferenceForm } from "../ReferenceForm";
import { createReference } from "../actions";
import { getCatalog } from "@/lib/catalog";

export default async function NewReferencePage() {
  const catalog = await getCatalog();
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มผลงานลูกค้า</h1>
      <div className="mt-6">
        <ReferenceForm
          businessTypes={catalog.businessTypes.map((b) => b.slug)}
          action={createReference}
          submitLabel="สร้างผลงานลูกค้า"
        />
      </div>
    </div>
  );
}
