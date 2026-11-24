"use server";

import { requireAdmin } from "@/lib/adminAuth";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { auditKeyed } from "@/lib/auditLog";
import { saveUploadedImage } from "@/lib/uploads";
import { trashReplacedFiles } from "@/lib/storageCleanup";
import { getAllImageSlots } from "./allSlots";

export async function updateSitePhotos(_prevState: string | null, formData: FormData) {
  const admin = await requireAdmin();
  for (const slot of await getAllImageSlots()) {
    let newUrl: string | null;
    try {
      newUrl = await saveUploadedImage(formData.get(slot.key) as File | null, "site", slot.key);
    } catch (error) {
      return error instanceof Error ? error.message : `Failed to upload ${slot.label}.`;
    }
    if (newUrl) {
      const previous = await prisma.siteImage.findUnique({
        where: { key: slot.key },
        select: { url: true },
      });
      await prisma.siteImage.upsert({
        where: { key: slot.key },
        create: { key: slot.key, url: newUrl },
        update: { url: newUrl },
      });
      await trashReplacedFiles([previous?.url]);
      await auditKeyed(admin, "SiteImage", slot.key, previous?.url ?? null, newUrl);
    }
  }

  revalidatePath("/[locale]", "layout");
  return "saved";
}
