import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminTrustLogosPage() {
  const logos = await prisma.trustLogo.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trust Logos</h1>
        <Link
          href="/admin/trust-logos/new"
          className="rounded-button bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Logo
        </Link>
      </div>
      <p className="mt-1 text-text-2">Shown in the &quot;Trusted by&quot; strip on the homepage.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Logo image</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logos.map((logo) => (
              <tr key={logo.id}>
                <td className="px-4 py-3 font-medium">{logo.name}</td>
                <td className="px-4 py-3 text-text-2">{logo.imageUrl ? "Uploaded" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/trust-logos/${logo.id}/edit`}
                    className="text-primary-600 hover:underline"
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
