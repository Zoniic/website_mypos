"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyTeam, quoteAlert } from "@/lib/notify";
import { overSubmissionLimit } from "@/lib/clientIp";
import { EMAIL_PATTERN, MAX, isBotSubmission, parseQuoteLines, textField } from "@/lib/formInput";

export type QuoteCartItemInput = { slug: string; name: string; quantity: number };

export type SubmitQuoteState = { status: "idle" | "error" | "success"; message?: string };

export async function submitQuoteRequest(
  _prevState: SubmitQuoteState,
  formData: FormData
): Promise<SubmitQuoteState> {
  const name = textField(formData, "name", MAX.name);
  const phone = textField(formData, "phone", MAX.phone);
  const email = textField(formData, "email", MAX.email);
  const company = textField(formData, "company", MAX.company) || null;
  const message = textField(formData, "message", MAX.message) || null;
  const itemsRaw = String(formData.get("items") ?? "[]");

  if (!name) return { status: "error", message: "Name is required." };
  if (!phone) return { status: "error", message: "Phone is required." };
  if (!EMAIL_PATTERN.test(email)) return { status: "error", message: "A valid email is required." };

  // The cart comes from the browser: only a short list of well-formed lines is accepted.
  const items = parseQuoteLines(itemsRaw.length > 20000 ? "" : itemsRaw);
  if (!items) return { status: "error", message: "Add at least one product first." };

  // Honeypot filled: a bot. Look successful, store nothing, send no alert.
  if (isBotSubmission(formData)) return { status: "success" };

  if (await overSubmissionLimit("quote")) return { status: "error", message: "Too many requests — please try again later." };

  const quote = await prisma.quoteRequest.create({
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
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });
  after(() => notifyTeam(quoteAlert(quote)));

  return { status: "success" };
}
