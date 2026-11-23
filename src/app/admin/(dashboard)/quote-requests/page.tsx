import { AdminGuide } from "../AdminGuide";
import { updateQuoteRequestStatus, updateQuoteRequestDetails } from "./actions";
import { StatusSelect } from "../StatusSelect";
import { LeadEmpty, LeadResultBar, LeadToolbar } from "../LeadToolbar";
import { LeadAssignee } from "../LeadAssignee";
import { LeadNote } from "../LeadNote";
import { LeadPager } from "../LeadPager";
import { LEAD_STATUS_LABELS, listAssigneeOptions, listQuoteRequests, parseLeadParams } from "@/lib/leadList";

const statusOptions = ["new", "contacted", "closed"] as const;
const basePath = "/admin/quote-requests";

export default async function AdminQuoteRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseLeadParams("quote", await searchParams);
  const [{ rows: requests, page, pageCount, total }, admins] = await Promise.all([
    listQuoteRequests(params),
    listAssigneeOptions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">ขอใบเสนอราคา</h1>
      <p className="mt-1 text-sm text-text-2">คำขอที่ส่งจากตะกร้าเปรียบเทียบ/ขอใบเสนอราคาสินค้าบนหน้าเว็บ</p>
      <AdminGuide section="quoteRequests" />

      <LeadToolbar
        kind="quote"
        basePath={basePath}
        params={params}
        admins={admins}
        searchPlaceholder="ค้นหาชื่อ บริษัท เบอร์โทร อีเมล หรือรุ่นสินค้า"
      />
      <LeadResultBar total={total} page={page} pageCount={pageCount} />

      <div className="mt-3 space-y-4">
        {requests.length === 0 && (
          <LeadEmpty
            params={params}
            basePath={basePath}
            emptyTitle="ยังไม่มีคำขอใบเสนอราคา"
            emptyText="คำขอจากตะกร้าเปรียบเทียบสินค้าจะแสดงที่นี่"
          />
        )}
        {requests.map((request) => (
          <div key={request.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-text-1">
                  {request.name} {request.company ? `— ${request.company}` : ""}
                </p>
                <p className="text-sm text-text-2">
                  {request.phone} · {request.email}
                </p>
                <p className="mt-1 text-xs text-text-2">
                  {request.createdAt.toLocaleString("th-TH")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-52">
                <StatusSelect
                defaultValue={request.status}
                options={statusOptions}
                labels={LEAD_STATUS_LABELS}
                action={updateQuoteRequestStatus.bind(null, request.id)}
              />
                <LeadAssignee
                  assigneeId={request.assigneeId}
                  admins={admins}
                  action={updateQuoteRequestDetails.bind(null, request.id)}
                />
              </div>
            </div>

            {request.message && <p className="mt-3 text-sm text-text-2">{request.message}</p>}

            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-text-2">
                <tr>
                  <th className="py-1 font-medium">Product</th>
                  <th className="py-1 font-medium">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {request.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5">{item.productName}</td>
                    <td className="py-1.5">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <LeadNote note={request.adminNote ?? ""} action={updateQuoteRequestDetails.bind(null, request.id)} />
          </div>
        ))}
      </div>

      <LeadPager basePath={basePath} params={params} page={page} pageCount={pageCount} total={total} />
    </div>
  );
}
