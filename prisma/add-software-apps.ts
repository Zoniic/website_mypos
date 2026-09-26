/**
 * Idempotent migration: turns /software into the MYPOS back-office page and
 * adds "key features by app" (software.apps.items), taken from the apps
 * themselves — the Self-Service Ordering / POS app (ui_food_ordering), KDS
 * (ui_kitchen_printer), Lemon vending, the queue display and the Maguro back
 * office. Only features present in those apps are listed.
 *
 * Everything here is editable afterwards in Admin → Page Content → software
 * (apps.items is a JSON list; the admin guide explains its shape).
 * Run: npx tsx prisma/add-software-apps.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";
type App = { name: string; summary: string; href: string; points: string[] };

const COPY: Record<Locale, { nav: Record<string, string>; software: Record<string, unknown> }> = {
  th: {
    nav: { software: "ระบบหลังบ้าน" },
    software: {
      metaTitle: "ระบบหลังบ้าน MYPOS | Dashboard คุมทุกเครื่อง ทุกสาขา",
      metaDescription:
        "ระบบหลังบ้าน MYPOS จัดการเมนู ราคา สต็อก คูปอง และดูยอดขายของตู้สั่งอาหาร POS KDS ชั่งขีด จอเรียกคิว และ Vending Machine Online ได้จากเว็บเดียว",
      hero: {
        eyebrow: "ระบบหลังบ้าน MYPOS",
        title: "ระบบหลังบ้านเดียว คุมทุกเครื่อง ทุกสาขา",
        subtitle:
          "จัดการเมนู ราคา สต็อก คูปอง และดูยอดขายของตู้สั่งอาหาร POS KDS ชั่งขีด จอเรียกคิว และ Vending Machine Online ได้จากเว็บเดียว พัฒนาเองทั้งระบบโดยทีมงาน MYPOS",
        cta: "ขอดูตัวอย่างระบบ (Demo)",
      },
      apps: {
        title: "ฟีเจอร์เด่นของแต่ละแอป",
        lede: "ทุกเครื่องของ MYPOS ใช้ซอฟต์แวร์ที่เราพัฒนาเอง และทำงานร่วมกันผ่านระบบหลังบ้านเดียว",
        more: "ดูรายละเอียด",
        items: [
          {
            name: "ตู้สั่งอาหารด้วยตนเอง",
            summary: "ลูกค้าสั่งและจ่ายเองที่ตู้ ออเดอร์เข้าครัวทันที",
            href: "/solutions/self-order",
            points: [
              "เมนูพร้อมตัวเลือกเสริม และเมนูแบบเลือกทีละขั้น เช่น หม้อไฟ",
              "เลือกทานที่ร้านหรือกลับบ้าน และระบุเลขโต๊ะหรือเลขคิว",
              "จ่ายด้วย QR บัตรเครดิต (EDC) หรือเลือกไปจ่ายที่แคชเชียร์",
              "หลายภาษา พร้อมเสียงแนะนำขั้นตอน",
              "แสดงโฆษณาบนหน้าจอขณะไม่มีคนใช้งาน",
              "สแกนบาร์โค้ดสินค้าได้",
            ],
          },
          {
            name: "POS หน้าร้าน",
            summary: "เครื่องคิดเงินหน้าร้านสำหรับพนักงาน",
            href: "/solutions/pos",
            points: [
              "โหมดแคชเชียร์ พนักงานเข้าใช้งานด้วยรหัส PIN",
              "บันทึกออเดอร์จากแอปเดลิเวอรีเข้าระบบเดียวกัน",
              "พิมพ์ใบเสร็จและฉลาก เลือกได้ว่าจะพิมพ์ใบเสร็จหรือไม่",
              "ตัดสต็อกอัตโนมัติ แจ้งเตือนสต็อกใกล้หมด และบันทึกตัดของเสีย",
              "คำนวณภาษีมูลค่าเพิ่ม (VAT)",
            ],
          },
          {
            name: "POS/Self Ordering ชั่งขีด",
            summary: "ชั่งน้ำหนักและคิดเงินในเครื่องเดียว",
            href: "/solutions/weigh-pay",
            points: [
              "เชื่อมเครื่องชั่ง คิดราคาตามน้ำหนักทันที",
              "ใช้เป็นจุดให้ลูกค้าชั่งและจ่ายเอง หรือใช้เป็น POS ที่เคาน์เตอร์",
              "จ่ายด้วย QR บัตร หรือเงินสดที่แคชเชียร์",
              "จัดการสินค้าและราคาผ่านระบบหลังบ้าน",
            ],
          },
          {
            name: "KDS จอครัว",
            summary: "จอครัวรับออเดอร์ พิมพ์ใบสั่ง และเรียกคิว",
            href: "/solutions/kds",
            points: [
              "ออเดอร์จากตู้และ POS ขึ้นจอทันที พร้อมตัวเลือกเสริม",
              "พิมพ์ใบสั่งแยกตามหมวดไปยังเครื่องพิมพ์ของแต่ละสถานี ทั้งแบบเครือข่ายและบลูทูธ",
              "เรียกคิวและเรียกซ้ำ ข้อมูลขึ้นจอเรียกคิวอัตโนมัติ",
              "ใช้เป็นจุดรับชำระเงินพร้อมลิ้นชักเก็บเงิน",
              "ใช้คูปองส่วนลด คำนวณ VAT และสรุปยอดขายประจำวัน",
              "ยกเลิกบิลที่ไม่ชำระภายในเวลาที่กำหนดอัตโนมัติ",
            ],
          },
          {
            name: "จอเรียกคิว",
            summary: "แสดงสถานะคิวบนทีวีหน้าร้าน",
            href: "/solutions/queue-display",
            points: [
              "3 สถานะ: รอชำระเงิน · กำลังทำ · พร้อมรับ",
              "แสดงทั้งจำนวนคิวและเลขคิวในแต่ละสถานะ",
              "ใช้ทีวีเดิมของร้านกับ Android Box ของ MYPOS หรือรับเป็นชุดพร้อมทีวี",
              "ข้อมูลมาจากตู้สั่งอาหาร POS และ KDS โดยตรง",
            ],
          },
          {
            name: "Vending Machine Online",
            summary: "ตู้ขายสินค้าอัตโนมัติที่จัดการจากระยะไกล",
            href: "/solutions/vending-online",
            points: [
              "จอสัมผัสแนวตั้ง 10.1 / 15.6 / 21.5 นิ้ว",
              "รับเหรียญและธนบัตรพร้อมทอนเงิน",
              "สแกนจ่าย PromptPay WeChat Pay Alipay TrueMoney LAO QR และบัตรเงินสดระบบปิด",
              "ใช้คูปองส่วนลดแบบรหัสหรือ QR Code",
              "10 ภาษา และแสดงโฆษณาขณะไม่มีคนใช้งาน",
              "ดูสต็อกและสถานะตู้ผ่านระบบหลังบ้าน",
            ],
          },
        ] satisfies App[],
      },
    },
  },
  en: {
    nav: { software: "Back office" },
    software: {
      metaTitle: "MYPOS back office | One dashboard for every machine and branch",
      metaDescription:
        "The MYPOS back office manages menus, prices, stock, coupons and sales for self-order kiosks, POS, KDS, weigh-and-pay, queue displays and Vending Machine Online from one website.",
      hero: {
        eyebrow: "MYPOS back office",
        title: "One back office for every machine and every branch",
        subtitle:
          "Manage menus, prices, stock, coupons and sales for self-order kiosks, POS, KDS, weigh-and-pay, queue displays and Vending Machine Online from one website — built entirely in-house by MYPOS.",
        cta: "Book a system demo",
      },
      apps: {
        title: "Key features of each app",
        lede: "Every MYPOS machine runs software we build ourselves, and they all work together through one back office.",
        more: "Learn more",
        items: [
          {
            name: "Self-order kiosk",
            summary: "Customers order and pay at the kiosk; orders go straight to the kitchen.",
            href: "/solutions/self-order",
            points: [
              "Menus with add-on options, plus step-by-step menus such as hotpot",
              "Dine-in or takeaway, with table or queue number",
              "Pay by QR, credit card (EDC), or choose to pay at the cashier",
              "Multiple languages with voice guidance",
              "Ads on screen while idle",
              "Product barcode scanning",
            ],
          },
          {
            name: "POS terminal",
            summary: "The counter till for staff.",
            href: "/solutions/pos",
            points: [
              "Cashier mode with staff PIN login",
              "Record delivery-app orders in the same system",
              "Receipt and label printing, with receipt printing optional",
              "Automatic stock deduction, low-stock alerts and write-offs",
              "VAT calculation",
            ],
          },
          {
            name: "Weigh & pay POS / self-ordering",
            summary: "Weighing and checkout on one device.",
            href: "/solutions/weigh-pay",
            points: [
              "Connects to the scale and prices by weight instantly",
              "Use as a self-serve weigh-and-pay point or as a counter POS",
              "Pay by QR, card, or cash at the cashier",
              "Products and prices managed in the back office",
            ],
          },
          {
            name: "KDS kitchen display",
            summary: "Kitchen screen for orders, tickets and queue calls.",
            href: "/solutions/kds",
            points: [
              "Kiosk and POS orders appear instantly, with options",
              "Tickets printed by category to each station's printer, network or Bluetooth",
              "Queue calls and recalls, shown on the queue display automatically",
              "Doubles as a payment point with a cash drawer",
              "Discount coupons, VAT and a daily sales summary",
              "Unpaid bills cancelled automatically after a set time",
            ],
          },
          {
            name: "Queue display",
            summary: "Queue status on the TV in your shop.",
            href: "/solutions/queue-display",
            points: [
              "Three statuses: Awaiting payment · Preparing · Ready",
              "The count and queue numbers for each status",
              "Your own TV with the MYPOS Android box, or a set with a TV",
              "Fed directly by kiosks, POS and KDS",
            ],
          },
          {
            name: "Vending Machine Online",
            summary: "A vending machine you manage remotely.",
            href: "/solutions/vending-online",
            points: [
              "Vertical touchscreen, 10.1\" / 15.6\" / 21.5\"",
              "Coins and banknotes with change",
              "PromptPay, WeChat Pay, Alipay, TrueMoney, LAO QR and closed-loop cash cards",
              "Discount coupons as codes or QR codes",
              "10 languages and ads while idle",
              "Stock and machine status in the back office",
            ],
          },
        ] satisfies App[],
      },
    },
  },
  zh: {
    nav: { software: "后台系统" },
    software: {
      metaTitle: "MYPOS 后台系统 | 一个看板管理所有设备和门店",
      metaDescription:
        "MYPOS 后台系统在一个网站上管理自助点餐机、POS、KDS、称重结账、叫号屏和 Vending Machine Online 的菜单、价格、库存、优惠券和销售。",
      hero: {
        eyebrow: "MYPOS 后台系统",
        title: "一个后台，管理所有设备和所有门店",
        subtitle:
          "在一个网站上管理自助点餐机、POS、KDS、称重结账、叫号屏和 Vending Machine Online 的菜单、价格、库存、优惠券和销售——全部由 MYPOS 团队自主开发。",
        cta: "预约系统演示",
      },
      apps: {
        title: "各应用的主要功能",
        lede: "MYPOS 所有设备都运行我们自主开发的软件，并通过同一个后台协同工作。",
        more: "了解详情",
        items: [
          {
            name: "自助点餐机",
            summary: "顾客在机器上自助点餐付款，订单直达厨房。",
            href: "/solutions/self-order",
            points: ["带加料选项的菜单，以及分步选择的菜单（如火锅）", "堂食或外带，可填写桌号或排队号", "扫码、信用卡（EDC）付款，或选择到收银台付款", "多语言界面并有语音引导", "空闲时屏幕播放广告", "支持扫描商品条码"],
          },
          {
            name: "前台 POS",
            summary: "供店员使用的柜台收银机。",
            href: "/solutions/pos",
            points: ["收银员模式，店员用 PIN 码登录", "外卖平台订单录入同一系统", "打印小票和标签，可选择是否打印小票", "自动扣减库存、低库存提醒和报损记录", "计算增值税（VAT）"],
          },
          {
            name: "称重结账 POS / 自助点餐",
            summary: "称重和结账在一台设备上完成。",
            href: "/solutions/weigh-pay",
            points: ["连接电子秤，按重量即时计价", "可作为顾客自助称重付款点，也可作为柜台 POS", "扫码、刷卡或到收银台付现金", "在后台管理商品和价格"],
          },
          {
            name: "KDS 厨房显示屏",
            summary: "厨房接单、打印和叫号的屏幕。",
            href: "/solutions/kds",
            points: ["点餐机和 POS 的订单即时显示，含加料选项", "按分类打印到各工作站的打印机，支持网络和蓝牙", "叫号与重复叫号，自动显示在叫号屏", "可作为收款点并连接钱箱", "优惠券、增值税和每日销售汇总", "超时未付款的账单自动取消"],
          },
          {
            name: "叫号显示屏",
            summary: "在店内电视上显示排队状态。",
            href: "/solutions/queue-display",
            points: ["三种状态：待付款 · 制作中 · 可取餐", "显示每种状态的数量和号码", "店内现有电视配 MYPOS Android 盒子，或购买含电视套装", "数据直接来自点餐机、POS 和 KDS"],
          },
          {
            name: "Vending Machine Online",
            summary: "可远程管理的自动售货机。",
            href: "/solutions/vending-online",
            points: ["竖屏触摸屏 10.1 / 15.6 / 21.5 英寸", "收硬币和纸币并找零", "PromptPay、WeChat Pay、Alipay、TrueMoney、LAO QR 及封闭式储值卡", "代码或二维码形式的折扣优惠券", "10 种语言，空闲时播放广告", "在后台查看库存和设备状态"],
          },
        ] satisfies App[],
      },
    },
  },
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

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const base = target[key];
      target[key] = deepMerge(base && typeof base === "object" && !Array.isArray(base) ? (base as Record<string, unknown>) : {}, value as Record<string, unknown>);
    } else target[key] = value;
  }
  return target;
}

async function main() {
  for (const locale of Object.keys(COPY) as Locale[]) {
    for (const [namespace, tree] of Object.entries(COPY[locale])) {
      for (const [key, value] of Object.entries(flatten(tree))) {
        await prisma.pageContent.upsert({
          where: { namespace_key_locale: { namespace, key, locale } },
          create: { namespace, key, locale, value },
          update: { value },
        });
      }
    }
    const file = path.join(messagesDir, `${locale}.json`);
    const raw = fs.readFileSync(file, "utf8");
    const messages = deepMerge(JSON.parse(raw), COPY[locale] as Record<string, unknown>);
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
