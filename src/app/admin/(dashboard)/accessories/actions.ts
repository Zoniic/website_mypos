"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

const locales = ["th", "en", "zh"] as const;

function revalidateAccessoryPaths() {
  revalidatePath("/[locale]/accessories", "page");
}

export async function createAccessory(_prevState: string | null, formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return "Slug is required.";

  let imageUrl: string | null;
  try {
    imageUrl = await saveUploadedImage(formData.get("image") as File | null, "accessories", slug);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  const count = await prisma.accessory.count();
  const accessory = await prisma.accessory.create({
    data: { slug, sortOrder: count, imageUrl },
  });

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

  await prisma.accessory.update({ where: { id: accessoryId }, data: { slug, imageUrl } });

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
