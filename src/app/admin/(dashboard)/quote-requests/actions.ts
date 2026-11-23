"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveLeadDetails, type LeadDetailsState } from "@/lib/leadList";

export async function updateQuoteRequestStatus(requestId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "new");
  await prisma.quoteRequest.update({ where: { id: requestId }, data: { status } });
  revalidatePath("/admin/quote-requests");
}

export async function updateQuoteRequestDetails(id: number, _prev: LeadDetailsState, formData: FormData): Promise<LeadDetailsState> {
  await requireAdmin();
  const result = await saveLeadDetails("quote", id, formData);
  if (result?.ok) revalidatePath("/admin/quote-requests");
  return result;
}
