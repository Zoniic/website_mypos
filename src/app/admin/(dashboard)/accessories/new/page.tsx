import { AccessoryForm } from "../AccessoryForm";
import { createAccessory } from "../actions";
import { getCatalog } from "@/lib/catalog";

export default async function NewAccessoryPage() {
  const catalog = await getCatalog();
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มอุปกรณ์เสริม</h1>
      <div className="mt-6">
        <AccessoryForm
          categoryOptions={catalog.categories}
          action={createAccessory}
          submitLabel="สร้างอุปกรณ์เสริม"
        />
      </div>
    </div>
  );
}
