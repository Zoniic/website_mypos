import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminContext } from "@/lib/adminAuth";
import { pageContentHistoryCounts } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";
import { ContentForm } from "../ContentForm";

export default async function EditContentNamespacePage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace } = await params;
  // History is owner-only: editors get no history button and no history query.
  const { role } = await getAdminContext();
  const historyCounts = role === "owner" ? await pageContentHistoryCounts(namespace) : undefined;

  const rows = await prisma.pageContent.findMany({
    where: { namespace },
    orderBy: { key: "asc" },
  });

  const keys = Array.from(new Set(rows.map((r) => r.key))).sort();
  const values = Object.fromEntries(rows.map((r) => [`${r.key}__${r.locale}`, r.value]));

  return (
    <div>
      <Link href="/admin/content" className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-text-1">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        กลับไปข้อความทุกหน้า
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{namespace}</h1>
      <p className="mt-1 text-sm text-text-2">
        Fields starting with <code className="font-mono">[</code> or{" "}
        <code className="font-mono">{"{"}</code> are lists/objects — keep the JSON structure
        intact (only edit the text inside the quotes). Invalid JSON is rejected before saving.
      </p>

      <ContentForm namespace={namespace} keys={keys} values={values} historyCounts={historyCounts} />
    </div>
  );
}
