/**
 * Idempotent migration adding the "savingsCalculator" namespace — copy for
 * the /tools/savings-calculator page. Writes the DB and messages/*.json.
 * Edit via Admin → Page Content → savingsCalculator.
 * Run: npx tsx prisma/add-savings-calculator.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const CONTENT: Record<Locale, Record<string, string>> = {
  th: {
    metaTitle: "คำนวณความคุ้มค่าตู้สั่งอาหาร Self-Order Kiosk | MYPOS",
    metaDescription:
      "ประเมินค่าแรงที่ประหยัดได้ ยอดขายที่เพิ่มขึ้น และระยะเวลาคืนทุนของตู้สั่งอาหารด้วยตนเอง ด้วยตัวเลขของร้านคุณเอง ใช้ฟรี ไม่ต้องลงทะเบียน",
    breadcrumb: "คำนวณความคุ้มค่า",
    eyebrow: "เครื่องมือฟรี",
    title: "ตู้สั่งอาหารคืนทุนเร็วแค่ไหนสำหรับร้านคุณ?",
    lede: "ใส่ตัวเลขจริงของร้าน ผลลัพธ์จะคำนวณให้ทันที ทุกค่าเป็นสมมติฐานที่คุณปรับเองได้ เราไม่เก็บข้อมูลที่กรอก",
    inputsTitle: "ข้อมูลร้านของคุณ",
    ordersPerDay: "จำนวนบิลต่อวัน",
    openDays: "จำนวนวันที่เปิดร้านต่อเดือน",
    avgTicket: "ยอดขายเฉลี่ยต่อบิล (บาท)",
    staffSaved: "จำนวนพนักงานรับออเดอร์ที่ไม่ต้องจ้างเพิ่ม หรือย้ายไปทำงานอื่นได้",
    staffCost: "ค่าใช้จ่ายต่อพนักงาน 1 คนต่อเดือน (บาท)",
    staffCostHint: "รวมค่าแรง ประกันสังคม และสวัสดิการ",
    upsellPercent: "ยอดต่อบิลที่เพิ่มขึ้นจากการแนะนำเมนูเสริม (%)",
    upsellHint: "สมมติฐาน ตั้งเป็น 0 ถ้าไม่ต้องการนับส่วนนี้",
    marginPercent: "กำไรขั้นต้นของยอดขายที่เพิ่มขึ้น (%)",
    investment: "ราคาตู้และค่าติดตั้ง (บาท)",
    investmentHint: "ใส่ราคาจากใบเสนอราคาจริง",
    monthlyFee: "ค่าบริการรายเดือน (บาท)",
    resultsTitle: "ผลการประเมิน",
    laborSavings: "ค่าแรงที่ประหยัดได้ต่อเดือน",
    extraProfit: "กำไรเพิ่มจากยอดต่อบิลต่อเดือน",
    monthlyBenefit: "ประโยชน์สุทธิต่อเดือน",
    payback: "ระยะเวลาคืนทุน",
    paybackMonths: "{months} เดือน",
    paybackNever: "ยังไม่คืนทุนด้วยตัวเลขนี้",
    yearOne: "ผลตอบแทนสุทธิปีแรก",
    disclaimer:
      "ผลลัพธ์เป็นการประเมินเบื้องต้นจากตัวเลขที่คุณกรอก ไม่ใช่การรับประกันผลลัพธ์ ผลจริงขึ้นอยู่กับหน้างาน เมนู และพฤติกรรมลูกค้าของแต่ละร้าน",
    ctaTitle: "อยากได้ตัวเลขที่แม่นกว่านี้?",
    ctaBody: "ทีมงานประเมินหน้างานให้ฟรี และเสนอจำนวนตู้ที่เหมาะกับปริมาณลูกค้าจริงของร้านคุณ",
    ctaDemo: "นัดสาธิตฟรี",
    ctaQuote: "ขอใบเสนอราคา",
  },
  en: {
    metaTitle: "Self-Order Kiosk Savings & Payback Calculator | MYPOS",
    metaDescription:
      "Estimate labour savings, extra revenue and payback time for a self-order kiosk using your own numbers. Free, no sign-up.",
    breadcrumb: "Savings calculator",
    eyebrow: "Free tool",
    title: "How fast would a self-order kiosk pay off for you?",
    lede: "Enter your real numbers and see results instantly. Every value is an assumption you control — we don't store anything you type.",
    inputsTitle: "Your business",
    ordersPerDay: "Orders per day",
    openDays: "Open days per month",
    avgTicket: "Average spend per order (THB)",
    staffSaved: "Order-taking staff you no longer need to hire, or can redeploy",
    staffCost: "Monthly cost per staff member (THB)",
    staffCostHint: "Including wages, social security and benefits",
    upsellPercent: "Increase in spend per order from add-on suggestions (%)",
    upsellHint: "An assumption — set to 0 to leave it out",
    marginPercent: "Gross margin on the extra sales (%)",
    investment: "Kiosk price and installation (THB)",
    investmentHint: "Use the price from a real quote",
    monthlyFee: "Monthly service fee (THB)",
    resultsTitle: "Estimate",
    laborSavings: "Labour savings per month",
    extraProfit: "Extra profit from higher spend per month",
    monthlyBenefit: "Net benefit per month",
    payback: "Payback period",
    paybackMonths: "{months} months",
    paybackNever: "Doesn't pay back with these numbers",
    yearOne: "Net return in year one",
    disclaimer:
      "This is a rough estimate based on the numbers you entered, not a guarantee. Real results depend on your site, menu and customer behaviour.",
    ctaTitle: "Want a more precise number?",
    ctaBody: "Our team will survey your site for free and recommend the right number of kiosks for your real customer volume.",
    ctaDemo: "Book a free demo",
    ctaQuote: "Request a quote",
  },
  zh: {
    metaTitle: "自助点餐机节省与回本计算器 | MYPOS",
    metaDescription: "用您自己的数据，估算自助点餐机可节省的人工成本、增加的营收以及回本时间。免费，无需注册。",
    breadcrumb: "节省计算器",
    eyebrow: "免费工具",
    title: "自助点餐机在您店里多快能回本？",
    lede: "输入您店里的真实数据，结果即时计算。每个数值都是您可调整的假设，我们不会保存您输入的任何内容。",
    inputsTitle: "您的门店",
    ordersPerDay: "每日订单数",
    openDays: "每月营业天数",
    avgTicket: "平均每单消费（泰铢）",
    staffSaved: "无需新增或可调往其他岗位的点餐员工人数",
    staffCost: "每名员工每月成本（泰铢）",
    staffCostHint: "包括工资、社保和福利",
    upsellPercent: "推荐加购带来的每单消费增幅（%）",
    upsellHint: "此为假设，设为 0 则不计入",
    marginPercent: "新增销售的毛利率（%）",
    investment: "自助机价格及安装费（泰铢）",
    investmentHint: "请填写实际报价",
    monthlyFee: "每月服务费（泰铢）",
    resultsTitle: "估算结果",
    laborSavings: "每月节省人工成本",
    extraProfit: "每月因客单价提升增加的利润",
    monthlyBenefit: "每月净收益",
    payback: "回本周期",
    paybackMonths: "{months} 个月",
    paybackNever: "按此数据无法回本",
    yearOne: "第一年净回报",
    disclaimer: "结果仅为根据您输入数据的初步估算，并非保证。实际效果取决于门店、菜单和顾客行为。",
    ctaTitle: "想要更精确的数字？",
    ctaBody: "我们的团队免费上门勘察，并根据您的实际客流推荐合适的自助机数量。",
    ctaDemo: "预约免费演示",
    ctaQuote: "获取报价",
  },
};

async function main() {
  for (const locale of Object.keys(CONTENT) as Locale[]) {
    for (const [key, value] of Object.entries(CONTENT[locale])) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "savingsCalculator", key, locale } },
        create: { namespace: "savingsCalculator", key, locale, value },
        update: { value },
      });
    }
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    messages.savingsCalculator = CONTENT[locale];
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
