import { prisma } from "@/lib/prisma";
import { updateWarrantyClaimStatus } from "./actions";
import { StatusSelect } from "../StatusSelect";

const statusOptions = ["open", "in_progress", "resolved"] as const;

export default async function AdminWarrantyClaimsPage() {
  const claims = await prisma.warrantyClaim.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">แจ้งซ่อม / เคลม</h1>
      <p className="mt-1 text-sm text-text-2">คำขอจากฟอร์มแจ้งซ่อมในหน้าบริการ</p>

      <div className="mt-6 space-y-4">
        {claims.length === 0 && <p className="text-text-2">ยังไม่มีงานแจ้งซ่อม</p>}
        {claims.map((claim) => (
          <div key={claim.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-text-1">{claim.name}</p>
                <p className="text-sm text-text-2">
                  {claim.phone} · {claim.email}
                </p>
                {claim.serialNumber && (
                  <p className="mt-1 text-sm text-text-2">Serial: {claim.serialNumber}</p>
                )}
                {claim.productSlug && (
                  <p className="text-sm text-text-2">Product: {claim.productSlug}</p>
                )}
                <p className="mt-1 text-xs text-text-2">{claim.createdAt.toLocaleString("th-TH")}</p>
              </div>
              <StatusSelect
                defaultValue={claim.status}
                options={statusOptions}
                action={updateWarrantyClaimStatus.bind(null, claim.id)}
              />
            </div>
            <p className="mt-3 text-sm text-text-2">{claim.issue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
