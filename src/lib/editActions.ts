"use server";

import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/editMode";
import { revalidatePublicSite } from "@/lib/siteCache";
import { saveUploadedImage } from "@/lib/uploads";
import { isLayoutVariant, isPageKey, layoutSettingKey, parseStoredLayout, resolveLayout } from "@/lib/pageLayout";
import { getAllImageSlots } from "@/app/admin/(dashboard)/photos/allSlots";

// Called from public pages in edit mode, where the /admin proxy check doesn't
// apply — every action starts with requireEditor().

const LOCALES = ["th", "en", "zh"] as const;
type Locale = (typeof LOCALES)[number];

export type ContentRow = { namespace: string; key: string; values: Record<Locale, string> };

/** The copy behind a clicked element: its row (by marker id) in all three languages. */
export async function getContentRow(rowId: number): Promise<ContentRow | null> {
  await requireEditor();
  const row = await prisma.pageContent.findUnique({ where: { id: rowId } });
  if (!row) return null;
  const rows = await prisma.pageContent.findMany({ where: { namespace: row.namespace, key: row.key } });
  const values = { th: "", en: "", zh: "" };
  for (const r of rows) if ((LOCALES as readonly string[]).includes(r.locale)) values[r.locale as Locale] = r.value;
  return { namespace: row.namespace, key: row.key, values };
}

export async function saveContentRow(namespace: string, key: string, values: Record<string, string>): Promise<string> {
  await requireEditor();
  const existing = await prisma.pageContent.count({ where: { namespace, key } });
  if (!existing) return "ไม่พบข้อความนี้";
  // Same rule as Page Content: lists/objects must stay valid JSON.
  for (const locale of LOCALES) {
    const value = (values[locale] ?? "").trim();
    if (value.startsWith("[") || value.startsWith("{")) {
      try {
        JSON.parse(value);
      } catch {
        return `รูปแบบรายการภาษา ${locale} ไม่ถูกต้อง ยังไม่ได้บันทึก`;
      }
    }
  }
  for (const locale of LOCALES) {
    if (values[locale] === undefined) continue;
    await prisma.pageContent.upsert({
      where: { namespace_key_locale: { namespace, key, locale } },
      create: { namespace, key, locale, value: values[locale] },
      update: { value: values[locale] },
    });
  }
  revalidatePublicSite();
  return "saved";
}

/** Section order/visibility from the on-page toolbar; \`variant\` = this page only. */
export async function saveSectionLayout(page: string, layoutJson: string, variant?: string): Promise<string> {
  await requireEditor();
  if (!isPageKey(page) || (variant && !isLayoutVariant(page, variant))) return "ไม่รู้จักหน้านี้";
  const parsed = parseStoredLayout(layoutJson);
  if (!parsed) return "ข้อมูลไม่ถูกต้อง";
  const key = layoutSettingKey(page, variant);
  const value = JSON.stringify(resolveLayout(page, parsed));
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  revalidatePublicSite();
  return "saved";
}

/** Replaces the photo in a Site Photos slot (or the logo). */
export async function uploadSlotImage(formData: FormData): Promise<string> {
  await requireEditor();
  const slot = String(formData.get("slot") ?? "");
  if (!(await getAllImageSlots()).some((s) => s.key === slot)) return "ไม่รู้จักตำแหน่งรูปนี้";
  let url: string | null;
  try {
    url = await saveUploadedImage(formData.get("file") as File | null, "site", slot);
  } catch (error) {
    return error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ";
  }
  if (!url) return "เลือกไฟล์รูปก่อน";
  await prisma.siteImage.upsert({ where: { key: slot }, create: { key: slot, url }, update: { url } });
  revalidatePublicSite();
  return "saved";
}
