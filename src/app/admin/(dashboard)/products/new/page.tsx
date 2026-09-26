import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";
import { getCatalog } from "@/lib/catalog";

export default async function NewProductPage() {
  const catalog = await getCatalog();
  const products = await prisma.product.findMany({
    include: { translations: { where: { locale: "th" } } },
    orderBy: { id: "asc" },
  });

  const relatedProductOptions = products.map((p) => ({
    slug: p.slug,
    name: p.translations[0]?.name ?? p.slug,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">New Product</h1>
      <div className="mt-6">
        <ProductForm
          categoryOptions={catalog.categories}
          businessTypeOptions={catalog.businessTypes.map((b) => b.slug)}
          action={createProduct}
          relatedProductOptions={relatedProductOptions}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}
