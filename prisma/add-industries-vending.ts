/**
 * Idempotent migration: two industry landing pages aimed at vending buyers
 * — offices & buildings, and schools & universities — plus their labels
 * and entries in the homepage use-case list. Closed-loop cash cards are
 * mentioned only for Vending Machine Online, where they're confirmed.
 * Run: npx tsx prisma/add-industries-vending.ts (then seed-categories.ts)
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";
type Industry = {
  metaTitle: string;
  metaDescription: string;
  hero: { eyebrow: string; title: string; subtitle: string };
  painGain: { pain: string; gain: string }[];
  steps: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
};
type UseCase = { type: string; title: string; blurb: string };

const INDUSTRIES: Record<Locale, { office: Industry; school: Industry }> = {
  th: {
    office: {
      metaTitle: "ตู้ Vending สำหรับสำนักงานและอาคาร | MYPOS",
      metaDescription:
        "ตู้ขายสินค้าอัตโนมัติสำหรับสำนักงาน อาคาร และคอนโด ขายได้ 24 ชั่วโมง รับเงินสดพร้อมทอน สแกนจ่าย QR และบัตรพนักงานแบบระบบปิด ดูสต็อกทุกตู้ผ่านระบบหลังบ้าน",
      hero: {
        eyebrow: "สำนักงานและอาคาร",
        title: "ของกินของใช้สำหรับพนักงาน ขายได้ตลอดวันโดยไม่ต้องมีคนเฝ้า",
        subtitle: "ตู้ Vending Machine ที่รับเงินสด สแกนจ่าย และบัตรพนักงานแบบระบบปิด พร้อมดูสต็อกทุกตู้จากระบบหลังบ้าน",
      },
      painGain: [
        { pain: "ร้านค้าในอาคารปิดหลังเลิกงาน พนักงานกะดึกซื้ออะไรไม่ได้", gain: "ตู้ขายได้ 24 ชั่วโมง ไม่ต้องมีพนักงานขาย" },
        { pain: "ต้องส่งคนไปเช็กและเติมสินค้าทุกตู้", gain: "ดูสต็อกของแต่ละตู้ผ่านระบบหลังบ้าน เติมเฉพาะตู้ที่ใกล้หมด" },
        { pain: "พนักงานไม่พกเงินสด", gain: "สแกนจ่าย QR หรือใช้บัตรพนักงานแบบระบบปิด" },
      ],
      steps: [
        { title: "เลือกสินค้า", description: "พนักงานเลือกสินค้าบนจอสัมผัสของตู้" },
        { title: "จ่ายเงิน", description: "เงินสดพร้อมทอน สแกน QR หรือบัตรพนักงานแบบระบบปิด" },
        { title: "ดูยอดและสต็อก", description: "ผู้ดูแลเห็นยอดขายและสต็อกของทุกตู้จากระบบหลังบ้าน" },
      ],
      faq: [
        { question: "ใช้บัตรพนักงานจ่ายได้ไหม?", answer: "Vending Machine Online รองรับบัตรเงินสดระบบปิด (Closed-loop) ทีมงานจะประเมินร่วมกับระบบบัตรที่องค์กรใช้อยู่" },
        { question: "จุดติดตั้งไม่มีอินเทอร์เน็ต ใช้ได้ไหม?", answer: "ใช้รุ่น Offline ที่รับเหรียญและธนบัตรได้ แต่จะไม่มีสแกนจ่าย และไม่เห็นสต็อกผ่านระบบหลังบ้าน" },
        { question: "ขายสินค้าอะไรได้บ้าง?", answer: "ตู้ CAN เหมาะกับเครื่องดื่มขวดและกระป๋อง มีระบบทำความเย็น ตู้ Spiral ใส่ได้ทั้งเครื่องดื่มและขนมถุง" },
      ],
    },
    school: {
      metaTitle: "ตู้ Vending และตู้สั่งอาหารสำหรับโรงเรียนและมหาวิทยาลัย | MYPOS",
      metaDescription:
        "ตู้สั่งอาหารลดคิวโรงอาหาร และตู้ Vending ที่รับเงินสด สแกนจ่าย และบัตรนักเรียนแบบระบบปิด สำหรับโรงเรียนและมหาวิทยาลัย ดูยอดขายและสต็อกผ่านระบบหลังบ้าน",
      hero: {
        eyebrow: "สถานศึกษา",
        title: "ลดคิวช่วงพัก และขายได้ทั้งวันในโรงเรียนและมหาวิทยาลัย",
        subtitle: "ตู้สั่งอาหารสำหรับโรงอาหาร และตู้ Vending ที่รับเงินสด สแกนจ่าย หรือบัตรนักเรียนแบบระบบปิด",
      },
      painGain: [
        { pain: "คิวโรงอาหารยาวช่วงพัก เวลาพักไม่พอ", gain: "ตู้สั่งอาหารหลายจุด สั่งและจ่ายได้พร้อมกัน" },
        { pain: "นักเรียนพกเงินสด ทอนช้าและเสี่ยงหาย", gain: "ที่ตู้ Vending ใช้บัตรเงินสดระบบปิดหรือสแกน QR ได้" },
        { pain: "ผู้ดูแลไม่รู้ว่าตู้ไหนของใกล้หมด", gain: "ดูสต็อกของทุกตู้ผ่านระบบหลังบ้าน" },
      ],
      steps: [
        { title: "สั่งหรือเลือกสินค้า", description: "สั่งอาหารที่ตู้สั่งอาหาร หรือเลือกสินค้าที่ตู้ Vending" },
        { title: "จ่ายเงิน", description: "เงินสด สแกน QR หรือบัตรเงินสดระบบปิดที่ตู้ Vending" },
        { title: "รับอาหารหรือสินค้า", description: "ครัวเรียกคิวเมื่ออาหารพร้อม สินค้าจากตู้ออกที่ช่องรับทันที" },
      ],
      faq: [
        { question: "ใช้บัตรนักเรียนจ่ายได้ไหม?", answer: "Vending Machine Online รองรับบัตรเงินสดระบบปิด (Closed-loop) ทีมงานจะประเมินร่วมกับระบบบัตรที่สถานศึกษาใช้อยู่" },
        { question: "มีตู้ที่ไม่ต้องใช้อินเทอร์เน็ตไหม?", answer: "มีรุ่น Offline ที่รับเหรียญและธนบัตร แต่จะไม่มีสแกนจ่ายและไม่เห็นสต็อกผ่านระบบหลังบ้าน" },
        { question: "ติดตั้งและดูแลอย่างไร?", answer: "ทีมช่างเข้าสำรวจ ติดตั้ง และสอนใช้งานถึงสถานที่" },
      ],
    },
  },
  en: {
    office: {
      metaTitle: "Vending machines for offices and buildings | MYPOS",
      metaDescription:
        "Vending machines for offices, buildings and condominiums: selling 24 hours, cash with change, QR payments and closed-loop staff cards, with every machine's stock in the back office.",
      hero: {
        eyebrow: "Offices & buildings",
        title: "Snacks and essentials for staff, on sale all day with no one on duty",
        subtitle: "Vending machines that take cash, QR payments and closed-loop staff cards, with every machine's stock in the back office.",
      },
      painGain: [
        { pain: "The building shop closes after hours; night-shift staff can't buy anything", gain: "Machines sell 24 hours, no staff needed" },
        { pain: "Someone has to check and restock every machine", gain: "See each machine's stock in the back office and restock only what's low" },
        { pain: "Staff don't carry cash", gain: "QR payments or closed-loop staff cards" },
      ],
      steps: [
        { title: "Choose", description: "Staff pick products on the machine's touchscreen." },
        { title: "Pay", description: "Cash with change, QR, or a closed-loop staff card." },
        { title: "Track sales and stock", description: "Facility managers see every machine's sales and stock in the back office." },
      ],
      faq: [
        { question: "Can staff pay with their staff cards?", answer: "Vending Machine Online supports closed-loop cash cards; our team will assess it with the card system you use." },
        { question: "What if there's no internet at the location?", answer: "The Offline model takes coins and banknotes, but has no QR payments and no back-office stock." },
        { question: "What can the machines sell?", answer: "CAN cabinets suit bottled and canned drinks and are refrigerated; Spiral cabinets take both drinks and snack bags." },
      ],
    },
    school: {
      metaTitle: "Vending machines and self-order kiosks for schools and universities | MYPOS",
      metaDescription:
        "Self-order kiosks to shorten canteen queues and vending machines that take cash, QR payments and closed-loop student cards, with sales and stock in the back office.",
      hero: {
        eyebrow: "Schools & universities",
        title: "Shorter queues at break time, and sales all day on campus",
        subtitle: "Self-order kiosks for the canteen, and vending machines that take cash, QR payments or closed-loop student cards.",
      },
      painGain: [
        { pain: "Long canteen queues and not enough break time", gain: "Several self-order kiosks take orders and payments in parallel" },
        { pain: "Students carry cash; change is slow and cash gets lost", gain: "At the vending machine, pay with a closed-loop card or QR" },
        { pain: "Staff don't know which machine is running low", gain: "Every machine's stock in the back office" },
      ],
      steps: [
        { title: "Order or choose", description: "Order food at the kiosk or pick a product at the vending machine." },
        { title: "Pay", description: "Cash, QR, or a closed-loop card at the vending machine." },
        { title: "Collect", description: "The kitchen calls the number when food is ready; vending products drop to the pickup bay." },
      ],
      faq: [
        { question: "Can students pay with student cards?", answer: "Vending Machine Online supports closed-loop cash cards; our team will assess it with your institution's card system." },
        { question: "Is there a machine that works without internet?", answer: "Yes, the Offline model takes coins and banknotes, but has no QR payments or back-office stock." },
        { question: "How are they installed and supported?", answer: "Our technicians survey the site, install and train your staff on location." },
      ],
    },
  },
  zh: {
    office: {
      metaTitle: "办公室与楼宇自动售货机 | MYPOS",
      metaDescription: "适用于办公室、楼宇和公寓的自动售货机：24 小时销售，现金找零、扫码支付和封闭式员工卡，后台查看每台机器的库存。",
      hero: {
        eyebrow: "办公与楼宇",
        title: "员工零食日用品全天销售，无需专人值守",
        subtitle: "支持现金、扫码支付和封闭式员工卡的自动售货机，后台查看每台机器的库存。",
      },
      painGain: [
        { pain: "楼内小店下班后关门，夜班员工买不到东西", gain: "售货机 24 小时销售，无需店员" },
        { pain: "需要派人逐台检查和补货", gain: "在后台查看每台机器的库存，只为快售完的机器补货" },
        { pain: "员工不带现金", gain: "扫码支付或使用封闭式员工卡" },
      ],
      steps: [
        { title: "选择商品", description: "员工在机器触摸屏上选择商品。" },
        { title: "付款", description: "现金找零、扫码或封闭式员工卡。" },
        { title: "查看销售和库存", description: "管理人员在后台查看每台机器的销售和库存。" },
      ],
      faq: [
        { question: "可以用员工卡付款吗？", answer: "Vending Machine Online 支持封闭式储值卡，我们的团队会结合贵单位现有的卡系统进行评估。" },
        { question: "安装地点没有网络可以用吗？", answer: "可使用收硬币和纸币的 Offline 款，但不支持扫码，也无法在后台查看库存。" },
        { question: "可以卖哪些商品？", answer: "CAN 机柜适合瓶装和罐装饮料，带制冷；Spiral 机柜可放饮料和袋装零食。" },
      ],
    },
    school: {
      metaTitle: "学校与高校自动售货机和自助点餐机 | MYPOS",
      metaDescription: "自助点餐机缩短食堂排队，自动售货机支持现金、扫码和封闭式学生卡，后台查看销售和库存。",
      hero: {
        eyebrow: "学校与高校",
        title: "课间排队更短，校园全天可售",
        subtitle: "食堂用自助点餐机，以及支持现金、扫码或封闭式学生卡的自动售货机。",
      },
      painGain: [
        { pain: "课间食堂排长队，休息时间不够", gain: "多台自助点餐机同时点餐付款" },
        { pain: "学生带现金，找零慢又容易丢", gain: "在售货机上可使用封闭式储值卡或扫码" },
        { pain: "管理人员不知道哪台机器快售完", gain: "在后台查看每台机器的库存" },
      ],
      steps: [
        { title: "点餐或选购", description: "在自助点餐机点餐，或在售货机选择商品。" },
        { title: "付款", description: "现金、扫码，或在售货机使用封闭式储值卡。" },
        { title: "取餐取货", description: "餐好后厨房叫号；售货机商品直接落到取货口。" },
      ],
      faq: [
        { question: "可以用学生卡付款吗？", answer: "Vending Machine Online 支持封闭式储值卡，我们的团队会结合学校现有的卡系统进行评估。" },
        { question: "有不需要联网的机器吗？", answer: "有，Offline 款收硬币和纸币，但不支持扫码，也无法在后台查看库存。" },
        { question: "如何安装和维护？", answer: "我们的技术人员上门勘察、安装并培训使用。" },
      ],
    },
  },
};

const LABELS: Record<Locale, { office: string; school: string }> = {
  th: { office: "สำนักงานและอาคาร", school: "สถานศึกษา" },
  en: { office: "Offices & buildings", school: "Schools & universities" },
  zh: { office: "办公与楼宇", school: "学校与高校" },
};

/** Short descriptions for the newer lines on industry pages' "recommended solutions". */
const BLURBS: Record<Locale, Record<string, string>> = {
  th: {
    kds: "ออเดอร์จากตู้และหน้าร้านขึ้นจอครัวทันที พิมพ์ใบสั่งแยกสถานี และเรียกคิวได้",
    queueDisplay: "แสดงคิวรอชำระเงิน กำลังทำ และพร้อมรับ บนทีวีของร้าน",
    vendingOnline: "ขาย 24 ชั่วโมง รับเงินสดพร้อมทอน สแกน QR และบัตรระบบปิด ดูสต็อกจากระบบหลังบ้าน",
    vendingOffline: "รับเหรียญและธนบัตร ทำงานได้โดยไม่ต้องใช้อินเทอร์เน็ต",
  },
  en: {
    kds: "Kiosk and counter orders reach the kitchen screen instantly, with station printing and queue calls.",
    queueDisplay: "Awaiting-payment, preparing and ready queues on your shop's TV.",
    vendingOnline: "Sells 24 hours: cash with change, QR and closed-loop cards, stock in the back office.",
    vendingOffline: "Coins and banknotes, works without internet.",
  },
  zh: {
    kds: "点餐机和前台订单即时显示在厨房屏幕，分站打印并可叫号。",
    queueDisplay: "在店内电视上显示待付款、制作中和可取餐的号码。",
    vendingOnline: "24 小时销售：现金找零、扫码和封闭式储值卡，后台查看库存。",
    vendingOffline: "收硬币和纸币，无需联网。",
  },
};

