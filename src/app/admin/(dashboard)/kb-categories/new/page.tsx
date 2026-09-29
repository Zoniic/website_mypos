import { CategoryForm } from "../CategoryForm";
import { createKbCategory } from "../actions";

export default function NewKbCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มหมวดคลังความรู้</h1>
      <div className="mt-6">
        <CategoryForm action={createKbCategory} submitLabel="สร้าง" />
      </div>
    </div>
  );
}
