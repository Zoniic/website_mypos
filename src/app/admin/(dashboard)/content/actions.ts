"use server";

// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";

const locales = ["th", "en", "zh"] as const;

export async function updateContent(
  namespace: string,
  _prevState: string | null,
  formData: FormData
) {
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

  // Validate every array/object-looking field parses as JSON *before*
  // writing anything, so a typo can't silently corrupt content the site
  // is currently reading (e.g. an FAQ list becoming a broken string).
  for (const update of updates) {
    const trimmed = update.value.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        JSON.parse(trimmed);
      } catch {
        return `Invalid JSON in "${update.key}" (${update.locale}). Nothing was saved — fix this field and try again.`;
      }
    }
  }

  for (const update of updates) {
    await prisma.pageContent.upsert({
      where: { namespace_key_locale: { namespace, key: update.key, locale: update.locale } },
      create: { namespace, key: update.key, locale: update.locale, value: update.value },
      update: { value: update.value },
    });
  }

  revalidatePath("/[locale]", "layout");
  return "saved";
}
