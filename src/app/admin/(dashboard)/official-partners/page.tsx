import Link from "next/link";
import { AdminGuide } from "../AdminGuide";
import { prisma } from "@/lib/prisma";

export default async function AdminOfficialPartnersPage() {
  const partners = await prisma.officialPartner.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">พาร์ทเนอร์</h1>
        <Link
          href="/admin/official-partners/new"
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Partner
        </Link>
      </div>
      <AdminGuide section="officialPartners" />
      <p className="mt-1 text-text-2">
        Companies MYPOS is an authorized/official partner of (payment gateways, banks, hardware
        manufacturers) — shown on the About page.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Logo image</th>
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td className="px-4 py-3 font-medium">{partner.name}</td>
                <td className="px-4 py-3 text-text-2">{partner.imageUrl ? "Uploaded" : "—"}</td>
                <td className="px-4 py-3 text-text-2">{partner.websiteUrl ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/official-partners/${partner.id}/edit`}
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
