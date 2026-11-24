import Link from "next/link";
import { Ban, Check, Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/adminAuth";
import { OwnerOnly } from "../OwnerOnly";

const OWNER_CAN = [
  "ทุกอย่างที่ผู้แก้ไขทำได้",
  "เพิ่ม แก้ ลบผู้ดูแล และเปลี่ยนบทบาท",
  "ตั้งค่าเว็บไซต์ (การชำระเงิน Pixel เบอร์ติดต่อ)",
  "ลบสินค้า บทความ และรายการอื่น",
  "ดูประวัติการแก้ไขและกู้คืนค่าเดิม",
];
const EDITOR_CAN = [
  "ตอบลูกค้า เปลี่ยนสถานะ เขียนโน้ต จัดการออเดอร์",
  "เพิ่ม แก้ และลบสินค้า ข้อความ รูป บทความ",
  "ส่งออก CSV ข้อมูลลูกค้า",
];
const EDITOR_CANNOT = ["จัดการผู้ดูแลและตั้งค่าเว็บไซต์", "ดูประวัติการแก้ไข"];

function RoleTag({ role }: { role: string }) {
  return role === "owner" ? (
    <span className="rounded-tag bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">เจ้าของ</span>
  ) : (
    <span className="rounded-tag bg-surface-2 px-2 py-0.5 text-xs font-semibold text-text-2">ผู้แก้ไข</span>
  );
}

export default async function AdminUsersPage() {
  const { user: session, role } = await getAdminContext();
  if (role !== "owner") return <OwnerOnly />;
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ผู้ดูแลระบบ</h1>
        <Link
          href="/admin/admin-users/new"
          className="inline-flex items-center gap-1.5 rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          เพิ่มผู้ดูแล
        </Link>
      </div>
      <p className="mt-1 text-text-2">บัญชีที่เข้าสู่ระบบหลังบ้านนี้ได้</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อ</th>
              <th className="px-4 py-3 font-medium">อีเมล</th>
              <th className="px-4 py-3 font-medium">บทบาท</th>
              <th className="px-4 py-3 font-medium">รหัส 2 ขั้นตอน</th>
              <th className="px-4 py-3 font-medium">เข้าสู่ระบบล่าสุด</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium">
                  {user.name}
                  {session.userId === user.id && (
                    <span className="ml-2 rounded-tag bg-surface-2 px-2 py-0.5 text-xs text-text-2">คุณ</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-2">{user.email}</td>
                <td className="px-4 py-3">
                  <RoleTag role={user.role} />
                </td>
                <td className="px-4 py-3">
                  {user.totpEnabledAt ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
                      เปิดแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-text-3">
                      <ShieldOff size={16} strokeWidth={1.75} aria-hidden="true" />
                      ยังไม่เปิด
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-2">
                  {user.lastLoginAt ? user.lastLoginAt.toLocaleString("th-TH") : "ยังไม่เคยเข้าสู่ระบบ"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/admin-users/${user.id}/edit`}
                    className="text-primary-600 rounded-sm outline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                  >
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-bg p-4">
          <RoleTag role="owner" />
          <ul className="mt-3 space-y-1.5 text-sm text-text-1">
            {OWNER_CAN.map((text) => (
              <li key={text} className="flex items-start gap-2">
                <Check size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                {text}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-bg p-4">
          <RoleTag role="editor" />
          <ul className="mt-3 space-y-1.5 text-sm text-text-1">
            {EDITOR_CAN.map((text) => (
              <li key={text} className="flex items-start gap-2">
                <Check size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                {text}
              </li>
            ))}
            {EDITOR_CANNOT.map((text) => (
              <li key={text} className="flex items-start gap-2 text-text-3">
                <Ban size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
