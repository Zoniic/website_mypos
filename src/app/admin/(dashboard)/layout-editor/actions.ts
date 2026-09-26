"use server";

import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { isPageKey, layoutSettingKey, parseStoredLayout, resolveLayout } from "@/lib/pageLayout";

export async function savePageLayout(page: string, layoutJson: string): Promise<string> {
  if (!isPageKey(page)) return "Unknown page.";
  const parsed = parseStoredLayout(layoutJson);
  if (!parsed) return "Layout data is invalid.";
  // Normalise against the code's section list before storing.
  const value = JSON.stringify(resolveLayout(page, parsed));
  const key = layoutSettingKey(page);
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  revalidatePath("/admin/layout-editor");
  return "saved";
}

export async function resetPageLayout(page: string): Promise<string> {
  if (!isPageKey(page)) return "Unknown page.";
  await prisma.siteSetting.deleteMany({ where: { key: layoutSettingKey(page) } });
  revalidatePath("/admin/layout-editor");
  return "saved";
}
