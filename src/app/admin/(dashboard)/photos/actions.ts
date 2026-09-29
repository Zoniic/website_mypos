"use server";

import { requireAdmin } from "@/lib/adminAuth";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";
import { getAllImageSlots } from "./allSlots";

export async function updateSitePhotos(_prevState: string | null, formData: FormData) {
  await requireAdmin();
  for (const slot of await getAllImageSlots()) {
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
