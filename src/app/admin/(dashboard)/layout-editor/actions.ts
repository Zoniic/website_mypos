"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { auditKeyed, readSettingValues } from "@/lib/auditLog";
import { isLayoutVariant, isPageKey, layoutSettingKey, parseStoredLayout, resolveLayout } from "@/lib/pageLayout";

/** `variant`: a solution/industry slug to save that page's own layout. */
export async function savePageLayout(page: string, layoutJson: string, variant?: string): Promise<string> {
  const admin = await requireAdmin();
  if (!isPageKey(page)) return "Unknown page.";
  if (variant && !isLayoutVariant(page, variant)) return "Unknown page.";
  const parsed = parseStoredLayout(layoutJson);
  if (!parsed) return "Layout data is invalid.";
  // Normalise against the code's section list before storing.
  const value = JSON.stringify(resolveLayout(page, parsed));
  const key = layoutSettingKey(page, variant);
  const previous = (await readSettingValues([key]))[key] ?? null;
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  await auditKeyed(admin, "SiteSetting", key, previous, value);
  revalidatePath("/admin/layout-editor");
  return "saved";
}

/** Back to the defaults; with `variant`, that page follows the shared layout again. */
export async function resetPageLayout(page: string, variant?: string): Promise<string> {
  const admin = await requireAdmin();
  if (!isPageKey(page)) return "Unknown page.";
  if (variant && !isLayoutVariant(page, variant)) return "Unknown page.";
  const key = layoutSettingKey(page, variant);
  const previous = (await readSettingValues([key]))[key] ?? null;
  await prisma.siteSetting.deleteMany({ where: { key } });
  await auditKeyed(admin, "SiteSetting", key, previous, null);
  revalidatePath("/admin/layout-editor");
  return "saved";
}
