/**
 * One-off, idempotent migration adding the "integrations" homepage section
 * (payment / delivery / accounting connectivity — a feature every competitor
 * highlights). Writes to DB (authoritative) + messages/*.json (seed parity).
 *
 * NOTE for the team: list ONLY integrations that actually work today. Edit via
 * Admin → Content → integrations. Run: npx tsx prisma/add-integrations-section.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const CONTENT: Record<Locale, Record<string, unknown>> = {
  th: {
    eyebrow: "เชื่อมต่อได้ครบ",
    title: "ทำงานร่วมกับระบบที่คุณใช้อยู่",
    lede: "รับชำระเงิน เชื่อมเดลิเวอรีและบัญชี ได้ในเครื่องเดียว — ไม่ต้องเปลี่ยนวิธีทำงานเดิม",
    groups: [
      { label: "รับชำระเงิน", items: ["พร้อมเพย์ (QR)", "บัตรเครดิต/เดบิต (EDC)", "TrueMoney Wallet", "AliPay / WeChat Pay"] },
      { label: "เดลิเวอรี", items: ["LINE MAN", "GrabFood", "foodpanda", "Robinhood"] },
      { label: "บัญชีและระบบหลังบ้าน", items: ["FlowAccount", "PEAK", "ระบบสมาชิก / CRM", "ใบกำกับภาษีอิเล็กทรอนิกส์ (e-Tax)"] },
    ],
  },
  en: {
    eyebrow: "Fully connected",
    title: "Works with the tools you already use",
    lede: "Take payments and connect delivery and accounting from one device — no change to how you work.",
    groups: [
      { label: "Payments", items: ["PromptPay (QR)", "Credit / debit card (EDC)", "TrueMoney Wallet", "AliPay / WeChat Pay"] },
      { label: "Delivery", items: ["LINE MAN", "GrabFood", "foodpanda", "Robinhood"] },
      { label: "Accounting & back office", items: ["FlowAccount", "PEAK", "Membership / CRM", "e-Tax invoice"] },
    ],
  },
  zh: {
    eyebrow: "全面互联",
    title: "与您现有的系统无缝协作",
    lede: "一台设备即可收款并连接外卖与财务——无需改变原有工作方式。",
    groups: [
      { label: "收款", items: ["PromptPay（二维码）", "信用卡 / 借记卡（EDC）", "TrueMoney 钱包", "支付宝 / 微信支付"] },
      { label: "外卖", items: ["LINE MAN", "GrabFood", "foodpanda", "Robinhood"] },
      { label: "财务与后台", items: ["FlowAccount", "PEAK", "会员 / CRM", "电子税务发票"] },
    ],
  },
};

async function main() {
  for (const locale of Object.keys(CONTENT) as Locale[]) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    for (const [key, value] of Object.entries(CONTENT[locale])) {
      const stored = typeof value === "string" ? value : JSON.stringify(value);
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "integrations", key, locale } },
        create: { namespace: "integrations", key, locale, value: stored },
        update: { value: stored },
      });
    }

    messages.integrations = CONTENT[locale];
    fs.writeFileSync(file, JSON.stringify(messages, null, 2) + "\n", "utf8");
    console.log(`Updated ${locale}: DB + messages/${locale}.json`);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
