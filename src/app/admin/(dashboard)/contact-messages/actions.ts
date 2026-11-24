"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { saveLeadDetails, type LeadDetailsState } from "@/lib/leadList";

export async function updateContactMessageStatus(messageId: number, formData: FormData) {
  const admin = await requireAdmin();
  const status = String(formData.get("status") ?? "new");
  const before = await loadSnapshot("ContactMessage", messageId);
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  await auditEntity(admin, "ContactMessage", before, await loadSnapshot("ContactMessage", messageId));
  revalidatePath("/admin/contact-messages");
}

export async function updateContactMessageDetails(id: number, _prev: LeadDetailsState, formData: FormData): Promise<LeadDetailsState> {
  const admin = await requireAdmin();
  const result = await saveLeadDetails("contact", id, formData, admin);
  if (result?.ok) revalidatePath("/admin/contact-messages");
  return result;
}
