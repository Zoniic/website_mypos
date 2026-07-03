import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContentForm } from "../ContentForm";

export default async function EditContentNamespacePage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace } = await params;

  const rows = await prisma.pageContent.findMany({
    where: { namespace },
    orderBy: { key: "asc" },
  });

  const keys = Array.from(new Set(rows.map((r) => r.key))).sort();
  const values = Object.fromEntries(rows.map((r) => [`${r.key}__${r.locale}`, r.value]));

  return (
    <div>
      <Link href="/admin/content" className="text-sm text-text-2 hover:text-text-1">
        &larr; Back to Page Content
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{namespace}</h1>
      <p className="mt-1 text-sm text-text-2">
        Fields starting with <code className="font-mono">[</code> or{" "}
        <code className="font-mono">{"{"}</code> are lists/objects — keep the JSON structure
        intact (only edit the text inside the quotes). Invalid JSON is rejected before saving.
      </p>

      <ContentForm namespace={namespace} keys={keys} values={values} />
    </div>
  );
}
