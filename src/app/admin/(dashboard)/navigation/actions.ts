"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { auditKeyed, readSettingValues } from "@/lib/auditLog";
import type { AdminContextUser } from "@/lib/adminAuth";
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

async function store(admin: AdminContextUser, key: string, value: unknown) {
  const json = JSON.stringify(value);
  const previous = (await readSettingValues([key]))[key] ?? null;
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
  await auditKeyed(admin, "SiteSetting", key, previous, json);
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
  const admin = await requireAdmin();
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

  await store(admin, menu, resolveMenu(menu as MenuKey, data, await getCatalog()));
  return "saved";
}

export async function saveIndustrySolutions(json: string): Promise<string> {
  const admin = await requireAdmin();
  const data = parse(json);
  if (typeof data !== "object" || data === null) return "Data is invalid.";
  await store(admin, "map.industrySolutions", resolveIndustrySolutions(data, await getCatalog()));
  return "saved";
}

export async function saveOnlineSolutions(json: string): Promise<string> {
  const admin = await requireAdmin();
  const data = parse(json);
  if (!Array.isArray(data)) return "Data is invalid.";
  await store(admin, "map.onlineSolutions", resolveOnlineSolutions(data, await getCatalog()));
  return "saved";
}

export async function resetStructure(key: string): Promise<string> {
  const admin = await requireAdmin();
  if (!(STRUCTURE_KEYS as readonly string[]).includes(key)) return "Unknown setting.";
  const previous = (await readSettingValues([key]))[key] ?? null;
  await prisma.siteSetting.deleteMany({ where: { key } });
  await auditKeyed(admin, "SiteSetting", key, previous, null);
  revalidatePath("/admin/navigation");
  return "saved";
}
