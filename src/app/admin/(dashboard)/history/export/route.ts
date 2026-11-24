import type { NextRequest } from "next/server";
import { requireOwner } from "@/lib/adminAuth";
import type { AuditChange } from "@/lib/audit";
import { actionLabel, HISTORY_EXPORT_LIMIT, historyWhere, parseHistoryParams } from "@/lib/historyList";
import { entityLabel } from "@/lib/auditRegistry";
import { csvResponse, toCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

/** CSV of the change history for the current filters. Owner only, at most 20 000 history rows, never older than 1 year. */
export async function GET(request: NextRequest) {
  await requireOwner();
  const params = parseHistoryParams(Object.fromEntries(request.nextUrl.searchParams));
  const rows = await prisma.auditLog.findMany({
    where: historyWhere(params),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: HISTORY_EXPORT_LIMIT,
  });
  const lines: unknown[][] = [];
  for (const r of rows) {
    const changes = Array.isArray(r.changes) ? (r.changes as unknown as AuditChange[]) : [];
    const base = [r.id, r.createdAt, r.actorName, r.actorEmail, actionLabel(r.action), entityLabel(r.entityType), r.entityId, r.entityLabel, r.source, r.detail];
    if (changes.length === 0) lines.push([...base, "", "", "", ""]);
    for (const c of changes) lines.push([...base, c.field, c.locale ?? "", c.before, c.after]);
  }
  const body = toCsv(
    ["id", "time", "user", "email", "action", "data_type", "record_id", "record", "source", "detail", "field", "language", "before", "after"],
    lines,
  );
  return csvResponse("change-history", body);
}
