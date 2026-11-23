import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { csvResponse, toCsv } from "@/lib/csv";
import { LEAD_EXPORT_LIMIT, contactWhere, parseLeadParams } from "@/lib/leadList";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const params = parseLeadParams("contact", Object.fromEntries(request.nextUrl.searchParams));
  const rows = await prisma.contactMessage.findMany({
    where: contactWhere(params),
    include: { assignee: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LEAD_EXPORT_LIMIT,
  });
  const body = toCsv(
    ["id", "created_at", "topic", "from_page", "name", "phone", "product", "message", "status", "assignee", "admin_note"],
    rows.map((r) => [r.id, r.createdAt, r.topic, r.industry, r.name, r.phone, r.product, r.message, r.status, r.assignee?.name, r.adminNote])
  );
  return csvResponse("contact-messages", body);
}