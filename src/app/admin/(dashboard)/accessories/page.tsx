import Link from "next/link";
import { AdminGuide } from "../AdminGuide";
import { prisma } from "@/lib/prisma";

export default async function AdminAccessoriesPage() {
  const accessories = await prisma.accessory.findMany({
    include: { translations: { where: { locale: "th" } }, categories: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">อุปกรณ์เสริม</h1>
        <Link
          href="/admin/accessories/new"
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Accessory
        </Link>
      </div>
      <AdminGuide section="accessories" />

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accessories.map((accessory) => (
              <tr key={accessory.id}>
                <td className="px-4 py-3 font-medium">{accessory.translations[0]?.name}</td>
                <td className="px-4 py-3 font-mono text-text-2">{accessory.slug}</td>
                <td className="px-4 py-3 text-text-2">
                  {accessory.categories.map((c) => c.slug).join(", ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/accessories/${accessory.id}/edit`}
                    className="text-primary-600 rounded-sm outline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
