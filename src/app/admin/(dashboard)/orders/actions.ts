"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

export async function updateOrder(orderId: number, _prev: string | null, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return "Unknown status.";
  const adminNote = String(formData.get("adminNote") ?? "").trim().slice(0, 2000) || null;

  const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { paidAt: true } });
  if (!existing) return "Order not found.";

  // First time it moves past "awaiting payment" (and isn't cancelled), stamp when it was paid.
  const paidNow = !existing.paidAt && status !== "pending_payment" && status !== "cancelled";

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus, adminNote, ...(paidNow ? { paidAt: new Date() } : {}) },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return "saved";
}
