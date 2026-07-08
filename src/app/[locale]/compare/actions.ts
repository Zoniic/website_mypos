"use server";

import { prisma } from "@/lib/prisma";

export type QuoteCartItemInput = { slug: string; name: string; quantity: number };

export type SubmitQuoteState = { status: "idle" | "error" | "success"; message?: string };

export async function submitQuoteRequest(
  _prevState: SubmitQuoteState,
  formData: FormData
): Promise<SubmitQuoteState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;
  const itemsRaw = String(formData.get("items") ?? "[]");

  if (!name) return { status: "error", message: "Name is required." };
  if (!phone) return { status: "error", message: "Phone is required." };
  if (!email) return { status: "error", message: "Email is required." };

  let items: QuoteCartItemInput[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { status: "error", message: "Invalid cart data." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { status: "error", message: "Add at least one product first." };
  }

  await prisma.quoteRequest.create({
    data: {
      name,
      company,
      phone,
      email,
      message,
      items: {
        create: items.map((item) => ({
          productSlug: item.slug,
          productName: item.name,
          quantity: Math.max(1, Number(item.quantity) || 1),
        })),
      },
    },
  });

  return { status: "success" };
}
