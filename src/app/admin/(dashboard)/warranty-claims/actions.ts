"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateWarrantyClaimStatus(claimId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "open");
  await prisma.warrantyClaim.update({ where: { id: claimId }, data: { status } });
  revalidatePath("/admin/warranty-claims");
}
