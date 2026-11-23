"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyTeam, warrantyAlert } from "@/lib/notify";
import { overSubmissionLimit } from "@/lib/clientIp";
import { EMAIL_PATTERN, MAX, textField } from "@/lib/formInput";

export type WarrantyClaimState = { status: "idle" | "error" | "success"; message?: string };

export async function submitWarrantyClaim(
  _prevState: WarrantyClaimState,
  formData: FormData
): Promise<WarrantyClaimState> {
  const name = textField(formData, "name", MAX.name);
  const phone = textField(formData, "phone", MAX.phone);
  const email = textField(formData, "email", MAX.email);
  const productSlug = textField(formData, "productSlug", MAX.slug) || null;
  const serialNumber = textField(formData, "serialNumber", MAX.serial) || null;
  const issue = textField(formData, "issue", MAX.message);

  if (!name) return { status: "error", message: "name" };
  if (!phone) return { status: "error", message: "phone" };
  if (!EMAIL_PATTERN.test(email)) return { status: "error", message: "email" };
  if (!issue) return { status: "error", message: "issue" };

  if (await overSubmissionLimit("warranty")) return { status: "error" };

  await prisma.warrantyClaim.create({
    data: { name, phone, email, productSlug, serialNumber, issue },
  });
  after(() => notifyTeam(warrantyAlert({ name, phone, productSlug, issue })));

  return { status: "success" };
}
