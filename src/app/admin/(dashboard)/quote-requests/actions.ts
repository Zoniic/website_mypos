"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { saveLeadDetails, type LeadDetailsState } from "@/lib/leadList";

export async function updateQuoteRequestStatus(requestId: number, formData: FormData) {
  const admin = await requireAdmin();
  const status = String(formData.get("status") ?? "new");
  const before = await loadSnapshot("QuoteRequest", requestId);
  await prisma.quoteRequest.update({ where: { id: requestId }, data: { status } });
  await auditEntity(admin, "QuoteRequest", before, await loadSnapshot("QuoteRequest", requestId));
  revalidatePath("/admin/quote-requests");
}

export async function updateQuoteRequestDetails(id: number, _prev: LeadDetailsState, formData: FormData): Promise<LeadDetailsState> {
  const admin = await requireAdmin();
  const result = await saveLeadDetails("quote", id, formData, admin);
  if (result?.ok) revalidatePath("/admin/quote-requests");
  return result;
}
