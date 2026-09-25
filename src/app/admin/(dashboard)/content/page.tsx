import Link from "next/link";
import { AdminGuide } from "../AdminGuide";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  const rows = await prisma.pageContent.groupBy({
    by: ["namespace"],
    _count: { _all: true },
    orderBy: { namespace: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Page Content</h1>
      <p className="mt-1 text-text-2">
        Marketing copy for every page, grouped by section. Pick a section to edit its text
        across all three languages.
      </p>
      <AdminGuide section="content" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <Link
            key={row.namespace}
            href={`/admin/content/${row.namespace}`}
            className="rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
          >
            <p className="font-semibold">{row.namespace}</p>
            <p className="mt-1 text-sm text-text-2">{row._count._all / 3} fields</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
