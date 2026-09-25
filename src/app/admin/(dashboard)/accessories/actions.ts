"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

const locales = ["th", "en", "zh"] as const;

function revalidateAccessoryPaths() {
  revalidatePath("/[locale]/accessories", "page");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

/** Online price + marketplace links; invalid/empty values become null. */
function readSalesFields(formData: FormData) {
  const priceRaw = String(formData.get("onlinePrice") ?? "").trim();
  const url = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return /^https:\/\/\S+$/.test(value) ? value : null;
  };
  return {
    onlinePrice: /^\d+$/.test(priceRaw) && Number(priceRaw) > 0 ? Number(priceRaw) : null,
    shopeeUrl: url("shopeeUrl"),
    lazadaUrl: url("lazadaUrl"),
  };
}

function readCategories(formData: FormData): string[] {
  return formData
    .getAll("categories")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

export async function createAccessory(_prevState: string | null, formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return "Slug is required.";
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";
  const categories = readCategories(formData);

  let imageUrl: string | null;
  try {
    imageUrl = await saveUploadedImage(formData.get("image") as File | null, "accessories", slug);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }
  if (!imageUrl) return "Photo is required.";

  const count = await prisma.accessory.count();
  let accessory;
  try {
    accessory = await prisma.accessory.create({
      data: {
        slug,
        sortOrder: count,
        imageUrl,
        ...readSalesFields(formData),
        categories: { connect: categories.map((slug) => ({ slug })) },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.accessoryTranslation.create({
      data: {
        accessoryId: accessory.id,
        locale,
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
        description: String(formData.get(`description_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateAccessoryPaths();
  redirect("/admin/accessories");
}

export async function updateAccessory(
  accessoryId: number,
  _prevState: string | null,
  formData: FormData
) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return "Slug is required.";
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";
  const categories = readCategories(formData);

  const existing = await prisma.accessory.findUnique({ where: { id: accessoryId } });
  if (!existing) return "Accessory not found.";

  let imageUrl = existing.imageUrl;
  try {
    const newImageUrl = await saveUploadedImage(
      formData.get("image") as File | null,
      "accessories",
      slug
    );
    if (newImageUrl) imageUrl = newImageUrl;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }
  if (!imageUrl) return "Photo is required.";

  try {
    await prisma.accessory.update({
      where: { id: accessoryId },
      data: {
        slug,
        imageUrl,
        ...readSalesFields(formData),
        categories: { set: categories.map((slug) => ({ slug })) },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.accessoryTranslation.upsert({
      where: { accessoryId_locale: { accessoryId, locale } },
      create: {
        accessoryId,
        locale,
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
        description: String(formData.get(`description_${locale}`) ?? "").trim(),
      },
      update: {
        name: String(formData.get(`name_${locale}`) ?? "").trim(),
        description: String(formData.get(`description_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateAccessoryPaths();
  redirect("/admin/accessories");
}

export async function deleteAccessory(accessoryId: number) {
  await prisma.accessory.delete({ where: { id: accessoryId } });
  revalidateAccessoryPaths();
  redirect("/admin/accessories");
}
