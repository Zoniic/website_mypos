/**
 * Idempotent migration for the product-line restructure:
 *  - header Solutions menu (nav.solutionsGroups / nav.solutionsItems)
 *  - new solution pages: KDS, queue display, vending online, vending offline
 *  - feature/spec/back-office labels (solutionsCommon)
 *  - homepage solution tiles, product category labels
 *  - back-office page: dashboard features, managed lines, coupons
 *
 * Facts come from the product owner and the product repos (Lemon vending,
 * Maguro back office, KDS). Nothing here is a performance claim; there are
 * deliberately no case studies for the new lines until real ones exist.
 *
 * Nested objects are written to the DB as dotted keys (the same shape
 * prisma/seed.ts uses), arrays as JSON. messages/*.json are deep-merged.
 * Run: npx tsx prisma/add-product-lines.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";
type Tree = { [key: string]: string | string[] | Tree | Tree[] };

type Solution = {
  metaTitle: string;
  metaDescription: string;
  hero: { eyebrow: string; title: string; subtitle: string };
  painGain: { pain: string; gain: string }[];
  steps: { title: string; description: string }[];
  cases: never[];
  features: { title: string; description: string }[];
  specs: { label: string; value: string }[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, Tree> = {
  th: {
    nav: {
      solutionsGroups: {
        restaurant: "ระบบร้านอาหาร",
        vending: "ขายอัตโนมัติ 24 ชม.",
        ticketing: "ระบบจำหน่ายตั๋วอัตโนมัติ",
        backOffice: "ระบบหลังบ้าน",
      },
      solutionsItems: {
        selfOrder: "ตู้สั่งอาหารด้วยตนเอง",
        pos: "POS หน้าร้าน",
        kds: "KDS จอครัว",
        weighPay: "POS/Self Ordering ชั่งขีด",
        queueDisplay: "จอเรียกคิว",
        vendingOnline: "Vending Machine Online",
        vendingOffline: "Vending Machine Offline",
        ticketing: "ตู้ขายตั๋ว",
        dashboard: "Dashboard",
        coupons: "คูปอง/โปรโมชัน",
      },
    },
    productsCommon: {
      categories: {
        "weigh-pay": "POS/Self Ordering ชั่งขีด",
        kds: "KDS จอครัว",
        "queue-display": "จอเรียกคิว",
        "vending-online": "Vending Machine Online",
        "vending-offline": "Vending Machine Offline",
        ticketing: "ตู้ขายตั๋ว",
      },
    },
    solutionsCommon: {
      featuresTitle: "ความสามารถ",
      specsTitle: "สเปกและตัวเลือก",
      backOfficeTitle: "จัดการทั้งหมดจากระบบหลังบ้านเดียว",
      backOfficeBody:
        "ตู้สั่งอาหาร POS KDS ชั่งขีด จอเรียกคิว และ Vending Machine Online ของ MYPOS จัดการเมนู ราคา สต็อก และดูยอดขายทุกสาขาได้จากเว็บหลังบ้านเดียวกัน",
      backOfficeCta: "ดูระบบหลังบ้าน",
    },
    home: {
      solutions: {
        moreTitle: "ชั่งขีด ขายอัตโนมัติ 24 ชั่วโมง และจำหน่ายตั๋ว",
        items: {
          weighPay: {
            title: "POS/Self Ordering ชั่งขีด",
            description: "ชั่งน้ำหนักและคิดเงินอัตโนมัติ สำหรับร้านมาลาทัง บุฟเฟต์ และเบเกอรี่",
          },
          kds: {
            title: "KDS จอครัว",
            description: "ออเดอร์จากตู้และหน้าร้านขึ้นจอครัวทันที พิมพ์ใบสั่งแยกสถานี และเรียกคิวได้",
          },
          queueDisplay: {
            title: "จอเรียกคิว",
            description: "แสดงคิวรอชำระเงิน กำลังทำ และพร้อมรับ บนทีวีของร้าน",
          },
          vendingOnline: {
            title: "Vending Machine Online",
            description: "จอสัมผัสแนวตั้ง รับเงินสดพร้อมทอน สแกน QR และดูสต็อกเรียลไทม์",
          },
          vendingOffline: {
            title: "Vending Machine Offline",
            description: "รับเหรียญและธนบัตร ไม่ต้องใช้อินเทอร์เน็ต",
          },
          ticketing: {
            title: "ตู้ขายตั๋ว",
            description: "จำหน่ายตั๋วอัตโนมัติ สำหรับสวนสนุก โรงแรม และสถานที่ท่องเที่ยว",
          },
        },
      },
    },
    software: {
      features: {
        title: "ระบบหลังบ้าน: จัดการทุกเครื่อง ทุกสาขา จากเว็บเดียว",
        items: [
          { title: "Dashboard ภาพรวมธุรกิจ", description: "ดูภาพรวม ยอดขาย สินค้าขายดี และการทำงานของร้าน แยกเป็นแท็บ ให้เจ้าของและผู้จัดการตอบคำถามสำคัญได้เร็ว" },
          { title: "หลายบริษัท หลายสาขา", description: "จัดการทุกสาขาจากศูนย์กลาง และตั้งราคาแยกตามสาขาและช่องทางการขายได้" },
          { title: "คลังเมนูกลาง แปลภาษาด้วย AI", description: "สร้างเมนูและตัวเลือกเสริมครั้งเดียวใช้ได้ทุกสาขา และแปลชื่อเมนูเป็นหลายภาษาด้วย AI" },
          { title: "เมนูตามช่วงเวลา", description: "ตั้งให้หมวดเมนูแสดงเฉพาะช่วงเวลาที่กำหนด เช่น เมนูเช้า เมนูกลางวัน" },
          { title: "สต็อกเรียลไทม์", description: "ดูสต็อกของแต่ละสาขาและแต่ละตู้ พร้อมประวัติการเปลี่ยนแปลงสต็อกและราคา" },
          { title: "สถานะเครื่องและสั่งงานจากระยะไกล", description: "ดูว่าเครื่องไหนออนไลน์หรือออฟไลน์ และส่งคำสั่งไปยังเครื่องได้จากระบบหลังบ้าน" },
          { title: "รายงานและส่งออกไฟล์", description: "รายงานออเดอร์และธุรกรรม ส่งออกเป็น Excel หรือ PDF" },
          { title: "ใบกำกับภาษี", description: "ออกใบกำกับภาษีจากบิลได้ในระบบ" },
          { title: "สิทธิ์ผู้ใช้และประวัติการแก้ไข", description: "กำหนดสิทธิ์ตามบทบาท และดูประวัติว่าใครแก้ไขอะไรเมื่อไร" },
        ],
      },
      managed: {
        title: "เครื่องที่จัดการจากระบบหลังบ้านนี้",
        items: ["ตู้สั่งอาหาร", "POS หน้าร้าน", "KDS จอครัว", "POS/Self Ordering ชั่งขีด", "จอเรียกคิว", "Vending Machine Online"],
      },
      coupons: {
        title: "คูปองและโปรโมชัน",
        lede: "ร้านสร้างคูปองส่วนลดในระบบหลังบ้าน แล้วแจกให้ลูกค้าของตัวเองเป็นรหัสหรือ QR Code ลูกค้านำมาใช้เป็นส่วนลดเมื่อซื้อสินค้าหรือบริการที่หน้าตู้",
        worksOnTitle: "ใช้ได้กับ",
        worksOn: ["ตู้สั่งอาหาร", "POS หน้าร้าน", "Vending Machine Online"],
        steps: [
          { title: "สร้างคูปองในระบบหลังบ้าน", description: "กำหนดส่วนลดของคูปองแต่ละชุด" },
          { title: "แจกให้ลูกค้าของร้าน", description: "ส่งเป็นรหัสหรือ QR Code ผ่านช่องทางของร้านเอง เช่น LINE OA หรือโซเชียลมีเดีย" },
          { title: "ลูกค้าใช้ที่หน้าตู้", description: "กรอกรหัสหรือสแกน QR Code ตอนชำระเงิน ระบบหักส่วนลดให้อัตโนมัติ" },
        ],
      },
    },
  },
  en: {
    nav: {
      solutionsGroups: {
        restaurant: "Restaurant system",
        vending: "24-hour vending",
        ticketing: "Automated ticketing",
        backOffice: "Back office",
      },
      solutionsItems: {
        selfOrder: "Self-order kiosk",
        pos: "POS terminal",
        kds: "KDS kitchen display",
        weighPay: "Weigh & pay POS / self-ordering",
        queueDisplay: "Queue display",
        vendingOnline: "Vending Machine Online",
        vendingOffline: "Vending Machine Offline",
        ticketing: "Ticket kiosk",
        dashboard: "Dashboard",
        coupons: "Coupons & promotions",
      },
    },
    productsCommon: {
      categories: {
        "weigh-pay": "Weigh & pay POS / self-ordering",
        kds: "KDS kitchen display",
        "queue-display": "Queue display",
        "vending-online": "Vending Machine Online",
        "vending-offline": "Vending Machine Offline",
        ticketing: "Ticket kiosk",
      },
    },
    solutionsCommon: {
      featuresTitle: "What it does",
      specsTitle: "Specifications & options",
      backOfficeTitle: "Everything managed from one back office",
      backOfficeBody:
        "MYPOS self-order kiosks, POS, KDS, weigh-and-pay, queue displays and Vending Machine Online share one web back office for menus, prices, stock and sales across every branch.",
      backOfficeCta: "See the back office",
    },
    home: {
      solutions: {
        moreTitle: "Weigh & pay, 24-hour vending and ticketing",
        items: {
          weighPay: { title: "Weigh & pay POS / self-ordering", description: "Weighs and prices automatically — for mala, buffets and bakeries" },
          kds: { title: "KDS kitchen display", description: "Kiosk and counter orders appear in the kitchen instantly; station printing and queue calls" },
          queueDisplay: { title: "Queue display", description: "Shows awaiting-payment, preparing and ready queues on your shop's TV" },
          vendingOnline: { title: "Vending Machine Online", description: "Vertical touchscreen, cash with change, QR payments and real-time stock" },
          vendingOffline: { title: "Vending Machine Offline", description: "Coins and banknotes, no internet needed" },
          ticketing: { title: "Ticket kiosk", description: "Automated ticket sales for theme parks, hotels and attractions" },
        },
      },
    },
    software: {
      features: {
        title: "Back office: every machine, every branch, one website",
        items: [
          { title: "Business dashboard", description: "Overview, sales, best sellers and operations on separate tabs, so owners and managers get answers fast." },
          { title: "Multiple companies and branches", description: "Run every branch from one place, with prices per branch and per sales channel." },
          { title: "Central menu library with AI translation", description: "Build menus and option groups once for every branch, and translate menu names into several languages with AI." },
          { title: "Time-based menus", description: "Show menu categories only at set times — breakfast, lunch and so on." },
          { title: "Real-time stock", description: "Stock for each branch and each machine, with a history of stock and price changes." },
          { title: "Machine status and remote commands", description: "See which machines are online or offline and send commands to them from the back office." },
          { title: "Reports and exports", description: "Order and transaction reports, exported to Excel or PDF." },
          { title: "Tax invoices", description: "Issue tax invoices from bills in the system." },
          { title: "Roles and edit history", description: "Role-based permissions and a log of who changed what, and when." },
        ],
      },
      managed: {
        title: "Machines managed from this back office",
        items: ["Self-order kiosk", "POS terminal", "KDS kitchen display", "Weigh & pay", "Queue display", "Vending Machine Online"],
      },
      coupons: {
        title: "Coupons & promotions",
        lede: "Shops create discount coupons in the back office and hand them to their own customers as a code or QR code, which customers redeem for a discount at the machine.",
        worksOnTitle: "Works with",
        worksOn: ["Self-order kiosk", "POS terminal", "Vending Machine Online"],
        steps: [
          { title: "Create coupons in the back office", description: "Set the discount for each coupon batch." },
          { title: "Give them to your customers", description: "Send them as codes or QR codes through your own channels, such as your LINE OA or social media." },
          { title: "Customers redeem at the machine", description: "They enter the code or scan the QR at checkout and the discount is applied automatically." },
        ],
      },
    },
  },
  zh: {
    nav: {
      solutionsGroups: {
        restaurant: "餐厅系统",
        vending: "24 小时自动售卖",
        ticketing: "自动售票系统",
        backOffice: "后台系统",
      },
      solutionsItems: {
        selfOrder: "自助点餐机",
        pos: "前台 POS",
        kds: "KDS 厨房显示屏",
        weighPay: "称重结账 POS / 自助点餐",
        queueDisplay: "叫号显示屏",
        vendingOnline: "Vending Machine Online",
        vendingOffline: "Vending Machine Offline",
        ticketing: "自助售票机",
        dashboard: "Dashboard",
        coupons: "优惠券/促销",
      },
    },
    productsCommon: {
      categories: {
        "weigh-pay": "称重结账 POS / 自助点餐",
        kds: "KDS 厨房显示屏",
        "queue-display": "叫号显示屏",
        "vending-online": "Vending Machine Online",
        "vending-offline": "Vending Machine Offline",
        ticketing: "自助售票机",
      },
    },
    solutionsCommon: {
      featuresTitle: "功能",
      specsTitle: "规格与选项",
      backOfficeTitle: "一个后台管理全部设备",
      backOfficeBody: "MYPOS 自助点餐机、POS、KDS、称重结账、叫号显示屏和 Vending Machine Online 共用同一个网页后台，统一管理所有门店的菜单、价格、库存和销售。",
      backOfficeCta: "查看后台系统",
    },
    home: {
      solutions: {
        moreTitle: "称重结账、24 小时自动售卖与售票",
        items: {
          weighPay: { title: "称重结账 POS / 自助点餐", description: "自动称重计价，适合麻辣烫、自助餐和烘焙店" },
          kds: { title: "KDS 厨房显示屏", description: "点餐机和前台订单即时显示在厨房，分站打印并可叫号" },
          queueDisplay: { title: "叫号显示屏", description: "在店内电视上显示待付款、制作中和可取餐的号码" },
          vendingOnline: { title: "Vending Machine Online", description: "竖屏触摸屏，现金找零、扫码支付、实时库存" },
          vendingOffline: { title: "Vending Machine Offline", description: "收硬币和纸币，无需联网" },
          ticketing: { title: "自助售票机", description: "游乐园、酒店和景点的自动售票" },
        },
      },
    },
    software: {
      features: {
        title: "后台系统：一个网站管理所有设备和门店",
        items: [
          { title: "经营总览 Dashboard", description: "总览、销售、畅销品和运营分标签展示，老板和店长能快速找到答案。" },
          { title: "多公司、多门店", description: "集中管理所有门店，可按门店和销售渠道分别定价。" },
          { title: "中央菜单库与 AI 翻译", description: "菜单和加料选项只需建立一次即可用于所有门店，并可用 AI 将菜名翻译成多种语言。" },
          { title: "分时段菜单", description: "让菜单分类只在指定时段显示，例如早餐、午餐。" },
          { title: "实时库存", description: "查看每家门店和每台设备的库存，以及库存和价格的变更记录。" },
          { title: "设备状态与远程指令", description: "查看哪些设备在线或离线，并从后台向设备发送指令。" },
          { title: "报表与导出", description: "订单与交易报表，可导出 Excel 或 PDF。" },
          { title: "税务发票", description: "可在系统中根据账单开具税务发票。" },
          { title: "角色权限与修改记录", description: "按角色分配权限，并记录谁在何时修改了什么。" },
        ],
      },
      managed: {
        title: "由此后台管理的设备",
        items: ["自助点餐机", "前台 POS", "KDS 厨房显示屏", "称重结账", "叫号显示屏", "Vending Machine Online"],
      },
      coupons: {
        title: "优惠券与促销",
        lede: "商家在后台创建折扣优惠券，以代码或二维码形式发给自己的顾客，顾客在机器前购买商品或服务时即可抵扣。",
        worksOnTitle: "适用于",
        worksOn: ["自助点餐机", "前台 POS", "Vending Machine Online"],
        steps: [
          { title: "在后台创建优惠券", description: "为每批优惠券设置折扣。" },
          { title: "发给店铺的顾客", description: "通过店铺自己的渠道（如 LINE OA 或社交媒体）以代码或二维码发送。" },
          { title: "顾客在机器前使用", description: "结账时输入代码或扫描二维码，系统自动扣减。" },
        ],
      },
    },
  },
};

const SOLUTIONS: Record<Locale, Record<"kds" | "queueDisplay" | "vendingOnline" | "vendingOffline", Solution>> = {
  th: {
    kds: {
      metaTitle: "KDS จอครัว (Kitchen Display System) สำหรับร้านอาหาร | MYPOS",
      metaDescription:
        "จอครัว KDS จาก MYPOS จอสัมผัสแนวนอน 14 และ 15.6 นิ้ว รับออเดอร์จากตู้สั่งอาหารและ POS ทันที พิมพ์ใบสั่งแยกตามสถานี เรียกคิว และรับชำระเงินที่เคาน์เตอร์ได้ในเครื่องเดียว",
      hero: {
        eyebrow: "KDS จอครัว",
        title: "ออเดอร์จากตู้และหน้าร้าน ขึ้นจอครัวทันที ไม่มีใบสั่งหาย",
        subtitle: "จอสัมผัสแนวนอน 14 และ 15.6 นิ้ว สำหรับครัวและเคาน์เตอร์ รับออเดอร์ พิมพ์ใบสั่งแยกตามสถานี เรียกคิว และรับชำระเงินได้ในเครื่องเดียว",
      },
      painGain: [
        { pain: "ใบสั่งกระดาษหาย เปียก หรืออ่านไม่ออก", gain: "ออเดอร์ขึ้นจอพร้อมตัวเลือกเสริมครบ อ่านได้ชัด" },
        { pain: "ครัวไม่รู้ว่าออเดอร์ไหนรอนานแล้ว", gain: "ออเดอร์เรียงตามเวลาที่สั่ง เห็นทันทีว่าออเดอร์ไหนต้องรีบ" },
        { pain: "ต้องตะโกนเรียกลูกค้าเมื่ออาหารเสร็จ", gain: "กดเรียกคิวจากจอ เลขคิวขึ้นบนจอเรียกคิวหน้าร้าน" },
      ],
      steps: [
        { title: "ลูกค้าสั่ง", description: "สั่งที่ตู้สั่งอาหารหรือกับพนักงานที่ POS ออเดอร์ส่งเข้าครัวทันที" },
        { title: "ครัวทำตามจอ", description: "ออเดอร์ขึ้นจอครัว และพิมพ์ใบสั่งแยกตามหมวดไปยังเครื่องพิมพ์ของแต่ละสถานีได้" },
        { title: "เรียกคิว", description: "กดพร้อมรับ เลขคิวขึ้นบนจอเรียกคิวให้ลูกค้ามารับ" },
      ],
      cases: [],
      features: [
        { title: "รับออเดอร์เรียลไทม์", description: "ออเดอร์จากตู้สั่งอาหารและ POS เข้าจอทันที พร้อมตัวเลือกเสริมและหมายเหตุ" },
        { title: "พิมพ์ใบสั่งแยกตามสถานี", description: "กำหนดได้ว่าหมวดเมนูไหนพิมพ์ออกเครื่องพิมพ์ไหน รองรับเครื่องพิมพ์ใบเสร็จและเครื่องพิมพ์ฉลาก ทั้งแบบเครือข่ายและบลูทูธ" },
        { title: "เรียกคิวและเรียกซ้ำ", description: "เปลี่ยนสถานะคิวเป็นกำลังทำหรือพร้อมรับ ข้อมูลไปขึ้นจอเรียกคิวอัตโนมัติ และเรียกซ้ำได้" },
        { title: "รับชำระเงินที่เคาน์เตอร์", description: "ใช้เป็นจุดแคชเชียร์ รับเงินสดพร้อมลิ้นชักเก็บเงินหรือแบบไม่ใช้เงินสด และคีย์ยอดขายหน้าร้านได้" },
        { title: "คูปองและโปรโมชัน", description: "ใช้คูปองส่วนลดของร้านกับบิลได้" },
        { title: "VAT และสรุปยอดขาย", description: "คำนวณภาษีมูลค่าเพิ่ม ดูประวัติออเดอร์และสรุปยอดขายประจำวัน" },
        { title: "ยกเลิกบิลค้างชำระอัตโนมัติ", description: "บิลที่สั่งแล้วไม่ชำระภายในเวลาที่กำหนดถูกยกเลิกเอง ครัวไม่ต้องทำเผื่อ" },
      ],
      specs: [
        { label: "หน้าจอ", value: "จอสัมผัสแนวนอน 14 นิ้ว และ 15.6 นิ้ว" },
        { label: "รูปแบบการขาย", value: "เครื่องพร้อมจอและซอฟต์แวร์" },
        { label: "ใช้ร่วมกับ", value: "ตู้สั่งอาหาร · POS หน้าร้าน · POS/Self Ordering ชั่งขีด · จอเรียกคิว" },
        { label: "เครื่องพิมพ์", value: "เครื่องพิมพ์ใบเสร็จและเครื่องพิมพ์ฉลาก แบบเครือข่ายและบลูทูธ" },
        { label: "ระบบหลังบ้าน", value: "จัดการเมนู สาขา และดูรายงานผ่านเว็บ" },
      ],
      faq: [
        { question: "KDS ต่างจากการพิมพ์ใบสั่งเข้าครัวอย่างไร?", answer: "จอแสดงออเดอร์ทั้งหมดเรียงตามเวลาและอัปเดตสถานะได้ทันที ขณะเดียวกันยังพิมพ์ใบสั่งออกเครื่องพิมพ์ของแต่ละสถานีได้หากครัวยังต้องการกระดาษ" },
        { question: "ใช้กับตู้สั่งอาหารและ POS ของ MYPOS ได้เลยไหม?", answer: "ได้ ออเดอร์จากตู้สั่งอาหารและ POS ของ MYPOS เข้าจอครัวโดยตรง ทีมงานติดตั้งและตั้งค่าให้ถึงร้าน" },
        { question: "ควรเลือกจอ 14 หรือ 15.6 นิ้ว?", answer: "จอ 14 นิ้วเหมาะกับครัวเล็กหรือจุดเคาน์เตอร์ จอ 15.6 นิ้วอ่านง่ายจากระยะไกลกว่า เหมาะกับครัวที่มีหลายสถานี ทีมงานช่วยประเมินหน้างานให้ฟรี" },
      ],
    },
    queueDisplay: {
      metaTitle: "จอเรียกคิวร้านอาหาร (Queue Display) บนทีวี | MYPOS",
      metaDescription:
        "จอเรียกคิวจาก MYPOS แสดงคิวรอชำระเงิน คิวที่กำลังทำ และคิวที่พร้อมรับ บนทีวีของร้าน เพียงเสียบ Android Box ของ MYPOS และต่ออินเทอร์เน็ต ใช้งานร่วมกับตู้สั่งอาหาร POS และ KDS",
      hero: {
        eyebrow: "จอเรียกคิว",
        title: "ลูกค้าเห็นคิวตัวเองบนทีวี ไม่ต้องถามว่าได้หรือยัง",
        subtitle: "แสดงคิวรอชำระเงิน คิวที่กำลังทำ และคิวที่พร้อมรับ บนทีวีหน้าร้าน ใช้ทีวีเดิมของร้านได้โดยเสียบ Android Box ของ MYPOS หรือรับเป็นชุดพร้อมทีวี",
      },
      painGain: [
        { pain: "ลูกค้ามุงหน้าเคาน์เตอร์ ถามว่าอาหารได้หรือยัง", gain: "ลูกค้าเห็นสถานะคิวของตัวเองบนจอ รอได้อย่างสบายใจ" },
        { pain: "พนักงานต้องตะโกนเรียกเลขคิว", gain: "กดเรียกคิวจากจอครัว เลขคิวขึ้นในช่องพร้อมรับทันที" },
        { pain: "ไม่รู้ว่ามีกี่คิวที่สั่งแล้วแต่ยังไม่จ่าย", gain: "เห็นจำนวนคิวรอชำระเงินแยกจากคิวที่กำลังทำ" },
      ],
      steps: [
        { title: "เสียบ Android Box", description: "ต่อ Android Box ของ MYPOS เข้าช่อง HDMI ของทีวี" },
        { title: "ต่ออินเทอร์เน็ต", description: "เชื่อม Android Box กับอินเทอร์เน็ตของร้าน ทีมงานตั้งค่าให้เชื่อมกับระบบของร้าน" },
        { title: "คิวขึ้นจออัตโนมัติ", description: "เมื่อมีออเดอร์และครัวอัปเดตสถานะ คิวบนจอเปลี่ยนตามทันที" },
      ],
      cases: [],
      features: [
        { title: "3 สถานะในจอเดียว", description: "รอชำระเงิน · กำลังทำ · พร้อมรับ แสดงทั้งจำนวนคิวและเลขคิวในแต่ละสถานะ" },
        { title: "ใช้ทีวีเดิมของร้านได้", description: "ซื้อเฉพาะ Android Box ของ MYPOS ไปเสียบกับทีวีที่มีอยู่ หรือรับเป็นชุดพร้อมทีวี" },
        { title: "ข้อมูลตรงจากระบบของร้าน", description: "คิวมาจากตู้สั่งอาหาร POS และ KDS โดยตรง ไม่ต้องคีย์ซ้ำ" },
        { title: "เรียกคิวซ้ำได้", description: "ลูกค้ายังไม่มารับ กดเรียกซ้ำจากจอครัวได้" },
        { title: "จัดการผ่านระบบหลังบ้าน", description: "ตั้งค่าจอของแต่ละสาขาได้จากเว็บหลังบ้าน" },
      ],
      specs: [
        { label: "อุปกรณ์", value: "Android Box ของ MYPOS — ขายเฉพาะกล่อง หรือเป็นชุดพร้อมทีวี" },
        { label: "หน้าจอ", value: "ทีวีที่มีช่อง HDMI" },
        { label: "การเชื่อมต่อ", value: "อินเทอร์เน็ต" },
        { label: "ข้อมูลบนจอ", value: "คิวรอชำระเงิน · คิวกำลังทำ · คิวพร้อมรับ (จำนวนและเลขคิว)" },
        { label: "ใช้ร่วมกับ", value: "ตู้สั่งอาหาร · POS หน้าร้าน · KDS จอครัว" },
      ],
      faq: [
        { question: "ต้องซื้อทีวีใหม่ไหม?", answer: "ไม่จำเป็น ใช้ทีวีที่มีช่อง HDMI ของร้านได้เลยโดยเสียบ Android Box ของ MYPOS หรือจะรับเป็นชุดพร้อมทีวีก็ได้" },
        { question: "ติดตั้งยากไหม?", answer: "เสียบ Android Box เข้าทีวีและต่ออินเทอร์เน็ต ทีมงาน MYPOS ช่วยตั้งค่าให้เชื่อมกับระบบของร้าน" },
        { question: "จอเรียกคิวรับข้อมูลจากไหน?", answer: "จากตู้สั่งอาหาร POS และ KDS ของ MYPOS เมื่อมีออเดอร์ใหม่หรือครัวเปลี่ยนสถานะ จอจะอัปเดตเอง" },
      ],
    },
    vendingOnline: {
      metaTitle: "ตู้ Vending Machine Online รับเงินสด ทอนเงิน สแกน QR | MYPOS",
      metaDescription:
        "ตู้ขายสินค้าอัตโนมัติ Vending Machine Online จาก MYPOS จอสัมผัสแนวตั้ง 10.1 / 15.6 / 21.5 นิ้ว รับเหรียญและธนบัตรพร้อมทอนเงิน สแกนจ่าย PromptPay WeChat Pay Alipay TrueMoney LAO QR บัตรเงินสดระบบปิด ดูสต็อกผ่านระบบหลังบ้าน",
      hero: {
        eyebrow: "Vending Machine Online",
        title: "ขายได้ 24 ชั่วโมง รับทุกช่องทางจ่าย เห็นสต็อกทุกตู้จากที่เดียว",
        subtitle: "จอสัมผัสแนวตั้ง 10.1 / 15.6 / 21.5 นิ้ว รับเหรียญและธนบัตรพร้อมทอนเงิน สแกนจ่าย QR ได้หลายค่าย และจัดการสินค้า ราคา และสต็อกผ่านระบบหลังบ้าน",
      },
      painGain: [
        { pain: "ต้องไปเปิดตู้นับสต็อกเองทุกตู้", gain: "ดูสต็อกของแต่ละตู้ผ่านระบบหลังบ้าน ทั้งแบบเรียลไทม์และแบบออฟไลน์" },
        { pain: "ลูกค้าไม่มีเงินสด ซื้อไม่ได้", gain: "สแกนจ่าย PromptPay WeChat Pay Alipay TrueMoney LAO QR หรือใช้บัตรเงินสดระบบปิด" },
        { pain: "นักท่องเที่ยวต่างชาติอ่านหน้าตู้ไม่ออก", gain: "หน้าจอรองรับ 10 ภาษา ลูกค้าเลือกภาษาเองได้" },
      ],
      steps: [
        { title: "เลือกสินค้าบนจอ", description: "ลูกค้าเลือกสินค้าบนจอสัมผัสแนวตั้ง พร้อมรูปและราคา" },
        { title: "ชำระเงิน", description: "เงินสดพร้อมทอน สแกน QR บัตรเงินสดระบบปิด และใช้คูปองส่วนลดได้" },
        { title: "รับสินค้า", description: "สินค้าออกที่ช่องรับ ระบบตัดสต็อกและบันทึกยอดขายอัตโนมัติ" },
      ],
      cases: [],
      features: [
        { title: "จอสัมผัสแนวตั้ง 3 ขนาด", description: "10.1 / 15.6 / 21.5 นิ้ว แสดงสินค้าพร้อมรูปและราคา และแสดงโฆษณาขณะไม่มีคนใช้งาน" },
        { title: "รับเงินสดและทอนเงิน", description: "รับเหรียญ 1 2 5 10 บาท และธนบัตร 20 50 100 500 บาท ทอนเงินอัตโนมัติ" },
        { title: "สแกนจ่ายได้หลายค่าย", description: "PromptPay · WeChat Pay · Alipay · TrueMoney · LAO QR" },
        { title: "บัตรเงินสดระบบปิด (Closed-loop)", description: "สำหรับโรงงาน สำนักงาน โรงเรียน หรือโรงอาหาร ที่ใช้บัตรเติมเงินของตัวเอง" },
        { title: "คูปองส่วนลด", description: "ร้านแจกคูปองเป็นรหัสหรือ QR Code ให้ลูกค้า ใช้เป็นส่วนลดที่หน้าตู้" },
        { title: "10 ภาษา", description: "ลูกค้าเลือกภาษาบนหน้าจอเองได้" },
        { title: "สต็อกและสถานะตู้จากระบบหลังบ้าน", description: "ดูสต็อกของตู้แบบเรียลไทม์และแบบออฟไลน์ ตั้งสินค้าและราคา ดูยอดขาย และดูว่าตู้ไหนออนไลน์อยู่" },
      ],
      specs: [
        { label: "หน้าจอ", value: "จอสัมผัสแนวตั้ง 10.1 / 15.6 / 21.5 นิ้ว" },
        { label: "เงินสด", value: "เหรียญ 1, 2, 5, 10 บาท · ธนบัตร 20, 50, 100, 500 บาท · ทอนเงินอัตโนมัติ" },
        { label: "สแกนจ่าย", value: "PromptPay · WeChat Pay · Alipay · TrueMoney · LAO QR" },
        { label: "ช่องทางอื่น", value: "บัตรเงินสดระบบปิด (Closed-loop) · คูปองรหัส / QR Code" },
        { label: "ภาษาบนหน้าจอ", value: "10 ภาษา" },
        { label: "ตู้แบบ CAN (ญี่ปุ่น)", value: "32 ช่อง สำหรับขวดและกระป๋องทรงกลม · มีระบบทำความเย็น" },
        { label: "ตู้แบบ Spiral (สปริงเกลียว)", value: "ใส่ได้ทั้งขวด กระป๋อง และถุงขนม\nมีแบบมีลิฟต์และไม่มีลิฟต์ · แบบทำความเย็นและไม่ทำความเย็น\n30 ช่องขึ้นไป มีขนาดช่องให้เลือกหลายแบบ" },
        { label: "ระบบหลังบ้าน", value: "Dashboard ยอดขาย · สต็อกเรียลไทม์และออฟไลน์ · สถานะตู้" },
      ],
      faq: [
        { question: "ตู้แบบ CAN กับแบบ Spiral ต่างกันอย่างไร?", answer: "ตู้ CAN แบบญี่ปุ่น 32 ช่อง เหมาะกับเครื่องดื่มขวดและกระป๋องทรงกลม มีระบบทำความเย็น ส่วนตู้ Spiral ใช้สปริงเกลียว ใส่สินค้าได้หลากหลายทั้งเครื่องดื่มและถุงขนม เลือกได้ทั้งแบบมีลิฟต์และไม่มีลิฟต์ แบบทำความเย็นและไม่ทำความเย็น" },
        { question: "ลิฟต์ในตู้ Spiral มีไว้ทำอะไร?", answer: "ลิฟต์รับสินค้าจากชั้นแล้วส่งลงมาที่ช่องรับ แทนการปล่อยให้ตกลงมา เหมาะกับสินค้าที่ไม่ควรกระแทก" },
        { question: "รุ่น Online ต่างจากรุ่น Offline อย่างไร?", answer: "รุ่น Online มีจอสัมผัส รับสแกนจ่าย QR บัตรเงินสดระบบปิด คูปอง และจัดการผ่านระบบหลังบ้านได้ รุ่น Offline รับเฉพาะเหรียญและธนบัตร และไม่มีระบบหลังบ้าน" },
        { question: "LAO QR ใช้ทำอะไร?", answer: "ให้ลูกค้าจาก สปป.ลาว สแกนจ่ายด้วยแอปธนาคารลาวได้ เหมาะกับพื้นที่ชายแดนและแหล่งท่องเที่ยว" },
      ],
    },
    vendingOffline: {
      metaTitle: "ตู้ Vending Machine Offline รับเหรียญและธนบัตร | MYPOS",
      metaDescription:
        "ตู้ขายสินค้าอัตโนมัติรุ่น Offline จาก MYPOS รับเหรียญ 1 2 5 10 บาท และธนบัตร 20 50 100 500 บาท ทำงานได้โดยไม่ต้องต่ออินเทอร์เน็ตและไม่ต้องใช้ระบบหลังบ้าน",
      hero: {
        eyebrow: "Vending Machine Offline",
        title: "ตู้ขายสินค้าหยอดเหรียญ ตั้งที่ไหนก็ขายได้ ไม่ต้องใช้อินเทอร์เน็ต",
        subtitle: "รับเหรียญและธนบัตร สำหรับจุดที่ต้องการตู้เรียบง่าย ไม่ต้องใช้ระบบหลังบ้าน",
      },
      painGain: [
        { pain: "จุดติดตั้งไม่มีอินเทอร์เน็ตที่เสถียร", gain: "ตู้ทำงานแบบ Offline ไม่ต้องพึ่งอินเทอร์เน็ต" },
        { pain: "ไม่ต้องการระบบที่ซับซ้อน", gain: "รับเหรียญและธนบัตร ใช้งานง่ายทั้งผู้ซื้อและเจ้าของตู้" },
      ],
      steps: [
        { title: "เลือกสินค้า", description: "ลูกค้าเลือกสินค้าจากช่องในตู้" },
        { title: "หยอดเหรียญหรือธนบัตร", description: "รับเหรียญ 1 2 5 10 บาท และธนบัตร 20 50 100 500 บาท" },
        { title: "รับสินค้า", description: "สินค้าออกที่ช่องรับสินค้า" },
      ],
      cases: [],
      features: [
        { title: "รับเหรียญและธนบัตร", description: "เหรียญ 1 2 5 10 บาท และธนบัตร 20 50 100 500 บาท" },
        { title: "ไม่ต้องต่ออินเทอร์เน็ต", description: "ตู้ทำงานได้ด้วยตัวเอง เหมาะกับจุดที่อินเทอร์เน็ตไม่เสถียร" },
        { title: "เลือกตู้ตามสินค้า", description: "สอบถามรุ่นตู้ CAN และ Spiral ที่ใช้กับรุ่น Offline ได้กับทีมงาน" },
      ],
      specs: [
        { label: "การชำระเงิน", value: "เหรียญ 1, 2, 5, 10 บาท · ธนบัตร 20, 50, 100, 500 บาท" },
        { label: "การเชื่อมต่อ", value: "ไม่ต้องใช้อินเทอร์เน็ต" },
        { label: "ระบบหลังบ้าน", value: "ไม่มี (ทำงานแบบ standalone)" },
        { label: "ประเภทตู้", value: "สอบถามรุ่นที่รองรับกับทีมงาน" },
      ],
      faq: [
        { question: "รุ่น Offline รับสแกน QR ได้ไหม?", answer: "ไม่ได้ รุ่น Offline รับเฉพาะเหรียญและธนบัตร หากต้องการสแกนจ่าย QR บัตรเงินสดระบบปิด คูปอง หรือดูสต็อกผ่านระบบหลังบ้าน แนะนำรุ่น Online" },
        { question: "รุ่น Offline เหมาะกับจุดแบบไหน?", answer: "จุดที่ต้องการตู้เรียบง่าย หรือจุดที่ไม่มีอินเทอร์เน็ตที่เสถียร" },
      ],
    },
  },
  en: {
    kds: {
      metaTitle: "KDS Kitchen Display System for restaurants | MYPOS",
      metaDescription:
        "MYPOS KDS: 14\" and 15.6\" landscape touchscreens that receive kiosk and POS orders instantly, print tickets by station, call queue numbers and take payment at the counter.",
      hero: {
        eyebrow: "KDS kitchen display",
        title: "Kiosk and counter orders reach the kitchen instantly — no lost tickets",
        subtitle: "14\" and 15.6\" landscape touchscreens for the kitchen and counter: receive orders, print tickets by station, call queue numbers and take payment on one device.",
      },
      painGain: [
        { pain: "Paper tickets get lost, wet or unreadable", gain: "Orders appear on screen with every option, clearly readable" },
        { pain: "The kitchen can't see which order has waited longest", gain: "Orders are sorted by time, so urgent ones stand out" },
        { pain: "Staff shout for customers when food is ready", gain: "Call the queue number from the screen; it appears on the queue display" },
      ],
      steps: [
        { title: "Customer orders", description: "At the self-order kiosk or with staff at the POS; the order goes straight to the kitchen." },
        { title: "Kitchen cooks from the screen", description: "Orders show on the KDS, and tickets can print by category to each station's printer." },
        { title: "Call the queue", description: "Mark it ready and the number appears on the queue display for pickup." },
      ],
      cases: [],
      features: [
        { title: "Real-time orders", description: "Orders from kiosks and POS arrive instantly, with options and notes." },
        { title: "Printing by station", description: "Choose which menu category prints on which printer; receipt and label printers over network or Bluetooth." },
        { title: "Queue calls and recalls", description: "Set orders to preparing or ready; the queue display updates automatically, and you can call again." },
        { title: "Counter payment", description: "Works as a cashier point: cash with a cash drawer or cashless, plus manual counter sales." },
        { title: "Coupons & promotions", description: "Apply the shop's discount coupons to bills." },
        { title: "VAT and sales summary", description: "VAT calculation, order history and daily sales summary." },
        { title: "Auto-cancel unpaid bills", description: "Orders not paid within the set time are cancelled, so the kitchen doesn't cook them." },
      ],
      specs: [
        { label: "Screen", value: "14\" and 15.6\" landscape touchscreens" },
        { label: "Sold as", value: "Hardware with screen and software" },
        { label: "Works with", value: "Self-order kiosk · POS terminal · Weigh & pay · Queue display" },
        { label: "Printers", value: "Receipt and label printers, network and Bluetooth" },
        { label: "Back office", value: "Menus, branches and reports on the web" },
      ],
      faq: [
        { question: "How is a KDS different from printing tickets to the kitchen?", answer: "The screen shows every order sorted by time with live status, and it can still print tickets to each station's printer if the kitchen wants paper." },
        { question: "Does it work with MYPOS kiosks and POS out of the box?", answer: "Yes — orders from MYPOS kiosks and POS go straight to the KDS, and our team installs and configures it on site." },
        { question: "14\" or 15.6\"?", answer: "14\" suits small kitchens or counter points; 15.6\" is easier to read from a distance for kitchens with several stations. We'll assess your site for free." },
      ],
    },
    queueDisplay: {
      metaTitle: "Restaurant queue display on your TV | MYPOS",
      metaDescription:
        "MYPOS queue display shows awaiting-payment, preparing and ready queue numbers on your shop's TV — plug in the MYPOS Android box and connect to the internet. Works with MYPOS kiosks, POS and KDS.",
      hero: {
        eyebrow: "Queue display",
        title: "Customers see their number on the TV — no more \"is mine ready?\"",
        subtitle: "Awaiting payment, preparing and ready queues on the TV in your shop. Use your own TV with the MYPOS Android box, or get it as a set with a TV.",
      },
      painGain: [
        { pain: "Customers crowd the counter asking if their food is ready", gain: "They see their queue status on screen and wait calmly" },
        { pain: "Staff shout out queue numbers", gain: "Call from the kitchen screen; the number moves to Ready instantly" },
        { pain: "No idea how many orders are placed but unpaid", gain: "Awaiting-payment queues are shown separately from those in preparation" },
      ],
      steps: [
        { title: "Plug in the Android box", description: "Connect the MYPOS Android box to the TV's HDMI port." },
        { title: "Connect to the internet", description: "Link the box to your shop's internet; our team connects it to your system." },
        { title: "Queues appear automatically", description: "As orders come in and the kitchen updates them, the screen follows." },
      ],
      cases: [],
      features: [
        { title: "Three statuses on one screen", description: "Awaiting payment · Preparing · Ready — with the count and the numbers in each." },
        { title: "Use your existing TV", description: "Buy just the MYPOS Android box for your TV, or get a set with a TV." },
        { title: "Straight from your system", description: "Queues come from MYPOS kiosks, POS and KDS — nothing re-keyed." },
        { title: "Recall", description: "Customer hasn't come? Call them again from the kitchen screen." },
        { title: "Managed in the back office", description: "Configure each branch's display from the web back office." },
      ],
      specs: [
        { label: "Hardware", value: "MYPOS Android box — box only, or as a set with a TV" },
        { label: "Screen", value: "Any TV with HDMI" },
        { label: "Connectivity", value: "Internet" },
        { label: "On screen", value: "Awaiting payment · Preparing · Ready (count and numbers)" },
        { label: "Works with", value: "Self-order kiosk · POS terminal · KDS" },
      ],
      faq: [
        { question: "Do I need a new TV?", answer: "No — any TV with HDMI works with the MYPOS Android box, or you can buy it as a set with a TV." },
        { question: "Is it hard to set up?", answer: "Plug the box into the TV and connect it to the internet; our team links it to your system." },
        { question: "Where does the queue data come from?", answer: "From your MYPOS kiosks, POS and KDS. New orders and kitchen status changes update the screen automatically." },
      ],
    },
    vendingOnline: {
      metaTitle: "Vending Machine Online — cash with change, QR payments | MYPOS",
      metaDescription:
        "MYPOS Vending Machine Online: 10.1\" / 15.6\" / 21.5\" vertical touchscreens, coins and banknotes with change, PromptPay, WeChat Pay, Alipay, TrueMoney and LAO QR, closed-loop cash cards, and stock in the back office.",
      hero: {
        eyebrow: "Vending Machine Online",
        title: "Sell around the clock, take every payment, see every machine's stock in one place",
        subtitle: "10.1\" / 15.6\" / 21.5\" vertical touchscreens, coins and banknotes with change, multiple QR wallets, and products, prices and stock managed in the back office.",
      },
      painGain: [
        { pain: "Opening every machine to count stock", gain: "See each machine's stock in the back office, real-time and offline" },
        { pain: "Customers without cash can't buy", gain: "PromptPay, WeChat Pay, Alipay, TrueMoney, LAO QR or a closed-loop cash card" },
        { pain: "Foreign tourists can't read the machine", gain: "10 on-screen languages, chosen by the customer" },
      ],
      steps: [
        { title: "Choose on screen", description: "Customers pick products on the vertical touchscreen, with photos and prices." },
        { title: "Pay", description: "Cash with change, QR, closed-loop cash card, plus discount coupons." },
        { title: "Collect", description: "The product drops to the pickup bay; stock and sales are recorded automatically." },
      ],
      cases: [],
      features: [
        { title: "Vertical touchscreen, three sizes", description: "10.1\" / 15.6\" / 21.5\", showing products with photos and prices, and ads while idle." },
        { title: "Cash with change", description: "Coins 1, 2, 5, 10 THB and banknotes 20, 50, 100, 500 THB, with automatic change." },
        { title: "Multiple QR wallets", description: "PromptPay · WeChat Pay · Alipay · TrueMoney · LAO QR" },
        { title: "Closed-loop cash cards", description: "For factories, offices, schools or cafeterias with their own top-up cards." },
        { title: "Discount coupons", description: "Shops hand coupons to customers as codes or QR codes, redeemed at the machine." },
        { title: "10 languages", description: "Customers choose the screen language." },
        { title: "Stock and status in the back office", description: "Stock per machine, real-time and offline; set products and prices, see sales and which machines are online." },
      ],
      specs: [
        { label: "Screen", value: "Vertical touchscreen 10.1\" / 15.6\" / 21.5\"" },
        { label: "Cash", value: "Coins 1, 2, 5, 10 THB · Banknotes 20, 50, 100, 500 THB · Automatic change" },
        { label: "QR payments", value: "PromptPay · WeChat Pay · Alipay · TrueMoney · LAO QR" },
        { label: "Other", value: "Closed-loop cash card · Coupon code / QR code" },
        { label: "Languages", value: "10" },
        { label: "CAN cabinet (Japanese)", value: "32 slots for round bottles and cans · Refrigerated" },
        { label: "Spiral cabinet", value: "Bottles, cans and snack bags\nWith or without lift · Refrigerated or ambient\n30+ slots in several sizes" },
        { label: "Back office", value: "Sales dashboard · Real-time and offline stock · Machine status" },
      ],
      faq: [
        { question: "CAN or Spiral cabinet?", answer: "The Japanese-style CAN cabinet has 32 slots for round bottles and cans and is refrigerated. Spiral cabinets use coils and take drinks and snack bags, with or without a lift, refrigerated or ambient." },
        { question: "What does the lift in a Spiral cabinet do?", answer: "It takes the product from the shelf down to the pickup bay instead of letting it drop — better for items that shouldn't be knocked." },
        { question: "Online vs Offline?", answer: "Online has a touchscreen, QR payments, closed-loop cards, coupons and the back office. Offline takes coins and banknotes only and has no back office." },
        { question: "What is LAO QR for?", answer: "It lets customers from Laos pay with Lao banking apps — useful near borders and in tourist areas." },
      ],
    },
    vendingOffline: {
      metaTitle: "Vending Machine Offline — coins and banknotes | MYPOS",
      metaDescription:
        "MYPOS Vending Machine Offline takes 1, 2, 5, 10 THB coins and 20, 50, 100, 500 THB banknotes and runs without internet or a back office.",
      hero: {
        eyebrow: "Vending Machine Offline",
        title: "A coin-and-note vending machine that sells anywhere, no internet needed",
        subtitle: "Coins and banknotes, for places that want a simple machine without a back office.",
      },
      painGain: [
        { pain: "No reliable internet at the location", gain: "Runs offline, no internet required" },
        { pain: "No need for a complex system", gain: "Coins and banknotes — simple for buyers and owners" },
      ],
      steps: [
        { title: "Choose a product", description: "Customers pick from the machine's slots." },
        { title: "Insert coins or notes", description: "Coins 1, 2, 5, 10 THB and banknotes 20, 50, 100, 500 THB." },
        { title: "Collect", description: "The product drops to the pickup bay." },
      ],
      cases: [],
      features: [
        { title: "Coins and banknotes", description: "Coins 1, 2, 5, 10 THB and banknotes 20, 50, 100, 500 THB." },
        { title: "No internet needed", description: "Runs on its own — suited to places with unreliable internet." },
        { title: "Cabinet to suit your products", description: "Ask our team which CAN and Spiral cabinets are available for the Offline model." },
      ],
      specs: [
        { label: "Payment", value: "Coins 1, 2, 5, 10 THB · Banknotes 20, 50, 100, 500 THB" },
        { label: "Connectivity", value: "No internet required" },
        { label: "Back office", value: "None (standalone)" },
        { label: "Cabinets", value: "Ask our team for supported models" },
      ],
      faq: [
        { question: "Can the Offline model take QR payments?", answer: "No — it takes coins and banknotes only. For QR, closed-loop cards, coupons or back-office stock, choose the Online model." },
        { question: "Where does the Offline model fit?", answer: "Places that want a simple machine, or that lack reliable internet." },
      ],
    },
  },
  zh: {
    kds: {
      metaTitle: "餐厅 KDS 厨房显示屏 | MYPOS",
      metaDescription: "MYPOS KDS：14 和 15.6 英寸横屏触摸屏，即时接收点餐机和 POS 订单，按工作站打印，叫号，并可在柜台收款。",
      hero: {
        eyebrow: "KDS 厨房显示屏",
        title: "点餐机和前台订单即时进入厨房，不再丢单",
        subtitle: "14 和 15.6 英寸横屏触摸屏，适用于厨房和柜台：接单、按工作站打印、叫号和收款，一台完成。",
      },
      painGain: [
        { pain: "纸质单据丢失、弄湿或看不清", gain: "订单连同加料选项清晰显示在屏幕上" },
        { pain: "厨房不知道哪张单等得最久", gain: "订单按下单时间排序，急单一目了然" },
        { pain: "餐好了要大声喊顾客", gain: "在屏幕上叫号，号码显示在店内叫号屏" },
      ],
      steps: [
        { title: "顾客下单", description: "在自助点餐机或前台 POS 下单，订单直接进入厨房。" },
        { title: "厨房按屏制作", description: "订单显示在 KDS 上，也可按分类打印到各工作站的打印机。" },
        { title: "叫号", description: "标记为可取餐，号码显示在叫号屏上。" },
      ],
      cases: [],
      features: [
        { title: "实时接单", description: "点餐机和 POS 的订单即时显示，含加料和备注。" },
        { title: "按工作站打印", description: "可设置各菜单分类打印到哪台打印机；支持小票和标签打印机，网络或蓝牙连接。" },
        { title: "叫号与重复叫号", description: "将订单设为制作中或可取餐，叫号屏自动更新，也可再次叫号。" },
        { title: "柜台收款", description: "可作为收银点：现金配合钱箱或非现金支付，并可手动录入柜台销售。" },
        { title: "优惠券与促销", description: "账单可使用店铺的折扣优惠券。" },
        { title: "增值税与销售汇总", description: "计算增值税，查看订单记录和每日销售汇总。" },
        { title: "自动取消未付款账单", description: "超时未付款的订单自动取消，厨房无需备餐。" },
      ],
      specs: [
        { label: "屏幕", value: "14 和 15.6 英寸横屏触摸屏" },
        { label: "销售形式", value: "含屏幕的硬件及软件" },
        { label: "配合使用", value: "自助点餐机 · 前台 POS · 称重结账 · 叫号显示屏" },
        { label: "打印机", value: "小票和标签打印机，网络及蓝牙连接" },
        { label: "后台", value: "通过网页管理菜单、门店和报表" },
      ],
      faq: [
        { question: "KDS 和打印厨房单有什么不同？", answer: "屏幕按时间显示所有订单并实时更新状态；如果厨房仍需纸单，也可同时打印到各工作站。" },
        { question: "能直接配合 MYPOS 点餐机和 POS 使用吗？", answer: "可以，MYPOS 点餐机和 POS 的订单直接进入 KDS，我们的团队上门安装配置。" },
        { question: "选 14 还是 15.6 英寸？", answer: "14 英寸适合小厨房或柜台；15.6 英寸远距离更易读，适合多工作站厨房。我们可免费上门评估。" },
      ],
    },
    queueDisplay: {
      metaTitle: "餐厅叫号显示屏（电视）| MYPOS",
      metaDescription: "MYPOS 叫号显示屏在店内电视上显示待付款、制作中和可取餐的号码——插上 MYPOS Android 盒子并联网即可，配合 MYPOS 点餐机、POS 和 KDS 使用。",
      hero: {
        eyebrow: "叫号显示屏",
        title: "顾客在电视上看到自己的号码，不再追问“好了吗”",
        subtitle: "在店内电视上显示待付款、制作中和可取餐的号码。可用店里现有电视配 MYPOS Android 盒子，也可购买含电视的套装。",
      },
      painGain: [
        { pain: "顾客围在柜台前追问餐好了没", gain: "在屏幕上看到自己的号码状态，安心等待" },
        { pain: "员工要大声叫号", gain: "在厨房屏幕上叫号，号码即刻移到可取餐栏" },
        { pain: "不知道有多少单已下未付", gain: "待付款号码与制作中号码分开显示" },
      ],
      steps: [
        { title: "插上 Android 盒子", description: "将 MYPOS Android 盒子接到电视的 HDMI 接口。" },
        { title: "连接网络", description: "盒子连接店内网络，我们的团队帮您接入系统。" },
        { title: "号码自动显示", description: "有新订单或厨房更新状态时，屏幕随即更新。" },
      ],
      cases: [],
      features: [
        { title: "一屏三种状态", description: "待付款 · 制作中 · 可取餐——显示每种状态的数量和号码。" },
        { title: "可用现有电视", description: "只买 MYPOS Android 盒子接到现有电视，或购买含电视的套装。" },
        { title: "数据直接来自系统", description: "号码来自 MYPOS 点餐机、POS 和 KDS，无需重复录入。" },
        { title: "重复叫号", description: "顾客未来取餐，可在厨房屏幕上再次叫号。" },
        { title: "后台管理", description: "在网页后台设置各门店的显示屏。" },
      ],
      specs: [
        { label: "设备", value: "MYPOS Android 盒子——单独购买或含电视套装" },
        { label: "屏幕", value: "带 HDMI 接口的电视" },
        { label: "连接", value: "互联网" },
        { label: "显示内容", value: "待付款 · 制作中 · 可取餐（数量和号码）" },
        { label: "配合使用", value: "自助点餐机 · 前台 POS · KDS" },
      ],
      faq: [
        { question: "需要买新电视吗？", answer: "不需要，任何带 HDMI 的电视配 MYPOS Android 盒子即可，也可购买含电视的套装。" },
        { question: "安装难吗？", answer: "把盒子接到电视并联网，我们的团队帮您接入系统。" },
        { question: "叫号数据从哪里来？", answer: "来自 MYPOS 点餐机、POS 和 KDS，新订单和厨房状态变化会自动更新屏幕。" },
      ],
    },
    vendingOnline: {
      metaTitle: "Vending Machine Online：现金找零、扫码支付 | MYPOS",
      metaDescription: "MYPOS Vending Machine Online：10.1 / 15.6 / 21.5 英寸竖屏触摸屏，收硬币和纸币并找零，支持 PromptPay、WeChat Pay、Alipay、TrueMoney、LAO QR 和封闭式储值卡，后台查看库存。",
      hero: {
        eyebrow: "Vending Machine Online",
        title: "24 小时销售，支持所有支付方式，在一处查看每台机器的库存",
        subtitle: "10.1 / 15.6 / 21.5 英寸竖屏触摸屏，收硬币和纸币并找零，支持多种扫码支付，商品、价格和库存在后台管理。",
      },
      painGain: [
        { pain: "要逐台开机清点库存", gain: "在后台查看每台机器的库存，实时及离线均可" },
        { pain: "顾客没有现金就买不了", gain: "PromptPay、WeChat Pay、Alipay、TrueMoney、LAO QR 或封闭式储值卡" },
        { pain: "外国游客看不懂机器界面", gain: "屏幕支持 10 种语言，顾客自行选择" },
      ],
      steps: [
        { title: "在屏幕上选择", description: "顾客在竖屏触摸屏上选择商品，附图片和价格。" },
        { title: "付款", description: "现金找零、扫码、封闭式储值卡，并可使用优惠券。" },
        { title: "取货", description: "商品落到取货口，系统自动扣减库存并记录销售。" },
      ],
      cases: [],
      features: [
        { title: "三种尺寸竖屏", description: "10.1 / 15.6 / 21.5 英寸，显示商品图片和价格，空闲时播放广告。" },
        { title: "现金找零", description: "硬币 1、2、5、10 泰铢，纸币 20、50、100、500 泰铢，自动找零。" },
        { title: "多种扫码支付", description: "PromptPay · WeChat Pay · Alipay · TrueMoney · LAO QR" },
        { title: "封闭式储值卡", description: "适用于使用自有储值卡的工厂、办公室、学校或食堂。" },
        { title: "折扣优惠券", description: "商家以代码或二维码向顾客发放优惠券，在机器前使用。" },
        { title: "10 种语言", description: "顾客自行选择屏幕语言。" },
        { title: "后台管理库存和状态", description: "查看每台机器的实时及离线库存，设置商品和价格，查看销售和在线状态。" },
      ],
      specs: [
        { label: "屏幕", value: "竖屏触摸屏 10.1 / 15.6 / 21.5 英寸" },
        { label: "现金", value: "硬币 1、2、5、10 泰铢 · 纸币 20、50、100、500 泰铢 · 自动找零" },
        { label: "扫码支付", value: "PromptPay · WeChat Pay · Alipay · TrueMoney · LAO QR" },
        { label: "其他", value: "封闭式储值卡 · 优惠券代码 / 二维码" },
        { label: "语言", value: "10 种" },
        { label: "CAN 机柜（日式）", value: "32 个货道，适合圆形瓶装和罐装饮料 · 带制冷" },
        { label: "Spiral 螺旋机柜", value: "可放瓶装、罐装及袋装零食\n有升降梯款和无升降梯款 · 制冷款和常温款\n30 个以上货道，多种尺寸可选" },
        { label: "后台", value: "销售看板 · 实时及离线库存 · 设备状态" },
      ],
      faq: [
        { question: "CAN 机柜和 Spiral 机柜有什么区别？", answer: "日式 CAN 机柜有 32 个货道，适合圆形瓶罐饮料，带制冷；Spiral 机柜使用螺旋弹簧，可放饮料和袋装零食，有升降梯和无升降梯款，也有制冷和常温款。" },
        { question: "Spiral 机柜的升降梯有什么用？", answer: "升降梯把商品从货架送到取货口，而不是让它直接掉落，适合不宜碰撞的商品。" },
        { question: "Online 和 Offline 有什么不同？", answer: "Online 款有触摸屏、扫码支付、封闭式储值卡、优惠券和后台；Offline 款只收硬币和纸币，没有后台。" },
        { question: "LAO QR 有什么用？", answer: "让老挝顾客用老挝银行 App 扫码付款，适合边境地区和旅游景点。" },
      ],
    },
    vendingOffline: {
      metaTitle: "Vending Machine Offline：收硬币和纸币 | MYPOS",
      metaDescription: "MYPOS Vending Machine Offline 收 1、2、5、10 泰铢硬币和 20、50、100、500 泰铢纸币，无需联网，也无需后台。",
      hero: {
        eyebrow: "Vending Machine Offline",
        title: "投币式售货机，放在哪里都能卖，无需联网",
        subtitle: "收硬币和纸币，适合只需要简单售货机、不需要后台的场所。",
      },
      painGain: [
        { pain: "安装地点没有稳定的网络", gain: "离线运行，无需联网" },
        { pain: "不需要复杂的系统", gain: "收硬币和纸币，买家和机主都简单易用" },
      ],
      steps: [
        { title: "选择商品", description: "顾客从机器货道中选择商品。" },
        { title: "投币或纸币", description: "硬币 1、2、5、10 泰铢，纸币 20、50、100、500 泰铢。" },
        { title: "取货", description: "商品落到取货口。" },
      ],
      cases: [],
      features: [
        { title: "收硬币和纸币", description: "硬币 1、2、5、10 泰铢，纸币 20、50、100、500 泰铢。" },
        { title: "无需联网", description: "独立运行，适合网络不稳定的地点。" },
        { title: "按商品选择机柜", description: "可向我们的团队咨询 Offline 款适用的 CAN 和 Spiral 机柜。" },
      ],
      specs: [
        { label: "支付", value: "硬币 1、2、5、10 泰铢 · 纸币 20、50、100、500 泰铢" },
        { label: "连接", value: "无需联网" },
        { label: "后台", value: "无（独立运行）" },
        { label: "机柜", value: "请向我们的团队咨询支持的型号" },
      ],
      faq: [
        { question: "Offline 款能扫码付款吗？", answer: "不能，Offline 款只收硬币和纸币。如需扫码、封闭式储值卡、优惠券或后台库存，请选择 Online 款。" },
        { question: "Offline 款适合哪些地方？", answer: "只需要简单售货机，或没有稳定网络的地点。" },
      ],
    },
  },
};

/** Flattens nested objects into dotted keys; arrays stay whole (as JSON). */
function flatten(tree: Tree, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const dotted = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[dotted] = value;
    else if (Array.isArray(value)) out[dotted] = JSON.stringify(value);
    else Object.assign(out, flatten(value, dotted));
  }
  return out;
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const base = target[key];
      target[key] = deepMerge(base && typeof base === "object" && !Array.isArray(base) ? (base as Record<string, unknown>) : {}, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
}

async function main() {
  for (const locale of Object.keys(COPY) as Locale[]) {
    const byNamespace: Record<string, Tree> = { ...COPY[locale], solutions: SOLUTIONS[locale] as unknown as Tree };

    for (const [namespace, tree] of Object.entries(byNamespace)) {
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
    const messages = deepMerge(JSON.parse(raw), byNamespace as unknown as Record<string, unknown>);
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    fs.writeFileSync(file, JSON.stringify(messages, null, 2).replace(/\n/g, eol) + eol, "utf8");
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
