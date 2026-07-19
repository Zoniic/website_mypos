/**
 * One-off, idempotent migration adding the "useCases" homepage section — a
 * by-industry entry point that links each business type to the product list
 * pre-filtered to it (/products?businessType=<type>).
 *
 * Copy is a first draft; edit via Admin → Content → useCases.
 * Run: npx tsx prisma/add-usecases-section.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const CONTENT: Record<Locale, Record<string, unknown>> = {
  th: {
    eyebrow: "ตามประเภทธุรกิจ",
    title: "เลือกระบบตามธุรกิจของคุณ",
    lede: "แต่ละธุรกิจมีโจทย์ต่างกัน เลือกประเภทของคุณเพื่อดูรุ่นและโซลูชันที่เหมาะที่สุด",
    items: [
      { type: "restaurant", title: "ร้านอาหาร", blurb: "รับออเดอร์ไว ลดคิว เชื่อมครัวและเดลิเวอรี" },
      { type: "retail", title: "ค้าปลีก", blurb: "ขายและจัดการสต็อกแม่นยำ พร้อมบาร์โค้ด" },
      { type: "buffet", title: "บุฟเฟต์", blurb: "คิดเงินตามหัวหรือตามน้ำหนัก จับเวลาโต๊ะ" },
      { type: "convenience", title: "ร้านสะดวกซื้อ", blurb: "สแกนเร็ว ปิดการขายไว จัดการสต็อกอัตโนมัติ" },
      { type: "themepark", title: "สวนสนุก", blurb: "ขายบัตร ออกตั๋ว และจัดการคิวเข้าเล่น" },
      { type: "hotel", title: "โรงแรม", blurb: "เชื่อมห้องพักและร้านอาหารในระบบเดียว" },
      { type: "cafeteria", title: "โรงอาหาร", blurb: "บัตร/คูปองพนักงาน ตัดยอดอัตโนมัติ" },
      { type: "bakery", title: "เบเกอรี่", blurb: "ชั่งน้ำหนัก ติดป้ายราคา และขายหน้าร้าน" },
      { type: "manufacturing", title: "การผลิต", blurb: "โรงอาหารพนักงานและจุดขายในโรงงาน" },
    ],
  },
  en: {
    eyebrow: "By industry",
    title: "Find the system for your business",
    lede: "Every business has different needs — pick yours to see the best-fit models and solutions.",
    items: [
      { type: "restaurant", title: "Restaurants", blurb: "Faster orders, shorter queues, kitchen & delivery linked" },
      { type: "retail", title: "Retail", blurb: "Accurate sales and stock control, barcode-ready" },
      { type: "buffet", title: "Buffet", blurb: "Charge per head or by weight, with table timing" },
      { type: "convenience", title: "Convenience stores", blurb: "Fast scanning, quick checkout, auto stock control" },
      { type: "themepark", title: "Theme parks", blurb: "Sell passes, issue tickets, manage entry queues" },
      { type: "hotel", title: "Hotels", blurb: "Rooms and restaurants in one connected system" },
      { type: "cafeteria", title: "Cafeterias", blurb: "Staff cards / coupons with automatic deduction" },
      { type: "bakery", title: "Bakeries", blurb: "Weigh, label pricing, and sell at the counter" },
      { type: "manufacturing", title: "Manufacturing", blurb: "Staff canteens and points of sale on-site" },
    ],
  },
  zh: {
    eyebrow: "按行业",
    title: "为您的业务找到合适的系统",
    lede: "每个行业需求各异——选择您的类型，查看最合适的机型与方案。",
    items: [
      { type: "restaurant", title: "餐厅", blurb: "下单更快、排队更短，连接后厨与外卖" },
      { type: "retail", title: "零售", blurb: "精准销售与库存管理，支持条码" },
      { type: "buffet", title: "自助餐", blurb: "按人或按重量计费，支持餐桌计时" },
      { type: "convenience", title: "便利店", blurb: "快速扫码、快速结账、自动库存管理" },
      { type: "themepark", title: "主题乐园", blurb: "售卡、出票、管理入场排队" },
      { type: "hotel", title: "酒店", blurb: "客房与餐厅统一互联系统" },
      { type: "cafeteria", title: "员工食堂", blurb: "员工卡/券自动扣减" },
      { type: "bakery", title: "烘焙店", blurb: "称重、打印价签、门店销售" },
      { type: "manufacturing", title: "制造业", blurb: "厂区员工食堂与销售点" },
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
        where: { namespace_key_locale: { namespace: "useCases", key, locale } },
        create: { namespace: "useCases", key, locale, value: stored },
        update: { value: stored },
      });
    }

    messages.useCases = CONTENT[locale];
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
