"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateContactMessageStatus(messageId: number, formData: FormData) {
  const status = String(formData.get("status") ?? "new");
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  revalidatePath("/admin/contact-messages");
}
