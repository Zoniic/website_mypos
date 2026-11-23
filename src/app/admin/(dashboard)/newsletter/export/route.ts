import { requireAdmin } from "@/lib/adminAuth";
import { csvResponse, toCsv } from "@/lib/csv";
import { LEAD_EXPORT_LIMIT } from "@/lib/leadList";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const rows = await prisma.newsletterSubscriber.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LEAD_EXPORT_LIMIT,
  });
  return csvResponse("newsletter-subscribers", toCsv(["email", "subscribed_at"], rows.map((r) => [r.email, r.createdAt])));
}