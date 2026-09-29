"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateQuoteRequestStatus(requestId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "new");
  await prisma.quoteRequest.update({ where: { id: requestId }, data: { status } });
  revalidatePath("/admin/quote-requests");
}
