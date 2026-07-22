"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedHeroBackground } from "@/lib/uploads";

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

  let heroVideoUrl: string | null;
  try {
    heroVideoUrl = await saveUploadedHeroBackground(
      formData.get("heroVideoUrl") as File | null,
      "hero",
      "hero-background"
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload hero background.";
  }
  if (heroVideoUrl) {
    await prisma.siteSetting.upsert({
      where: { key: "heroVideoUrl" },
      create: { key: "heroVideoUrl", value: heroVideoUrl },
      update: { value: heroVideoUrl },
    });
  }

  revalidatePath("/[locale]", "layout");
  return "saved";
}
