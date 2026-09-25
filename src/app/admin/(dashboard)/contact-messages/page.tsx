import { prisma } from "@/lib/prisma";
import { updateContactMessageStatus } from "./actions";
import { StatusSelect } from "../StatusSelect";

const statusOptions = ["new", "contacted", "closed"] as const;

export default async function AdminContactMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      <p className="mt-1 text-sm text-text-2">Submitted from the Contact page form on the public site.</p>

      <div className="mt-6 space-y-4">
        {messages.length === 0 && <p className="text-text-2">No messages yet.</p>}
        {messages.map((message) => (
          <div key={message.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-text-1">{message.name}</p>
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
