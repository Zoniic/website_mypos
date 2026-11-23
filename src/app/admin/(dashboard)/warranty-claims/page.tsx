import { updateWarrantyClaimStatus, updateWarrantyClaimDetails } from "./actions";
import { StatusSelect } from "../StatusSelect";
import { LeadEmpty, LeadResultBar, LeadToolbar } from "../LeadToolbar";
import { LeadAssignee } from "../LeadAssignee";
import { LeadNote } from "../LeadNote";
import { LeadPager } from "../LeadPager";
import { LEAD_STATUS_LABELS, listAssigneeOptions, listWarrantyClaims, parseLeadParams } from "@/lib/leadList";

const statusOptions = ["open", "in_progress", "resolved"] as const;
const basePath = "/admin/warranty-claims";

export default async function AdminWarrantyClaimsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseLeadParams("warranty", await searchParams);
  const [{ rows: claims, page, pageCount, total }, admins] = await Promise.all([
    listWarrantyClaims(params),
    listAssigneeOptions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">แจ้งซ่อม / เคลม</h1>
      <p className="mt-1 text-sm text-text-2">คำขอจากฟอร์มแจ้งซ่อมในหน้าบริการ</p>

      <LeadToolbar
        kind="warranty"
        basePath={basePath}
        params={params}
        admins={admins}
        searchPlaceholder="ค้นหาชื่อ เบอร์โทร อีเมล Serial หรืออาการ"
        total={total}
      />
      <LeadResultBar total={total} page={page} pageCount={pageCount} />

      <div className="mt-3 space-y-4">
        {claims.length === 0 && (
          <LeadEmpty
            params={params}
            basePath={basePath}
            emptyTitle="ยังไม่มีงานแจ้งซ่อม"
            emptyText="คำขอจากฟอร์มแจ้งซ่อมในหน้าบริการจะแสดงที่นี่"
          />
        )}
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
              <div className="flex w-full flex-col gap-2 sm:w-52">
                <StatusSelect
                defaultValue={claim.status}
                options={statusOptions}
                labels={LEAD_STATUS_LABELS}
                action={updateWarrantyClaimStatus.bind(null, claim.id)}
              />
                <LeadAssignee
                  assigneeId={claim.assigneeId}
                  admins={admins}
                  action={updateWarrantyClaimDetails.bind(null, claim.id)}
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-2">{claim.issue}</p>
            <LeadNote note={claim.adminNote ?? ""} action={updateWarrantyClaimDetails.bind(null, claim.id)} />
          </div>
        ))}
      </div>

      <LeadPager basePath={basePath} params={params} page={page} pageCount={pageCount} total={total} />
    </div>
  );
}
