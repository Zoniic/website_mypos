import Link from "next/link";
import { House, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";

/**
 * P3: what an editor sees on an owner-only page. Pages render this instead of
 * querying owner data; the actions behind them refuse editors on their own.
 */
export async function OwnerOnly() {
  const owner = await prisma.adminUser.findFirst({
    where: { role: "owner" },
    orderBy: { createdAt: "asc" },
    select: { name: true },
  });
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-8 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text-2">
          <Lock size={20} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-bold">หน้านี้สำหรับเจ้าของเท่านั้น</h1>
        <p className="mt-2 text-sm text-text-2">
          บัญชีของคุณเป็น ผู้แก้ไข ถ้าต้องแก้ตั้งค่าเว็บไซต์ ให้ติดต่อเจ้าของบัญชี
          {owner ? `: ${owner.name}` : ""}
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-flex items-center gap-1.5 rounded-button border border-border-strong bg-bg px-4 py-2 text-sm font-semibold text-text-1 outline-offset-2 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
        >
          <House size={16} strokeWidth={1.75} aria-hidden="true" />
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
