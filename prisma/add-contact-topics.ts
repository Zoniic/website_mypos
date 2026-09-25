/**
 * Idempotent migration adding the contact form's "topic" selector copy to the
 * existing "contact" namespace (formTopic + topics), and replacing formNote,
 * which still said the form was a UI placeholder. Writes the DB and
 * messages/*.json. Run: npx tsx prisma/add-contact-topics.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const CONTENT: Record<
  Locale,
  { formTopic: string; formNote: string; topics: Record<string, string> }
> = {
  th: {
    formTopic: "เรื่องที่ต้องการติดต่อ",
    formNote: "ทีมงานจะติดต่อกลับในเวลาทำการ ข้อมูลของคุณใช้เพื่อติดต่อกลับเท่านั้น",
    topics: {
      demo: "นัดสาธิตการใช้งาน (ฟรี)",
      quote: "ขอใบเสนอราคา",
      general: "สอบถามข้อมูลทั่วไป",
      support: "แจ้งปัญหา / บริการหลังการขาย",
    },
  },
  en: {
    formTopic: "What can we help with?",
    formNote: "We'll get back to you during business hours. Your details are only used to contact you.",
    topics: {
      demo: "Book a demo (free)",
      quote: "Request a quote",
      general: "General question",
      support: "Report a problem / after-sales service",
    },
  },
  zh: {
    formTopic: "咨询事项",
    formNote: "我们会在工作时间内回复您。您的信息仅用于与您联系。",
    topics: {
      demo: "预约演示（免费）",
      quote: "获取报价",
      general: "一般咨询",
      support: "故障报修 / 售后服务",
    },
  },
};

async function main() {
  for (const locale of Object.keys(CONTENT) as Locale[]) {
    const { formTopic, formNote, topics } = CONTENT[locale];
    const rows: Record<string, string> = { formTopic, formNote, topics: JSON.stringify(topics) };
    for (const [key, value] of Object.entries(rows)) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "contact", key, locale } },
        create: { namespace: "contact", key, locale, value },
        update: { value },
      });
    }
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    messages.contact = { ...messages.contact, formTopic, formNote, topics };
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
