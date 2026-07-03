import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} submitLabel="Create Product" />
      </div>
    </div>
  );
}
