import { prisma } from "@/lib/prisma";
import { AdminGuide } from "../AdminGuide";
import { updateQuoteRequestStatus } from "./actions";
import { StatusSelect } from "../StatusSelect";

const statusOptions = ["new", "contacted", "closed"] as const;

export default async function AdminQuoteRequestsPage() {
  const requests = await prisma.quoteRequest.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">ขอใบเสนอราคา</h1>
      <p className="mt-1 text-sm text-text-2">
        Submitted from the product compare/quote cart on the public site.
      </p>
      <AdminGuide section="quoteRequests" />

      <div className="mt-6 space-y-4">
        {requests.length === 0 && <p className="text-text-2">No quote requests yet.</p>}
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
              <StatusSelect
                defaultValue={request.status}
                options={statusOptions}
                action={updateQuoteRequestStatus.bind(null, request.id)}
              />
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
          </div>
        ))}
      </div>
    </div>
  );
}
