import { AdminGuide } from "../AdminGuide";
import { updateContactMessageStatus, updateContactMessageDetails } from "./actions";
import { StatusSelect } from "../StatusSelect";
import { LeadEmpty, LeadResultBar, LeadToolbar } from "../LeadToolbar";
import { LeadAssignee } from "../LeadAssignee";
import { LeadNote } from "../LeadNote";
import { LeadPager } from "../LeadPager";
import { LEAD_STATUS_LABELS, listAssigneeOptions, listContactMessages, parseLeadParams } from "@/lib/leadList";

const statusOptions = ["new", "contacted", "closed"] as const;
const basePath = "/admin/contact-messages";

const topicLabels: Record<string, string> = {
  demo: "นัดสาธิต",
  quote: "ขอใบเสนอราคา",
  general: "สอบถามทั่วไป",
  support: "แจ้งปัญหา/บริการ",
};

export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseLeadParams("contact", await searchParams);
  const [{ rows: messages, page, pageCount, total }, admins] = await Promise.all([
    listContactMessages(params),
    listAssigneeOptions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">ข้อความติดต่อ</h1>
      <p className="mt-1 text-sm text-text-2">ข้อความจากฟอร์มหน้าติดต่อเรา และปุ่มนัดสาธิตบนเว็บ</p>
      <AdminGuide section="contactMessages" />

      <LeadToolbar
        kind="contact"
        basePath={basePath}
        params={params}
        admins={admins}
        searchPlaceholder="ค้นหาชื่อ เบอร์โทร สินค้า หรือข้อความ"
        total={total}
      />
      <LeadResultBar total={total} page={page} pageCount={pageCount} />

      <div className="mt-3 space-y-4">
        {messages.length === 0 && (
          <LeadEmpty
            params={params}
            basePath={basePath}
            emptyTitle="ยังไม่มีข้อความ"
            emptyText="ข้อความจากฟอร์มหน้าติดต่อเราและปุ่มนัดสาธิตจะแสดงที่นี่"
          />
        )}
        {messages.map((message) => (
          <div key={message.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      message.topic === "demo"
                        ? "bg-primary-600 text-white"
                        : "bg-surface-2 text-text-2"
                    }`}
                  >
                    {topicLabels[message.topic] ?? message.topic}
                  </span>
                  {message.industry && (
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-2">
                      จากหน้า: {message.industry}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-semibold text-text-1">{message.name}</p>
                <p className="text-sm text-text-2">{message.phone}</p>
                {message.product && (
                  <p className="mt-1 text-sm text-text-2">
                    Product: <span className="text-text-1">{message.product}</span>
                  </p>
                )}
                <p className="mt-1 text-xs text-text-2">{message.createdAt.toLocaleString("th-TH")}</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-52">
                <StatusSelect
                defaultValue={message.status}
                options={statusOptions}
                labels={LEAD_STATUS_LABELS}
                action={updateContactMessageStatus.bind(null, message.id)}
              />
                <LeadAssignee
                  assigneeId={message.assigneeId}
                  admins={admins}
                  action={updateContactMessageDetails.bind(null, message.id)}
                />
              </div>
            </div>
            {message.message && (
              <p className="mt-3 whitespace-pre-line text-sm text-text-2">{message.message}</p>
            )}
            <LeadNote note={message.adminNote ?? ""} action={updateContactMessageDetails.bind(null, message.id)} />
          </div>
        ))}
      </div>

      <LeadPager basePath={basePath} params={params} page={page} pageCount={pageCount} total={total} />
    </div>
  );
}
