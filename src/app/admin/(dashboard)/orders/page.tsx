import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/orders";
import { AdminGuide } from "../AdminGuide";
import { PAYMENT_LABELS, STATUS_LABELS, STATUS_STYLES } from "./labels";

const baht = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? status : undefined;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;

  const tabClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium ${active ? "bg-text-1 text-white" : "bg-surface-2 text-text-2 hover:text-text-1"}`;

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-text-2">
        Orders placed through the website cart. Check the payment slip the customer sends on LINE against the bank
        account, then move the order to &quot;ชำระแล้ว&quot;.
      </p>
      <AdminGuide section="orders" />

      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tabClass(!filter)}>
          ทั้งหมด
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={tabClass(filter === s)}>
            {STATUS_LABELS[s]} ({countFor(s)})
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-0 text-left text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-2">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-primary-700 hover:underline">
                    {order.number}
                  </Link>
                  <p className="text-xs text-text-2">{order.createdAt.toLocaleString("th-TH")}</p>
                </td>
                <td className="px-4 py-3">
                  {order.customerName}
                  <p className="text-xs text-text-2">
                    {order.phone} · {order._count.items} รายการ{order.wantsTaxInvoice ? " · ขอใบกำกับภาษี" : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-text-2">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{baht(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] ?? ""}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
