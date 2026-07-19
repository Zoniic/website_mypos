/**
 * One-off, idempotent migration adding the "selfService" homepage section —
 * the real differentiators of MYPOS self-service ordering (10-language UI,
 * freeing staff, eliminating cash-skimming fraud, cutting wait time and
 * labour cost). Edit via Admin → Content → selfService.
 *
 * Run: npx tsx prisma/add-selfservice-section.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const LANGUAGES = [
  "ไทย",
  "English",
  "中文",
  "日本語",
  "한국어",
  "Français",
  "Deutsch",
  "Español",
  "Русский",
  "العربية",
];

const CONTENT: Record<Locale, Record<string, unknown>> = {
  th: {
    eyebrow: "จุดเด่นตู้สั่งอาหารเอง",
    title: "ตู้สั่งอาหารเองที่แก้ปัญหาหน้าร้านได้จริง",
    lede: "ไม่ใช่แค่รับออเดอร์ แต่แก้ปัญหาที่เจ้าของร้านเจอทุกวัน",
    languagesTitle: "รองรับ 10 ภาษา",
    languagesDesc:
      "ลูกค้าต่างชาติเลือกภาษาแล้วสั่งเองได้ ไม่ต้องพึ่งพนักงานที่สื่อสารไม่ได้ ลดข้อผิดพลาดของออเดอร์",
    languages: LANGUAGES,
    items: [
      {
        title: "ตัดปัญหาทุจริตของพนักงาน",
        description:
          "ลูกค้ากดสั่งเอง ออเดอร์ถูกสร้างในระบบทุกครั้ง เจ้าของเห็นยอดขายครบ — หมดปัญหาพนักงานไม่กดขายแล้วรับเงินสดเข้ากระเป๋าตัวเอง",
        featured: true,
      },
      {
        title: "พนักงานไปโฟกัสงานสำคัญ",
        description:
          "ไม่ต้องยืนรับออเดอร์ ให้พนักงานไปเร่งทำอาหารและดูแลบริการอื่นแทน งานไหลลื่นขึ้นทั้งร้าน",
        featured: false,
      },
      {
        title: "ลดเวลารอช่วงลูกค้าแน่น",
        description:
          "วางหลายเครื่องรับออเดอร์พร้อมกัน คิวหน้าเคาน์เตอร์สั้นลง ขายได้มากขึ้นในชั่วโมงเร่งด่วน",
        featured: false,
      },
      {
        title: "ลดต้นทุนพนักงาน",
        description:
          "รับมือค่าแรงที่สูงขึ้นและปัญหาหาคนยาก ด้วยเครื่องที่ช่วยแบ่งเบางานได้ตลอดวัน",
        featured: false,
      },
    ],
  },
  en: {
    eyebrow: "Self-service ordering",
    title: "Self-order kiosks that fix real front-of-house problems",
    lede: "Not just taking orders — solving the problems owners face every day.",
    languagesTitle: "10 languages built in",
    languagesDesc:
      "Foreign customers pick their language and order themselves — no reliance on staff who can't communicate, and fewer order mistakes.",
    languages: LANGUAGES,
    items: [
      {
        title: "Eliminates staff cash-skimming",
        description:
          "Customers place their own orders, so every order is recorded and the owner sees the true total — no more staff pocketing cash without ringing up the sale.",
        featured: true,
      },
      {
        title: "Frees staff for what matters",
        description:
          "No standing at the counter taking orders — staff cook and serve instead, and the whole shop runs smoother.",
        featured: false,
      },
      {
        title: "Cuts wait time at peak",
        description:
          "Run several kiosks in parallel — shorter counter queues and more sales during rush hour.",
        featured: false,
      },
      {
        title: "Lowers labour cost",
        description:
          "Cope with rising wages and hard-to-fill roles with kiosks that share the load all day.",
        featured: false,
      },
    ],
  },
  zh: {
    eyebrow: "自助点餐",
    title: "真正解决前厅问题的自助点餐机",
    lede: "不只是点餐，更解决店主每天面对的问题。",
    languagesTitle: "内置 10 种语言",
    languagesDesc:
      "外国顾客选择语言即可自助点餐，无需依赖沟通不便的员工，也减少点错单。",
    languages: LANGUAGES,
    items: [
      {
        title: "杜绝员工私吞现金",
        description:
          "顾客自助下单，每一单都被记录，店主看到真实营业额——员工不再能不开单而把现金收进自己口袋。",
        featured: true,
      },
      {
        title: "让员工专注重要工作",
        description: "无需站在柜台点餐，员工可专注备餐与服务，全店运转更顺畅。",
        featured: false,
      },
      {
        title: "高峰期缩短等待",
        description: "并行运行多台自助机，柜台排队更短，高峰期销售更多。",
        featured: false,
      },
      {
        title: "降低人力成本",
        description: "以自助机全天分担工作，应对工资上涨与招工困难。",
        featured: false,
      },
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
        where: { namespace_key_locale: { namespace: "selfService", key, locale } },
        create: { namespace: "selfService", key, locale, value: stored },
        update: { value: stored },
      });
    }

    messages.selfService = CONTENT[locale];
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
