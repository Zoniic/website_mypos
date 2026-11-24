"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { saveLeadDetails, type LeadDetailsState } from "@/lib/leadList";

export async function updateWarrantyClaimStatus(claimId: number, formData: FormData) {
  const admin = await requireAdmin();
  const status = String(formData.get("status") ?? "open");
  const before = await loadSnapshot("WarrantyClaim", claimId);
  await prisma.warrantyClaim.update({ where: { id: claimId }, data: { status } });
  await auditEntity(admin, "WarrantyClaim", before, await loadSnapshot("WarrantyClaim", claimId));
  revalidatePath("/admin/warranty-claims");
}

export async function updateWarrantyClaimDetails(id: number, _prev: LeadDetailsState, formData: FormData): Promise<LeadDetailsState> {
  const admin = await requireAdmin();
  const result = await saveLeadDetails("warranty", id, formData, admin);
  if (result?.ok) revalidatePath("/admin/warranty-claims");
  return result;
}
