"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const locales = ["th", "en", "zh"] as const;

function revalidateAccessoryPaths() {
  revalidatePath("/[locale]/accessories", "page");
}

export async function createAccessory(_prevState: string | null, formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return "Slug is required.";

  const count = await prisma.accessory.count();
  const accessory = await prisma.accessory.create({ data: { slug, sortOrder: count } });

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

  await prisma.accessory.update({ where: { id: accessoryId }, data: { slug } });

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
