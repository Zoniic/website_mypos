"use server";

import { prisma } from "@/lib/prisma";

export type NewsletterState = { status: "idle" | "error" | "success" | "already"; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "invalid" };
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
    return { status: "success" };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return { status: "already" };
    }
    throw error;
  }
}
