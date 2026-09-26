import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * LINE Messaging API webhook — only used to discover the IDs that go into
 * LINE_NOTIFY_TO. Invite the alert bot into the sales team's LINE group
 * (or type "id" to it): it replies with that chat's ID. It never pushes or
 * stores anything.
 *
 * Set in LINE Developers → Messaging API → Webhook URL:
 *   https://<domain>/api/line/webhook
 */

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { type: "user" | "group" | "room"; userId?: string; groupId?: string; roomId?: string };
  message?: { type: string; text?: string };
};

function validSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("base64"));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

async function reply(replyToken: string, text: string, token: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
    signal: AbortSignal.timeout(5000),
  }).catch((error) => console.error("[line-webhook] reply failed:", error));
}

export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !token) return new Response("Not configured", { status: 404 });

  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-line-signature"), secret)) {
    return new Response("Bad signature", { status: 401 });
  }

  let events: LineEvent[] = [];
  try {
    events = (JSON.parse(body) as { events?: LineEvent[] }).events ?? [];
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  for (const event of events) {
    if (!event.replyToken || !event.source) continue;
    const chatId = event.source.groupId ?? event.source.roomId ?? event.source.userId;
    if (!chatId) continue;
    const askedForId = event.type === "message" && /^(id|ไอดี)$/i.test(event.message?.text?.trim() ?? "");
    if (event.type === "join" || askedForId) {
      await reply(
        event.replyToken,
        `ID ของแชทนี้:\n${chatId}\n\nนำไปใส่ใน LINE_NOTIFY_TO (คั่นหลาย ID ด้วยจุลภาค) เพื่อรับแจ้งเตือนออเดอร์และลูกค้าใหม่จากเว็บไซต์`,
        token
      );
    }
  }

  // LINE only needs a 200 to consider the webhook delivered.
  return new Response("OK");
}
