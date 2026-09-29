import { getSessionUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "./AdminShell";

// Every page here reads live data straight from the database; never prerender it.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, orders, quotes, messages, warranty] = await Promise.all([
    getSessionUser(),
    prisma.order.count({ where: { status: "pending_payment" } }),
    prisma.quoteRequest.count({ where: { status: "new" } }),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.warrantyClaim.count({ where: { status: "open" } }),
  ]);

  return (
    <AdminShell badges={{ orders, quotes, messages, warranty }} userName={session?.name} userEmail={session?.email}>
      {children}
    </AdminShell>
  );
}
