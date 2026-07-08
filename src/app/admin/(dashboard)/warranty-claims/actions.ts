"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateWarrantyClaimStatus(claimId: number, formData: FormData) {
  const status = String(formData.get("status") ?? "open");
  await prisma.warrantyClaim.update({ where: { id: claimId }, data: { status } });
  revalidatePath("/admin/warranty-claims");
}
