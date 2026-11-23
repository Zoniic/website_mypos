"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveLeadDetails, type LeadDetailsState } from "@/lib/leadList";

export async function updateContactMessageStatus(messageId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "new");
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  revalidatePath("/admin/contact-messages");
}

export async function updateContactMessageDetails(id: number, _prev: LeadDetailsState, formData: FormData): Promise<LeadDetailsState> {
  await requireAdmin();
  const result = await saveLeadDetails("contact", id, formData);
  if (result?.ok) revalidatePath("/admin/contact-messages");
  return result;
}
