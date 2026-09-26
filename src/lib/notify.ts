import { siteConfig } from "@/config/site";

/**
 * Instant alerts to the MYPOS team for new orders and leads, via:
 *  - LINE Messaging API (push to the sales team's LINE group or users), and/or
 *  - email through Resend.
 * Credentials are environment variables (never admin-editable settings), see
 * .env.example. Each channel is skipped silently when not configured, and a
 * failed send is logged, never thrown — an alert must not break an order.
 *
 * Call inside `after()` so the customer never waits for it.
 */

export type TeamAlert = {
  /** One-line headline, e.g. "🛒 ออเดอร์ใหม่ MP260926-48213 · ฿16,680". */
  title: string;
  /** Detail lines (keep personal data to what the team needs to act). */
  lines: string[];
  /** Admin path to open, e.g. "/admin/orders/12". */
  adminPath: string;
};

const TIMEOUT_MS = 8000;

function lineTargets(): string[] {
  return (process.env.LINE_NOTIFY_TO ?? "")
    .split(",")
    .map((id) => id.trim())
    // User (U…), group (C…) and room (R…) IDs are 33 characters.
    .filter((id) => /^[UCR][0-9a-f]{32}$/.test(id));
}

function emailTargets(): string[] {
  return (process.env.NOTIFY_EMAIL_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter((address) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address));
}

export function notificationStatus() {
  return {
    line: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN) && lineTargets().length > 0,
    email: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL_FROM) && emailTargets().length > 0,
  };
}

async function post(url: string, token: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} → ${response.status} ${await response.text().catch(() => "")}`.slice(0, 300));
}

export async function notifyTeam(alert: TeamAlert): Promise<void> {
  const link = `${siteConfig.url}${alert.adminPath}`;
  const text = [alert.title, "", ...alert.lines, "", `เปิดในระบบหลังบ้าน: ${link}`].join("\n").slice(0, 4900);
  const jobs: Promise<unknown>[] = [];

  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (lineToken) {
    for (const to of lineTargets()) {
      jobs.push(post("https://api.line.me/v2/bot/message/push", lineToken, { to, messages: [{ type: "text", text }] }));
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  const to = emailTargets();
  if (resendKey && from && to.length) {
    jobs.push(post("https://api.resend.com/emails", resendKey, { from, to, subject: alert.title, text }));
  }

  const results = await Promise.allSettled(jobs);
  for (const result of results) {
    if (result.status === "rejected") console.error("[notify] alert failed:", result.reason);
  }
}

const baht = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export function orderAlert(order: {
  id: number;
  number: string;
  total: number;
  customerName: string;
  phone: string;
  paymentMethod: string;
  wantsTaxInvoice: boolean;
  items: { name: string; quantity: number }[];
}): TeamAlert {
  return {
    title: `🛒 ออเดอร์ใหม่ ${order.number} · ${baht(order.total)}`,
    lines: [
      `ลูกค้า: ${order.customerName} · ${order.phone}`,
      `ชำระโดย: ${order.paymentMethod === "promptpay" ? "PromptPay QR" : "โอนธนาคาร"}${order.wantsTaxInvoice ? " · ขอใบกำกับภาษี" : ""}`,
      ...order.items.slice(0, 10).map((item) => `• ${item.name} × ${item.quantity}`),
      "รอลูกค้าส่งสลิป — ตรวจยอดแล้วเปลี่ยนสถานะเป็น \"ชำระแล้ว\"",
    ],
    adminPath: `/admin/orders/${order.id}`,
  };
}

const TOPIC_LABELS: Record<string, string> = {
  demo: "🎯 ขอนัดสาธิต",
  quote: "📄 ขอใบเสนอราคา",
  general: "💬 สอบถามทั่วไป",
  support: "🛠️ แจ้งปัญหา/บริการ",
};

export function contactAlert(message: {
  topic: string;
  name: string;
  phone: string;
  product: string | null;
  industry: string | null;
  message: string | null;
}): TeamAlert {
  return {
    title: `${TOPIC_LABELS[message.topic] ?? "💬 ข้อความใหม่"} · ${message.name}`,
    lines: [
      `โทร: ${message.phone}`,
      ...(message.product ? [`สินค้า: ${message.product}`] : []),
      ...(message.industry ? [`มาจากหน้า: ${message.industry}`] : []),
      ...(message.message ? [`ข้อความ: ${message.message.slice(0, 500)}`] : []),
    ],
    adminPath: "/admin/contact-messages",
  };
}

export function quoteAlert(quote: {
  name: string;
  company: string | null;
  phone: string;
  items: { productName: string; quantity: number }[];
}): TeamAlert {
  return {
    title: `📄 คำขอใบเสนอราคา · ${quote.name}${quote.company ? ` (${quote.company})` : ""}`,
    lines: [`โทร: ${quote.phone}`, ...quote.items.slice(0, 10).map((item) => `• ${item.productName} × ${item.quantity}`)],
    adminPath: "/admin/quote-requests",
  };
}

export function warrantyAlert(claim: { name: string; phone: string; productSlug: string | null; issue: string }): TeamAlert {
  return {
    title: `🛠️ แจ้งเคลม/ซ่อม · ${claim.name}`,
    lines: [
      `โทร: ${claim.phone}`,
      ...(claim.productSlug ? [`สินค้า: ${claim.productSlug}`] : []),
      `อาการ: ${claim.issue.slice(0, 500)}`,
    ],
    adminPath: "/admin/warranty-claims",
  };
}
