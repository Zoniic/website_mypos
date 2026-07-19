/**
 * Correction: MYPOS POS/software is ONLINE-ONLY. Earlier seed content wrongly
 * claimed offline operation. This replaces those false claims with honest,
 * online-appropriate copy in both the DB (authoritative) and messages/*.json.
 *
 * Targets:
 *   - solutions.pos.faq   → the "works when internet drops" Q/A
 *   - software.features.items → the "Keeps working offline" feature card
 *
 * Idempotent (matches by offline keyword; re-running is safe).
 * Run: npx tsx prisma/fix-offline-claims.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const OFFLINE = /ออฟไลน์|เน็ตหลุด|อินเทอร์เน็ตหลุด|offline|离线|脱机/i;

const FAQ_FIX: Record<Locale, { question: string; answer: string }> = {
  th: {
    question: "ต้องเชื่อมต่ออินเทอร์เน็ตตลอดเวลาไหม?",
    answer:
      "ระบบทำงานแบบออนไลน์ จึงต้องเชื่อมต่ออินเทอร์เน็ต แนะนำให้เตรียมอินเทอร์เน็ตสำรอง เช่น เน็ตมือถือ เพื่อให้ขายได้ต่อเนื่อง",
  },
  en: {
    question: "Does it need an internet connection at all times?",
    answer:
      "The system runs online, so it needs an internet connection. We recommend a backup connection such as a mobile hotspot to keep selling without interruption.",
  },
  zh: {
    question: "需要一直连接互联网吗？",
    answer: "系统在线运行，需要联网。建议准备备用网络（如手机热点），以保证销售不中断。",
  },
};

const FEATURE_FIX: Record<Locale, { title: string; description: string }> = {
  th: {
    title: "ข้อมูลปลอดภัย สำรองบนคลาวด์อัตโนมัติ",
    description:
      "ทุกการขายถูกบันทึกและสำรองขึ้นคลาวด์โดยอัตโนมัติ ไม่ต้องกังวลข้อมูลสูญหายแม้ตัวเครื่องมีปัญหา",
  },
  en: {
    title: "Secure, automatic cloud backup",
    description:
      "Every sale is recorded and backed up to the cloud automatically, so you never lose data even if a device fails.",
  },
  zh: {
    title: "数据安全，自动云备份",
    description: "每一笔销售都会自动记录并备份至云端，即使设备出现问题也不会丢失数据。",
  },
};

async function upsert(namespace: string, key: string, locale: Locale, value: unknown) {
  const stored = typeof value === "string" ? value : JSON.stringify(value);
  await prisma.pageContent.upsert({
    where: { namespace_key_locale: { namespace, key, locale } },
    create: { namespace, key, locale, value: stored },
    update: { value: stored },
  });
}

async function main() {
  for (const locale of ["th", "en", "zh"] as Locale[]) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    // 1) solutions.pos.faq
    const posFaq = messages.solutions?.pos?.faq as
      | { question: string; answer: string }[]
      | undefined;
    if (posFaq) {
      const idx = posFaq.findIndex(
        (f) => OFFLINE.test(f.answer) || OFFLINE.test(f.question)
      );
      if (idx >= 0) {
        posFaq[idx] = FAQ_FIX[locale];
        await upsert("solutions", "pos.faq", locale, posFaq);
        console.log(`${locale}: fixed solutions.pos.faq[${idx}]`);
      }
    }

    // 2) software.features.items
    const feats = messages.software?.features?.items as
      | { title: string; description: string }[]
      | undefined;
    if (feats) {
      const idx = feats.findIndex(
        (f) => OFFLINE.test(f.title) || OFFLINE.test(f.description)
      );
      if (idx >= 0) {
        feats[idx] = FEATURE_FIX[locale];
        await upsert("software", "features.items", locale, feats);
        console.log(`${locale}: fixed software.features.items[${idx}]`);
      }
    }

    fs.writeFileSync(file, JSON.stringify(messages, null, 2) + "\n", "utf8");
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
