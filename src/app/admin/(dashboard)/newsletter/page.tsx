import { prisma } from "@/lib/prisma";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
    ["email,subscribed_at", ...subscribers.map((s) => `${s.email},${s.createdAt.toISOString()}`)].join("\n")
  )}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm text-text-2">
            No email-sending integration is configured yet — export this list to import into
            whichever ESP (Mailchimp, Brevo, etc.) you choose.
          </p>
        </div>
        {subscribers.length > 0 && (
          <a
            href={csvHref}
            download="newsletter-subscribers.csv"
            className="rounded-button bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-text-1 shadow-[var(--shadow-glow-primary)]"
          >
            Export CSV
          </a>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-text-2">{s.createdAt.toLocaleString("th-TH")}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-text-2">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
