"use server";

import { prisma } from "@/lib/prisma";

export type ContactFormState = { status: "idle" | "error" | "success" };

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!name || !phone) return { status: "error" };

  try {
    await prisma.contactMessage.create({ data: { name, phone, product, message } });
  } catch {
    return { status: "error" };
  }

  return { status: "success" };
}
