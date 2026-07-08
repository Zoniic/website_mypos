import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormValues } from "../../ProductForm";
import { deleteProduct, updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  const [product, otherProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: true,
        categories: true,
        businessTypes: true,
        relatedProducts: { select: { slug: true } },
      },
    }),
    prisma.product.findMany({
      where: { id: { not: productId } },
      include: { translations: { where: { locale: "th" } } },
      orderBy: { id: "asc" },
    }),
  ]);

  if (!product) notFound();

  const findTranslation = (locale: string) =>
    product.translations.find((t) => t.locale === locale) ?? { name: "", highlight: "" };

  const initialValues: ProductFormValues = {
    slug: product.slug,
    priceFrom: product.priceFrom,
    categories: product.categories.map((c) => c.slug),
    os: product.os,
    screenSize: product.screenSize,
    cpu: product.cpu,
    ram: product.ram,
    storage: product.storage,
    connectivity: product.connectivity,
    dimensions: product.dimensions,
    weight: product.weight,
    warrantyMonths: product.warrantyMonths,
    datasheetUrl: product.datasheetUrl ?? "",
    featured: product.featured,
    businessTypes: product.businessTypes.map((b) => b.slug),
    relatedSlugs: product.relatedProducts.map((p) => p.slug),
    imageUrl: product.imageUrl,
    galleryUrls: product.galleryUrls.split(",").filter(Boolean),
    translations: {
      th: findTranslation("th"),
      en: findTranslation("en"),
      zh: findTranslation("zh"),
    },
  };

  const relatedProductOptions = otherProducts.map((p) => ({
    slug: p.slug,
    name: p.translations[0]?.name ?? p.slug,
  }));

  const boundUpdate = updateProduct.bind(null, productId);
  const boundDelete = deleteProduct.bind(null, productId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <div className="mt-6">
        <ProductForm
          action={boundUpdate}
          initialValues={initialValues}
          relatedProductOptions={relatedProductOptions}
          submitLabel="Save Changes"
        />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <p className="text-sm text-text-2">Deleting a product removes it permanently.</p>
        <button
          type="submit"
          className="mt-2 rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Product
        </button>
      </form>
    </div>
  );
}
