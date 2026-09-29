import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/adminAuth";
import { ADMIN_NAV } from "./adminNav";
import { AdminIcon } from "./AdminShell";

const primaryButton =
  "rounded-button bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400";
const ghostButton =
  "rounded-button border border-border-strong bg-bg px-4 py-2 text-sm font-semibold text-text-1 hover:bg-surface-2";

export default async function AdminDashboardPage() {
  const [session, orders, quotes, messages, warranty, products, posts] = await Promise.all([
    getSessionUser(),
    prisma.order.count({ where: { status: "pending_payment" } }),
    prisma.quoteRequest.count({ where: { status: "new" } }),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.warrantyClaim.count({ where: { status: "open" } }),
    prisma.product.count(),
    prisma.blogPost.count(),
  ]);

  const inbox = [
    { label: "ออเดอร์รอตรวจยอดโอน", count: orders, href: "/admin/orders?status=pending_payment" },
    { label: "ขอใบเสนอราคาใหม่", count: quotes, href: "/admin/quote-requests" },
    { label: "ข้อความที่ยังไม่ได้ติดต่อกลับ", count: messages, href: "/admin/contact-messages" },
    { label: "งานซ่อม / เคลมที่เปิดอยู่", count: warranty, href: "/admin/warranty-claims" },
  ];
  const pending = inbox.reduce((sum, item) => sum + item.count, 0);

  return (
    <div>
      <p className="text-sm text-text-2">{session ? `สวัสดี ${session.name}` : "สวัสดี"}</p>
      <h1 className="mt-1 text-2xl font-bold">หน้าหลัก</h1>
      <p className="mt-1 text-sm text-text-2">แก้ไขอะไรในหลังบ้าน เว็บจะอัปเดตทันที ไม่ต้อง build ใหม่</p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-text-2">
          {pending > 0 ? `งานที่รออยู่ ${pending} รายการ` : "ไม่มีงานค้าง"}
        </h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {inbox.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl border p-4 transition-colors ${
                item.count > 0 ? "border-primary-200 bg-primary-50 hover:border-primary-400" : "border-border bg-bg hover:border-border-strong"
              }`}
            >
              <p className={`text-2xl font-bold tabular-nums ${item.count > 0 ? "text-primary-700" : "text-text-3"}`}>{item.count}</p>
              <p className="mt-0.5 text-sm text-text-2">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        {/* Route handler that sets the edit-mode cookie: needs a full-page request, not <Link>. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/live?path=/th" className={primaryButton}>
          แก้บนหน้าเว็บ
        </a>
        <Link href="/admin/products/new" className={ghostButton}>
          + เพิ่มสินค้า
        </Link>
        <Link href="/admin/blog/new" className={ghostButton}>
          + เขียนบทความ
        </Link>
        <Link href="/admin/references/new" className={ghostButton}>
          + เพิ่มผลงานลูกค้า
        </Link>
        <Link href="/admin/launch" className={ghostButton}>
          ความพร้อมเปิดเว็บ
        </Link>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_NAV.filter((group) => group.title !== "ภาพรวม").map((group) => (
          <div key={group.title} className="rounded-xl border border-border bg-bg p-4">
            <h2 className="font-semibold">{group.title}</h2>
            <ul className="mt-2 divide-y divide-border">
              {group.items.map((item) => {
                const body = (
                  <>
                    <AdminIcon name={item.icon} className="mt-0.5 text-text-3 group-hover:text-primary-600" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text-1">{item.label}</span>
                      <span className="block text-xs text-text-2">{item.hint}</span>
                    </span>
                  </>
                );
                const className = "group -mx-2 flex gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-0";
                return (
                  <li key={item.href}>
                    {item.external ? (
                      <a href={item.href} className={className}>
                        {body}
                      </a>
                    ) : (
                      <Link href={item.href} className={className}>
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <p className="mt-6 text-xs text-text-3">
        ในระบบตอนนี้: สินค้า {products} รุ่น · บทความ {posts} เรื่อง
      </p>
    </div>
  );
}
