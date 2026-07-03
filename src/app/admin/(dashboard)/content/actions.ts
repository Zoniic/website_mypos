"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const locales = ["th", "en", "zh"] as const;

export async function updateContent(namespace: string, formData: FormData) {
  const updates: { key: string; locale: string; value: string }[] = [];

  for (const [fieldName, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const separatorIndex = fieldName.lastIndexOf("__");
    if (separatorIndex === -1) continue;
    const key = fieldName.slice(0, separatorIndex);
    const locale = fieldName.slice(separatorIndex + 2);
    if (!locales.includes(locale as (typeof locales)[number])) continue;
    updates.push({ key, locale, value });
  }

  for (const update of updates) {
    await prisma.pageContent.upsert({
      where: { namespace_key_locale: { namespace, key: update.key, locale: update.locale } },
      create: { namespace, key: update.key, locale: update.locale, value: update.value },
      update: { value: update.value },
    });
  }

  revalidatePath("/[locale]", "layout");
  redirect(`/admin/content/${namespace}?saved=1`);
}
