/**
 * One-off, idempotent migration adding the competitor-driven homepage sections:
 *   - Repositioned home.hero copy (manufacturer-led, POS + self-service)
 *   - trust.points  → qualitative trust strip (no customer-count needed)
 *   - pricing.*     → "เริ่มต้นที่ ฿X" package section
 *   - testimonials.* → customer-quote section (starts empty; team fills later)
 *
 * Writes into both the DB (authoritative at runtime) and messages/*.json
 * (seed parity). Run: npx tsx prisma/add-competitive-sections.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");

type Locale = "th" | "en" | "zh";

// Per-locale content. Arrays/objects are JSON-encoded when stored in PageContent.
const CONTENT: Record<Locale, Record<string, Record<string, unknown>>> = {
  th: {
    home: {
      "hero.tagline": "ผู้ผลิตไทย · ออกแบบ ผลิต ติดตั้ง ดูแลเอง",
      "hero.headlineLine1": "ระบบ POS และตู้บริการตนเอง",
      "hero.headlineLine2": "ที่เราผลิตเองทั้งระบบ",
      "hero.missionStatement":
        "MYPOS ออกแบบและผลิตเครื่อง POS ตู้สั่งอาหาร เครื่องชั่งคิดเงิน และตู้บริการตนเองในโรงงานที่ไทย พร้อมทีมติดตั้งและดูแลตลอดอายุการใช้งาน",
      "hero.subtitle":
        "ครบตั้งแต่ฮาร์ดแวร์ที่เราผลิตเอง ไปจนถึงซอฟต์แวร์บริหารร้าน เชื่อมพร้อมเพย์ บัตร และเดลิเวอรี — เหมาะกับร้านอาหาร ค้าปลีก ตลาด และธุรกิจบริการทุกขนาด",
    },
    trust: {
      points: [
        "ผลิตเอง 100% ในโรงงานไทย",
        "รับประกันโดยผู้ผลิตโดยตรง",
        "อะไหล่พร้อม ซ่อมเร็วทั่วประเทศ",
        "ทีมช่างติดตั้งถึงหน้าร้าน",
      ],
    },
    pricing: {
      eyebrow: "แพ็กเกจและราคา",
      title: "เริ่มต้นได้ตามขนาดธุรกิจ",
      lede: "ราคาเริ่มต้นแบบโปร่งใส ปรับแต่งได้ตามหน้างานจริง — ขอใบเสนอราคาเพื่อสเปกที่ตรงกับร้านคุณ",
      priceFrom: "เริ่มต้น",
      priceUnit: "บาท",
      note: "ราคายังไม่รวมภาษีมูลค่าเพิ่ม · ผ่อน 0% ได้ตามเงื่อนไข",
      ctaLabel: "ขอใบเสนอราคา",
      items: [
        {
          name: "ร้านเริ่มต้น",
          audience: "เหมาะกับร้านเดียว / SME",
          price: "19,900",
          priceNote: "",
          features: [
            "เครื่อง POS ที่เราผลิตเอง",
            "ซอฟต์แวร์บริหารร้าน + รายงานยอดขาย",
            "ติดตั้งและสอนใช้งานถึงหน้าร้าน",
          ],
          featured: false,
        },
        {
          name: "ร้านอาหาร + สั่งเอง",
          audience: "ร้านอาหาร / คาเฟ่ ที่อยากลดคิว",
          price: "49,900",
          priceNote: "",
          features: [
            "ทุกอย่างในแพ็กเริ่มต้น",
            "ตู้สั่งอาหารด้วยตนเอง (Self-Order)",
            "เชื่อมพร้อมเพย์ บัตร และเดลิเวอรี",
          ],
          featured: true,
        },
        {
          name: "องค์กร / หลายสาขา",
          audience: "เชน / องค์กร (B2B)",
          price: "",
          priceNote: "ประเมินตามงาน",
          features: [
            "ตู้คิว / เครื่องชั่ง ตามโจทย์เฉพาะ",
            "จัดการรวมศูนย์หลายสาขา",
            "สัญญาดูแลและอะไหล่เฉพาะองค์กร",
          ],
          featured: false,
        },
      ],
    },
    testimonials: {
      eyebrow: "เสียงจากลูกค้า",
      title: "ธุรกิจที่เติบโตไปกับ MYPOS",
      items: [],
    },
  },

  en: {
    home: {
      "hero.tagline": "Thai manufacturer · designed, built, installed, supported in-house",
      "hero.headlineLine1": "POS & self-service systems",
      "hero.headlineLine2": "we build end to end",
      "hero.missionStatement":
        "MYPOS designs and manufactures POS terminals, self-order kiosks, weigh stations, and service kiosks in our own Thai factory — with a team that installs and supports them for life.",
      "hero.subtitle":
        "From the hardware we build ourselves to the software that runs your store — with PromptPay, card, and delivery integrations — for restaurants, retail, markets, and service businesses of every size.",
    },
    trust: {
      points: [
        "100% built in our own Thai factory",
        "Warranty direct from the manufacturer",
        "Spare parts on hand, fast nationwide repair",
        "Technicians install on-site",
      ],
    },
    pricing: {
      eyebrow: "Packages & pricing",
      title: "Start at the size of your business",
      lede: "Transparent starting prices, tailored to your real setup — request a quote for a spec that fits your shop.",
      priceFrom: "from",
      priceUnit: "THB",
      note: "Prices exclude VAT · 0% installment available (T&C apply)",
      ctaLabel: "Request a quote",
      items: [
        {
          name: "Starter shop",
          audience: "For a single shop / SME",
          price: "19,900",
          priceNote: "",
          features: [
            "A POS terminal we build ourselves",
            "Store-management software + sales reports",
            "On-site installation and training",
          ],
          featured: false,
        },
        {
          name: "Restaurant + self-order",
          audience: "Restaurants / cafes cutting queues",
          price: "49,900",
          priceNote: "",
          features: [
            "Everything in Starter",
            "Self-order kiosk",
            "PromptPay, card, and delivery integration",
          ],
          featured: true,
        },
        {
          name: "Enterprise / multi-branch",
          audience: "Chains / enterprise (B2B)",
          price: "",
          priceNote: "Custom quote",
          features: [
            "Queue / weigh kiosks built to spec",
            "Centralized multi-branch management",
            "Dedicated support & parts contract",
          ],
          featured: false,
        },
      ],
    },
    testimonials: {
      eyebrow: "Customer stories",
      title: "Businesses growing with MYPOS",
      items: [],
    },
  },

  zh: {
    home: {
      "hero.tagline": "泰国制造商 · 自主设计、生产、安装、维护",
      "hero.headlineLine1": "POS 与自助服务系统",
      "hero.headlineLine2": "由我们全程自制",
      "hero.missionStatement":
        "MYPOS 在泰国自有工厂设计并制造 POS 收银机、自助点餐机、称重收银机和服务终端，并由团队负责全生命周期的安装与维护。",
      "hero.subtitle":
        "从我们自制的硬件到管理门店的软件，集成 PromptPay、银行卡与外卖——适合各种规模的餐厅、零售、市场与服务业。",
    },
    trust: {
      points: [
        "泰国自有工厂 100% 自制",
        "厂商直接保修",
        "备件充足，全国快速维修",
        "技师上门安装",
      ],
    },
    pricing: {
      eyebrow: "套餐与价格",
      title: "按业务规模起步",
      lede: "透明的起步价格，可按实际需求定制——索取报价以获得适合您门店的配置。",
      priceFrom: "起",
      priceUnit: "泰铢",
      note: "价格未含增值税 · 可 0% 分期（须符合条件）",
      ctaLabel: "索取报价",
      items: [
        {
          name: "入门门店",
          audience: "适合单店 / 中小企业",
          price: "19,900",
          priceNote: "",
          features: ["我们自制的 POS 收银机", "门店管理软件 + 销售报表", "上门安装与培训"],
          featured: false,
        },
        {
          name: "餐厅 + 自助点餐",
          audience: "希望减少排队的餐厅 / 咖啡馆",
          price: "49,900",
          priceNote: "",
          features: ["包含入门套餐全部内容", "自助点餐机", "集成 PromptPay、银行卡与外卖"],
          featured: true,
        },
        {
          name: "企业 / 多门店",
          audience: "连锁 / 企业（B2B）",
          price: "",
          priceNote: "按项目报价",
          features: ["按需定制排队 / 称重终端", "多门店集中管理", "专属维护与备件合同"],
          featured: false,
        },
      ],
    },
    testimonials: {
      eyebrow: "客户之声",
      title: "与 MYPOS 一同成长的企业",
      items: [],
    },
  },
};

function deepSet(obj: Record<string, unknown>, dotted: string, value: unknown) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

async function main() {
  for (const locale of Object.keys(CONTENT) as Locale[]) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    for (const [namespace, entries] of Object.entries(CONTENT[locale])) {
      for (const [key, value] of Object.entries(entries)) {
        const stored =
          typeof value === "string" ? value : JSON.stringify(value);

        // 1) DB (authoritative at runtime)
        await prisma.pageContent.upsert({
          where: { namespace_key_locale: { namespace, key, locale } },
          create: { namespace, key, locale, value: stored },
          update: { value: stored },
        });

        // 2) messages/*.json (seed parity) — nest under namespace
        if (!messages[namespace] || typeof messages[namespace] !== "object") {
          messages[namespace] = {};
        }
        deepSet(messages[namespace], key, value);
      }
    }

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
