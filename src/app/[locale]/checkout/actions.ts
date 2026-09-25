"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, isOnlineOrderingOn, shippingFeeFor } from "@/lib/siteSettings";
import { isRateLimited, recordAttempt } from "@/lib/rateLimit";
import {
  PAYMENT_METHODS,
  availablePaymentMethods,
  getOnlineCatalog,
  newAccessToken,
  newOrderNumber,
  type PaymentMethod,
} from "@/lib/orders";

export type CheckoutError =
  | "closed"
  | "rateLimited"
  | "empty"
  | "itemsChanged"
  | "invalid"
  | "payment"
  | "server";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; error: CheckoutError; fields?: string[] }
  | { status: "success"; number: string; token: string };

const MAX_LINES = 50;

type CartLine = { kind: string; slug: string; quantity: number };

function parseCart(raw: string): CartLine[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > MAX_LINES) return null;
    const lines: CartLine[] = [];
    for (const entry of parsed) {
      if (typeof entry !== "object" || entry === null) return null;
      const { kind, slug, quantity } = entry as Record<string, unknown>;
      if ((kind !== "product" && kind !== "accessory") || typeof slug !== "string" || slug.length > 120) return null;
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) return null;
      lines.push({ kind, slug, quantity: qty });
    }
    return lines;
  } catch {
    return null;
  }
}

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const settings = await getSiteSettings();
  if (!isOnlineOrderingOn(settings)) return { status: "error", error: "closed" };

  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "")) return { status: "error", error: "invalid" };

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  const limitKey = `order:${ip}`;
  if (isRateLimited(limitKey)) return { status: "error", error: "rateLimited" };

  const locale = ["th", "en", "zh"].includes(String(formData.get("locale"))) ? String(formData.get("locale")) : "th";
  const get = (key: string, max = 200) => String(formData.get(key) ?? "").trim().slice(0, max);

  const customerName = get("name", 120);
  const phone = get("phone", 20).replace(/[\s-]/g, "");
  const email = get("email", 160);
  const address = get("address", 600);
  const postcode = get("postcode", 5);
  const note = get("note", 1000) || null;
  const paymentMethod = get("paymentMethod") as PaymentMethod;
  const wantsTaxInvoice = formData.get("wantsTaxInvoice") === "on";
  const taxName = wantsTaxInvoice ? get("taxName", 200) : "";
  const taxId = wantsTaxInvoice ? get("taxId", 20).replace(/[\s-]/g, "") : "";
  const taxBranch = wantsTaxInvoice ? get("taxBranch", 100) || "สำนักงานใหญ่" : "";
  const taxAddress = wantsTaxInvoice ? get("taxAddress", 600) || address : "";

  const invalid: string[] = [];
  if (!customerName) invalid.push("name");
  if (!/^0\d{8,9}$/.test(phone)) invalid.push("phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) invalid.push("email");
  if (address.length < 10) invalid.push("address");
  if (!/^\d{5}$/.test(postcode)) invalid.push("postcode");
  if (wantsTaxInvoice && !taxName) invalid.push("taxName");
  if (wantsTaxInvoice && !/^\d{13}$/.test(taxId)) invalid.push("taxId");
  if (formData.get("acceptTerms") !== "on") invalid.push("acceptTerms");
  if (invalid.length) return { status: "error", error: "invalid", fields: invalid };

  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod) || !availablePaymentMethods(settings).includes(paymentMethod)) {
    return { status: "error", error: "payment" };
  }

  const lines = parseCart(String(formData.get("cart") ?? "[]"));
  if (!lines || lines.length === 0) return { status: "error", error: "empty" };

  // Prices and names come from the database, never from the browser.
  const catalog = await getOnlineCatalog(locale);
  const items = [];
  for (const line of lines) {
    const entry = catalog[`${line.kind}:${line.slug}`];
    if (!entry) return { status: "error", error: "itemsChanged" };
    items.push({ kind: entry.kind, slug: entry.slug, name: entry.name, unitPrice: entry.price, quantity: line.quantity });
  }
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = shippingFeeFor(settings, subtotal);
  const total = subtotal + shippingFee;

  recordAttempt(limitKey);

  // Retry on the (very unlikely) order-number collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = newOrderNumber();
    const accessToken = newAccessToken();
    try {
      await prisma.order.create({
        data: {
          number,
          accessToken,
          paymentMethod,
          locale,
          customerName,
          phone,
          email,
          address,
          postcode,
          wantsTaxInvoice,
          taxName: taxName || null,
          taxId: taxId || null,
          taxBranch: taxBranch || null,
          taxAddress: taxAddress || null,
          note,
          subtotal,
          shippingFee,
          total,
          items: { create: items },
        },
      });
      revalidatePath("/admin/orders");
      return { status: "success", number, token: accessToken };
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "P2002") return { status: "error", error: "server" };
    }
  }
  return { status: "error", error: "server" };
}
