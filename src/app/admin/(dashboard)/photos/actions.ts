"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";
import { SITE_IMAGE_SLOTS } from "./slots";

export async function updateSitePhotos(_prevState: string | null, formData: FormData) {
  for (const slot of SITE_IMAGE_SLOTS) {
    let newUrl: string | null;
    try {
      newUrl = await saveUploadedImage(formData.get(slot.key) as File | null, "site", slot.key);
    } catch (error) {
      return error instanceof Error ? error.message : `Failed to upload ${slot.label}.`;
    }
    if (newUrl) {
      await prisma.siteImage.upsert({
        where: { key: slot.key },
        create: { key: slot.key, url: newUrl },
        update: { url: newUrl },
      });
    }
  }

  revalidatePath("/[locale]", "layout");
  return "saved";
}
