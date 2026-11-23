import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";

const exportHref = `${"/admin/newsletter"}/export`;

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });


  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ผู้รับข่าวสาร</h1>
          <p className="mt-1 text-sm text-text-2">
            ยังไม่ได้เชื่อมระบบส่งอีเมล ส่งออกรายชื่อนี้เพื่อนำเข้าบริการส่งอีเมลที่คุณเลือก (เช่น Mailchimp, Brevo)
          </p>
        </div>
        {subscribers.length > 0 ? (
          <a
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-text-1 hover:bg-surface-2"
          >
            <Download aria-hidden className="size-4" />
            ส่งออก CSV
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-2 opacity-60"
          >
            <Download aria-hidden className="size-4" />
            ส่งออก CSV
          </span>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">อีเมล</th>
              <th className="px-4 py-3 font-medium">สมัครเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-text-2">{s.createdAt.toLocaleString("th-TH")}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-text-2">
                  ยังไม่มีผู้สมัครรับข่าวสาร
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
