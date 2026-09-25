import { prisma } from "@/lib/prisma";
import { AdminGuide } from "../AdminGuide";
import { updateContactMessageStatus } from "./actions";
import { StatusSelect } from "../StatusSelect";

const statusOptions = ["new", "contacted", "closed"] as const;

const topicLabels: Record<string, string> = {
  demo: "นัดสาธิต",
  quote: "ขอใบเสนอราคา",
  general: "สอบถามทั่วไป",
  support: "แจ้งปัญหา/บริการ",
};

export default async function AdminContactMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      <p className="mt-1 text-sm text-text-2">Submitted from the Contact page form on the public site.</p>
      <AdminGuide section="contactMessages" />

      <div className="mt-6 space-y-4">
        {messages.length === 0 && <p className="text-text-2">No messages yet.</p>}
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
              <StatusSelect
                defaultValue={message.status}
                options={statusOptions}
                action={updateContactMessageStatus.bind(null, message.id)}
              />
            </div>
            {message.message && (
              <p className="mt-3 whitespace-pre-line text-sm text-text-2">{message.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
