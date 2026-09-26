"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyTeam, warrantyAlert } from "@/lib/notify";

export type WarrantyClaimState = { status: "idle" | "error" | "success"; message?: string };

export async function submitWarrantyClaim(
  _prevState: WarrantyClaimState,
  formData: FormData
): Promise<WarrantyClaimState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim() || null;
  const serialNumber = String(formData.get("serialNumber") ?? "").trim() || null;
  const issue = String(formData.get("issue") ?? "").trim();

  if (!name) return { status: "error", message: "name" };
  if (!phone) return { status: "error", message: "phone" };
  if (!email) return { status: "error", message: "email" };
  if (!issue) return { status: "error", message: "issue" };

  await prisma.warrantyClaim.create({
    data: { name, phone, email, productSlug, serialNumber, issue },
  });
  after(() => notifyTeam(warrantyAlert({ name, phone, productSlug, issue })));

  return { status: "success" };
}