const USE_CASES: Record<Locale, UseCase[]> = {
  th: [
    { type: "office", title: "สำนักงาน", blurb: "ตู้ Vending ขาย 24 ชม. สแกนจ่ายหรือใช้บัตรพนักงาน" },
    { type: "school", title: "สถานศึกษา", blurb: "ลดคิวโรงอาหาร และตู้ Vending ในโรงเรียน" },
  ],
  en: [
    { type: "office", title: "Offices", blurb: "24-hour vending with QR or staff cards" },
    { type: "school", title: "Schools", blurb: "Shorter canteen queues and on-campus vending" },
  ],
  zh: [
    { type: "office", title: "办公室", blurb: "24 小时售货机，扫码或员工卡支付" },
    { type: "school", title: "学校", blurb: "缩短食堂排队，校园售货机" },
  ],
};

function flatten(tree: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const dotted = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[dotted] = value;
    else if (Array.isArray(value)) out[dotted] = JSON.stringify(value);
    else if (value && typeof value === "object") Object.assign(out, flatten(value as Record<string, unknown>, dotted));
  }
  return out;
}

async function upsert(namespace: string, key: string, locale: string, value: string) {
  await prisma.pageContent.upsert({
    where: { namespace_key_locale: { namespace, key, locale } },
    create: { namespace, key, locale, value },
    update: { value },
  });
}

