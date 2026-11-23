import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { csvResponse, toCsv } from "@/lib/csv";
import { LEAD_EXPORT_LIMIT, parseLeadParams, quoteWhere } from "@/lib/leadList";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const params = parseLeadParams("quote", Object.fromEntries(request.nextUrl.searchParams));
  const rows = await prisma.quoteRequest.findMany({
    where: quoteWhere(params),
    include: { items: { orderBy: { id: "asc" } }, assignee: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LEAD_EXPORT_LIMIT,
  });
  const body = toCsv(
    ["id", "created_at", "name", "company", "phone", "email", "items", "message", "status", "assignee", "admin_note"],
    rows.map((r) => [
      r.id,
      r.createdAt,
      r.name,
      r.company,
      r.phone,
      r.email,
      r.items.map((item) => `${item.productName} x ${item.quantity}`).join("; "),
      r.message,
      r.status,
      r.assignee?.name,
      r.adminNote,
    ])
  );
  return csvResponse("quote-requests", body);
}