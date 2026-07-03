"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const KEYS = [
  "phone",
  "phoneDisplay",
  "email",
  "lineId",
  "lineUrl",
  "facebookUrl",
  "mapEmbedUrl",
  "statsClients",
  "statsYears",
  "statsSupport",
] as const;

export async function updateSiteSettings(_prevState: string | null, formData: FormData) {
  for (const key of KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  revalidatePath("/[locale]", "layout");
  return "saved";
}
