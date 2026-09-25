import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/lib/siteSettings";
import { cleanPromptPayId } from "@/lib/trackingIds";

export const ORDER_STATUSES = ["pending_payment", "paid", "preparing", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["promptpay", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type CatalogEntry = { kind: "product" | "accessory"; slug: string; name: string; price: number; imageUrl: string | null };

/** Everything currently sold online, keyed "kind:slug", with names in `locale`. */
export async function getOnlineCatalog(locale: string): Promise<Record<string, CatalogEntry>> {
  const [products, accessories] = await Promise.all([
    prisma.product.findMany({
      where: { onlinePrice: { not: null } },
      include: { translations: { where: { locale } } },
    }),
    prisma.accessory.findMany({
      where: { onlinePrice: { not: null } },
      include: { translations: { where: { locale } } },
    }),
  ]);
  const catalog: Record<string, CatalogEntry> = {};
  for (const p of products) {
    catalog[`product:${p.slug}`] = { kind: "product", slug: p.slug, name: p.translations[0]?.name ?? p.slug, price: p.onlinePrice!, imageUrl: p.imageUrl };
  }
  for (const a of accessories) {
    catalog[`accessory:${a.slug}`] = { kind: "accessory", slug: a.slug, name: a.translations[0]?.name ?? a.slug, price: a.onlinePrice!, imageUrl: a.imageUrl };
  }
  return catalog;
}

/** Payment methods the admin has actually set up. */
export function availablePaymentMethods(settings: SiteSettings): PaymentMethod[] {
  const methods: PaymentMethod[] = [];
  if (cleanPromptPayId(settings.promptpayId)) methods.push("promptpay");
  if (settings.bankAccountNumber.trim()) methods.push("bank_transfer");
  return methods;
}

/** e.g. "MP260926-48213": date for humans on the phone, random tail against guessing. */
export function newOrderNumber(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `MP${yy}${mm}${dd}-${randomInt(10000, 100000)}`;
}

export function newAccessToken(): string {
  return randomBytes(18).toString("base64url");
}

export function tokenMatches(expected: string, given: string | undefined): boolean {
  if (!given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}
