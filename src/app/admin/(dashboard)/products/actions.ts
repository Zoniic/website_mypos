"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

const locales = ["th", "en", "zh"] as const;
const GALLERY_SLOTS = 3;

function readProductFields(formData: FormData) {
  const priceRaw = String(formData.get("priceFrom") ?? "").trim();
  const warrantyRaw = String(formData.get("warrantyMonths") ?? "").trim();
  const leadTimeRaw = String(formData.get("leadTimeDays") ?? "").trim();
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    priceFrom: priceRaw ? Number(priceRaw) : 0,
    categories: formData
      .getAll("categories")
      .map((v) => String(v).trim())
      .filter(Boolean),
    os: String(formData.get("os") ?? "Android"),
    screenSize: String(formData.get("screenSize") ?? "").trim(),
    cpu: String(formData.get("cpu") ?? "").trim(),
    ram: String(formData.get("ram") ?? "").trim(),
    storage: String(formData.get("storage") ?? "").trim(),
    connectivity: String(formData.get("connectivity") ?? "").trim(),
    dimensions: String(formData.get("dimensions") ?? "").trim(),
    weight: String(formData.get("weight") ?? "").trim(),
    warrantyMonths: warrantyRaw ? Number(warrantyRaw) : 12,
    datasheetUrl: String(formData.get("datasheetUrl") ?? "").trim() || null,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    stockStatus: String(formData.get("stockStatus") ?? "in_stock"),
    leadTimeDays: leadTimeRaw ? Number(leadTimeRaw) : null,
    featured: formData.get("featured") === "on",
    businessTypes: formData
      .getAll("businessTypes")
      .map((v) => String(v).trim())
      .filter(Boolean),
    relatedSlugs: formData
      .getAll("relatedSlugs")
      .map((v) => String(v).trim())
      .filter(Boolean),
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function readImageFields(
  formData: FormData,
  slug: string,
  existingImageUrl: string | null,
  existingGalleryUrls: string[]
) {
  const mainFile = formData.get("mainImage") as File | null;
  const newMainUrl = await saveUploadedImage(mainFile, "products", slug);
  const imageUrl = newMainUrl ?? existingImageUrl;

  const galleryUrls: string[] = [];
  for (let i = 0; i < GALLERY_SLOTS; i++) {
    const file = formData.get(`galleryImage${i + 1}`) as File | null;
    const newUrl = await saveUploadedImage(file, "products", `${slug}-gallery-${i + 1}`);
    const url = newUrl ?? existingGalleryUrls[i];
    if (url) galleryUrls.push(url);
  }

  return { imageUrl, galleryUrls: galleryUrls.join(",") };
}

function revalidateProductPaths(slug: string) {
  revalidatePath("/[locale]/products", "page");
  revalidatePath(`/[locale]/products/${slug}`, "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/solutions/[slug]", "page");
}

export async function createProduct(_prevState: string | null, formData: FormData) {
  const fields = readProductFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (fields.categories.length === 0) return "Select at least one category.";
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";

  let images: { imageUrl: string | null; galleryUrls: string };
  try {
    images = await readImageFields(formData, fields.slug, null, []);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }
  if (!images.imageUrl) return "Main photo is required.";

  const { categories, businessTypes, relatedSlugs, ...scalarFields } = fields;

  let product;
  try {
    product = await prisma.product.create({
      data: {
        ...scalarFields,
        ...images,
        categories: { connect: categories.map((slug) => ({ slug })) },
        businessTypes: { connect: businessTypes.map((slug) => ({ slug })) },
        relatedProducts: { connect: relatedSlugs.map((slug) => ({ slug })) },
        relatedProductsBack: { connect: relatedSlugs.map((slug) => ({ slug })) },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale,
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
        highlight: String(formData.get(`highlight_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateProductPaths(fields.slug);
  redirect("/admin/products");
}

export async function updateProduct(
  productId: number,
  _prevState: string | null,
  formData: FormData
) {
  const fields = readProductFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (fields.categories.length === 0) return "Select at least one category.";
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return "Product not found.";

  let images: { imageUrl: string | null; galleryUrls: string };
  try {
    images = await readImageFields(
      formData,
      fields.slug,
      existing.imageUrl,
      existing.galleryUrls.split(",").filter(Boolean)
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }
  if (!images.imageUrl) return "Main photo is required.";

  const { categories, businessTypes, relatedSlugs, ...scalarFields } = fields;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        ...scalarFields,
        ...images,
        categories: { set: categories.map((slug) => ({ slug })) },
        businessTypes: { set: businessTypes.map((slug) => ({ slug })) },
        relatedProducts: { set: relatedSlugs.map((slug) => ({ slug })) },
        relatedProductsBack: { set: relatedSlugs.map((slug) => ({ slug })) },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId, locale } },
      create: {
        productId,
        locale,
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
        highlight: String(formData.get(`highlight_${locale}`) ?? "").trim(),
      },
      update: {
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
        highlight: String(formData.get(`highlight_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateProductPaths(fields.slug);
  redirect("/admin/products");
}

export async function deleteProduct(productId: number) {
  const product = await prisma.product.delete({ where: { id: productId } });
  revalidateProductPaths(product.slug);
  redirect("/admin/products");
}
