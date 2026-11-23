import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { csvResponse, toCsv } from "@/lib/csv";
import { LEAD_EXPORT_LIMIT, parseLeadParams, warrantyWhere } from "@/lib/leadList";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const params = parseLeadParams("warranty", Object.fromEntries(request.nextUrl.searchParams));
  const rows = await prisma.warrantyClaim.findMany({
    where: warrantyWhere(params),
    include: { assignee: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LEAD_EXPORT_LIMIT,
  });
  const body = toCsv(
    ["id", "created_at", "name", "phone", "email", "product", "serial_number", "issue", "status", "assignee", "admin_note"],
    rows.map((r) => [r.id, r.createdAt, r.name, r.phone, r.email, r.productSlug, r.serialNumber, r.issue, r.status, r.assignee?.name, r.adminNote])
  );
  return csvResponse("warranty-claims", body);
}