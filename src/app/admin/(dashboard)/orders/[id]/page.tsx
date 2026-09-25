import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { ORDER_STATUSES } from "@/lib/orders";
import { updateOrder } from "../actions";
import { OrderUpdateForm } from "./OrderUpdateForm";
import { PAYMENT_LABELS, STATUS_LABELS, STATUS_STYLES } from "../labels";

const baht = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) || 0 },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!order) notFound();

  const customerLink = `${siteConfig.url}/${order.locale}/order/${order.number}?t=${order.accessToken}`;

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-text-2 hover:text-text-1">
        ← Orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{order.number}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] ?? ""}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-2">
        {order.createdAt.toLocaleString("th-TH")} · {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} · ภาษา {order.locale}
        {order.paidAt && ` · ชำระเมื่อ ${order.paidAt.toLocaleString("th-TH")}`}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="rounded-xl border border-border">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      {item.name}
                      <p className="text-xs text-text-2">
                        {item.kind} · {item.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-2">
                      {item.quantity} × {baht(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{baht(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-border bg-surface-0">
                <tr>
                  <td colSpan={2} className="px-4 pt-3 text-right text-text-2">Subtotal</td>
                  <td className="px-4 pt-3 text-right tabular-nums">{baht(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 text-right text-text-2">Delivery</td>
                  <td className="px-4 text-right tabular-nums">{baht(order.shippingFee)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 pb-3 text-right font-semibold">Total (incl. VAT)</td>
                  <td className="px-4 pb-3 text-right text-lg font-bold tabular-nums">{baht(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <h2 className="font-semibold">ลูกค้า / ที่อยู่จัดส่ง</h2>
              <p className="mt-2 whitespace-pre-line text-text-2">
                {order.customerName}
                {"\n"}
                {order.address} {order.postcode}
              </p>
              <p className="mt-2 flex flex-wrap gap-3">
                <a href={`tel:${order.phone}`} className="font-medium text-primary-700 hover:underline">
                  {order.phone}
                </a>
                <a href={`mailto:${order.email}`} className="font-medium text-primary-700 hover:underline">
                  {order.email}
                </a>
              </p>
            </div>
            {order.wantsTaxInvoice && (
              <div>
                <h2 className="font-semibold">ใบกำกับภาษีเต็มรูป</h2>
                <p className="mt-2 whitespace-pre-line text-text-2">
                  {order.taxName}
                  {"\n"}เลขผู้เสียภาษี {order.taxId} ({order.taxBranch})
                  {"\n"}
                  {order.taxAddress}
                </p>
              </div>
            )}
            {order.note && (
              <div className="sm:col-span-2">
                <h2 className="font-semibold">หมายเหตุจากลูกค้า</h2>
                <p className="mt-2 whitespace-pre-line text-text-2">{order.note}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <OrderUpdateForm
            action={updateOrder.bind(null, order.id)}
            status={order.status}
            adminNote={order.adminNote ?? ""}
            options={ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          />
          <div className="rounded-xl border border-border p-4 text-sm">
            <p className="font-semibold">ลิงก์สถานะคำสั่งซื้อของลูกค้า</p>
            <p className="mt-1 text-xs text-text-2">
              ส่งให้ลูกค้าได้หากทำลิงก์หาย — ลิงก์นี้เป็นความลับ อย่าโพสต์สาธารณะ
            </p>
            <input readOnly value={customerLink} className="mt-2 w-full rounded-lg border border-border-strong bg-surface-0 px-2 py-1.5 text-xs" />
          </div>
        </aside>
      </div>
    </div>
  );
}
