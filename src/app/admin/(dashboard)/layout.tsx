import { getAdminContext } from "@/lib/adminAuth";
import { filterNavForRole } from "@/lib/permissions";
import { ADMIN_NAV } from "./adminNav";
import { hasNotificationChannel } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "./AdminShell";
import { LeadAutoRefresh } from "./LeadAutoRefresh";

// Every page here reads live data straight from the database; never prerender it.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [{ user: session, role }, orders, quotes, messages, warranty] = await Promise.all([
    getAdminContext(),
    prisma.order.count({ where: { status: "pending_payment" } }),
    prisma.quoteRequest.count({ where: { status: "new" } }),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.warrantyClaim.count({ where: { status: "open" } }),
  ]);

  return (
    <AdminShell nav={filterNavForRole(role, ADMIN_NAV)} badges={{ orders, quotes, messages, warranty }} userName={session?.name} userEmail={session?.email} noAlertChannel={!hasNotificationChannel()}>
      <LeadAutoRefresh />
      {children}
    </AdminShell>
  );
}
