"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveLeadDetails, type LeadDetailsState } from "@/lib/leadList";

export async function updateWarrantyClaimStatus(claimId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "open");
  await prisma.warrantyClaim.update({ where: { id: claimId }, data: { status } });
  revalidatePath("/admin/warranty-claims");
}

export async function updateWarrantyClaimDetails(id: number, _prev: LeadDetailsState, formData: FormData): Promise<LeadDetailsState> {
  await requireAdmin();
  const result = await saveLeadDetails("warranty", id, formData);
  if (result?.ok) revalidatePath("/admin/warranty-claims");
  return result;
}
