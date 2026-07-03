import { CategoryForm } from "../CategoryForm";
import { createKbCategory } from "../actions";

export default function NewKbCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Knowledge Base Category</h1>
      <div className="mt-6">
        <CategoryForm action={createKbCategory} submitLabel="Create" />
      </div>
    </div>
  );
}