async function main() {
  for (const locale of Object.keys(INDUSTRIES) as Locale[]) {
    const file = path.join(messagesDir, `${locale}.json`);
    const raw = fs.readFileSync(file, "utf8");
    const messages = JSON.parse(raw);

    for (const [key, value] of Object.entries(flatten(INDUSTRIES[locale] as unknown as Record<string, unknown>))) {
      await upsert("industries", key, locale, value);
    }
    messages.industries = { ...messages.industries, ...INDUSTRIES[locale] };

    for (const [key, blurb] of Object.entries(BLURBS[locale])) {
      await upsert("industries", `common.solutionBlurbs.${key}`, locale, blurb);
      messages.industries.common.solutionBlurbs[key] = blurb;
    }
    // An older whole-object row would shadow the dotted keys above; keep it in sync.
    const blurbRow = await prisma.pageContent.findUnique({
      where: { namespace_key_locale: { namespace: "industries", key: "common.solutionBlurbs", locale } },
    });
    if (blurbRow) {
      try {
        await upsert("industries", "common.solutionBlurbs", locale, JSON.stringify({ ...JSON.parse(blurbRow.value), ...BLURBS[locale] }));
      } catch {
        // Not JSON: leave it; the dotted keys still apply.
      }
    }

    for (const [type, label] of Object.entries(LABELS[locale])) {
      await upsert("productsCommon", `businessTypes.${type}`, locale, label);
      messages.productsCommon.businessTypes[type] = label;
    }

    // Append to the homepage use-case list (also printed on the receipt tape).
    // Start from the DB copy so edits made in the admin are kept.
    const row = await prisma.pageContent.findUnique({
      where: { namespace_key_locale: { namespace: "useCases", key: "items", locale } },
    });
    let current: UseCase[] = messages.useCases.items ?? [];
    try {
      if (row) current = JSON.parse(row.value);
    } catch {
      // Malformed DB value: fall back to messages/*.json.
    }
    const items = current.filter((i) => i.type !== "office" && i.type !== "school");
    messages.useCases.items = [...items, ...USE_CASES[locale]];
    await upsert("useCases", "items", locale, JSON.stringify(messages.useCases.items));

    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    fs.writeFileSync(file, JSON.stringify(messages, null, 2).replace(/\n/g, eol) + eol, "utf8");
    console.log(`Updated ${locale}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
