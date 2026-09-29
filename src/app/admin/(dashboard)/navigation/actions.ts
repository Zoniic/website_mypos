"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/catalog";
import {
  CUSTOM_PREFIX,
  MENU_ALLOWS_CUSTOM,
  MENU_KEYS,
  STRUCTURE_KEYS,
  isValidHref,
  resolveIndustrySolutions,
  resolveMenu,
  resolveOnlineSolutions,
  type MenuKey,
} from "@/lib/siteStructure";

async function store(key: string, value: unknown) {
  const json = JSON.stringify(value);
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
  revalidatePath("/admin/navigation");
}

function parse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

export async function saveMenu(menu: string, json: string): Promise<string> {
  await requireAdmin();
  if (!(MENU_KEYS as readonly string[]).includes(menu)) return "Unknown menu.";
  const data = parse(json);
  if (!Array.isArray(data)) return "Menu data is invalid.";

  // Report bad custom links instead of silently dropping them.
  const errors: string[] = [];
  for (const group of data as { items?: { key?: string; href?: string; label?: { th?: string } }[] }[]) {
    for (const item of group.items ?? []) {
      if (!String(item.key ?? "").startsWith(CUSTOM_PREFIX)) continue;
      if (!MENU_ALLOWS_CUSTOM[menu as MenuKey]) errors.push("This menu doesn't take custom links.");
      if (!item.label?.th?.trim()) errors.push(`A custom link (${item.href || "no link"}) needs a Thai label.`);
      if (!isValidHref(String(item.href ?? "").trim())) {
        errors.push(`"${item.href ?? ""}" isn't a valid link: use a site path like /contact or a full https:// URL.`);
      }
    }
  }
  if (errors.length) return [...new Set(errors)].join("\n");

  await store(menu, resolveMenu(menu as MenuKey, data, await getCatalog()));
  return "saved";
}

export async function saveIndustrySolutions(json: string): Promise<string> {
  await requireAdmin();
  const data = parse(json);
  if (typeof data !== "object" || data === null) return "Data is invalid.";
  await store("map.industrySolutions", resolveIndustrySolutions(data, await getCatalog()));
  return "saved";
}

export async function saveOnlineSolutions(json: string): Promise<string> {
  await requireAdmin();
  const data = parse(json);
  if (!Array.isArray(data)) return "Data is invalid.";
  await store("map.onlineSolutions", resolveOnlineSolutions(data, await getCatalog()));
  return "saved";
}

export async function resetStructure(key: string): Promise<string> {
  await requireAdmin();
  if (!(STRUCTURE_KEYS as readonly string[]).includes(key)) return "Unknown setting.";
  await prisma.siteSetting.deleteMany({ where: { key } });
  revalidatePath("/admin/navigation");
  return "saved";
}
