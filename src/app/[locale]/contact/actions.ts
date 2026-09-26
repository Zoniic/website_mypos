"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactAlert, notifyTeam } from "@/lib/notify";
import { isIndustrySlug } from "@/data/industries";

/** `topic` is echoed back on success so the page can report a typed lead to analytics. */
export type ContactFormState = { status: "idle" | "error" | "success"; topic?: string };

const TOPICS = ["demo", "quote", "general", "support"] as const;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;
  const rawTopic = String(formData.get("topic") ?? "");
  const topic = (TOPICS as readonly string[]).includes(rawTopic) ? rawTopic : "general";
  const rawIndustry = String(formData.get("industry") ?? "");
  const industry = isIndustrySlug(rawIndustry) ? rawIndustry : null;

  if (!name || !phone) return { status: "error" };

  try {
    await prisma.contactMessage.create({
      data: { topic, industry, name, phone, product, message },
    });
    after(() => notifyTeam(contactAlert({ topic, industry, name, phone, product, message })));
  } catch {
    return { status: "error" };
  }

  return { status: "success", topic };
}
