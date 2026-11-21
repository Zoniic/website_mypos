/**
 * Pushes the new SEO titles and descriptions of the hub pages (home,
 * /products, /blog, /references, /knowledge-base) from messages/*.json into
 * the PageContent table. The live site reads copy from the database
 * (messages/*.json is only the seed), so editing the JSON alone changes nothing.
 *
 * Safe by default:
 *   - dry run: says what would change and writes nothing;
 *   - a row is only replaced while it still holds the previous seed copy (or
 *     is missing), so text already edited in the admin is kept and listed;
 *   - with --write, the current rows are saved to
 *     prisma/backups/update-hub-seo-copy-<timestamp>.json first;
 *   - idempotent: a second run finds nothing to change.
 *
 * Run:
 *   npx tsx prisma/update-hub-seo-copy.ts                      (dry run)
 *   npx tsx prisma/update-hub-seo-copy.ts --write              (backup, then update)
 *   npx tsx prisma/update-hub-seo-copy.ts --restore --write    (put the previous copy back)
 *
 * The public site caches copy for up to 5 minutes; restart the server or save
 * any page in the admin to see the change right away.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const LOCALES = ["th", "en", "zh"] as const;
const NAMESPACES = ["home", "productsCommon", "blog", "references", "kb"] as const;
const KEYS = ["metaTitle", "metaDescription"] as const;
type Locale = (typeof LOCALES)[number];
type Copy = Record<(typeof NAMESPACES)[number], Record<(typeof KEYS)[number], string>>;

/** What these rows held before this change (the seed copy in messages/*.json). */
const PREVIOUS: Record<Locale, Copy> = {
  th: {
    home: {
      metaTitle: "MYPOS | ระบบ POS และ Self-Service ครบวงจร สำหรับร้านค้าและธุรกิจอาหาร",
      metaDescription:
        "MYPOS ผู้ผลิตระบบ POS และตู้สั่งอาหารด้วยตนเอง (Self-Order) สัญชาติไทย ออกแบบ ผลิต และดูแลบริการหลังการขายเอง รองรับร้านอาหาร ค้าปลีก บุฟเฟต์ และสวนสนุก",
    },
    productsCommon: {
      metaTitle: "สินค้าทั้งหมด | MYPOS",
      metaDescription:
        "เลือกซื้อตู้สั่งอาหาร เครื่องชั่งขีด POS และคีออสก์จำหน่ายตั๋วจาก MYPOS ค้นหาและกรองตามประเภทธุรกิจ ระบบปฏิบัติการ และขนาดจอ",
    },
    blog: {
      metaTitle: "บทความ | MYPOS",
      metaDescription: "บทความ เคล็ดลับ และข่าวสารเกี่ยวกับระบบ POS และ self-service จาก MYPOS",
    },
    references: {
      metaTitle: "ผลงานลูกค้า | MYPOS",
      metaDescription: "ตัวอย่างธุรกิจที่ใช้งานระบบ MYPOS ตั้งแต่ร้านอาหาร ค้าปลีก บุฟเฟต์ ไปจนถึงสวนสนุกและโรงแรม",
    },
    kb: {
      metaTitle: "คลังความรู้ | MYPOS",
      metaDescription: "คู่มือและวิธีใช้งานฮาร์ดแวร์และซอฟต์แวร์ MYPOS การติดตั้ง การแก้ปัญหาเบื้องต้น และบทความสอนใช้งาน",
    },
  },
  en: {
    home: {
      metaTitle: "MYPOS | Full-Service POS & Self-Service Systems for Retail and F&B",
      metaDescription:
        "MYPOS is a Thai manufacturer of POS and self-order kiosk systems — designed, built, and supported in-house. Built for restaurants, retail, buffets, and theme parks.",
    },
    productsCommon: {
      metaTitle: "All Products | MYPOS",
      metaDescription:
        "Shop self-order kiosks, weigh & pay scales, POS terminals, and ticketing kiosks from MYPOS. Search and filter by business type, OS, and screen size.",
    },
    blog: {
      metaTitle: "Blog | MYPOS",
      metaDescription: "Tips, guides, and news about POS and self-service systems from MYPOS.",
    },
    references: {
      metaTitle: "Case Studies | MYPOS",
      metaDescription: "See how businesses use MYPOS — from restaurants and retail to buffets, theme parks, and hotels.",
    },
    kb: {
      metaTitle: "Knowledge Base | MYPOS",
      metaDescription:
        "Guides and manuals for MYPOS hardware and software — installation, troubleshooting, and how-to articles.",
    },
  },
  zh: {
    home: {
      metaTitle: "MYPOS | 泰国收银与自助服务系统一站式解决方案",
      metaDescription:
        "MYPOS 是泰国本土的收银系统与自助点餐机制造商，自主设计、生产并提供售后服务，适用于餐饮、零售、自助餐及主题乐园等行业。",
    },
    productsCommon: {
      metaTitle: "全部产品 | MYPOS",
      metaDescription: "选购 MYPOS 自助点餐机、自助称重设备、收银系统与自助售票机，支持按行业类型、操作系统与屏幕尺寸搜索筛选。",
    },
    blog: {
      metaTitle: "博客 | MYPOS",
      metaDescription: "来自 MYPOS 的 POS 与自助服务系统技巧、指南与最新消息。",
    },
    references: {
      metaTitle: "客户案例 | MYPOS",
      metaDescription: "了解各行业商家如何使用 MYPOS 系统，涵盖餐厅、零售、自助餐、主题乐园及酒店等领域。",
    },
    kb: {
      metaTitle: "知识库 | MYPOS",
      metaDescription: "MYPOS 硬件与软件的使用指南与手册——安装、故障排除与操作教程。",
    },
  },
};

function seedCopy(locale: Locale): Copy {
  const file = path.join(__dirname, "..", "messages", `${locale}.json`);
  const messages = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, Record<string, unknown>>;
  const copy = {} as Copy;
  for (const namespace of NAMESPACES) {
    const metaTitle = messages[namespace]?.metaTitle;
    const metaDescription = messages[namespace]?.metaDescription;
    if (typeof metaTitle !== "string" || typeof metaDescription !== "string" || !metaTitle || !metaDescription) {
      throw new Error(`messages/${locale}.json: ${namespace}.metaTitle / metaDescription missing`);
    }
    copy[namespace] = { metaTitle, metaDescription };
  }
  return copy;
}

async function main() {
  const write = process.argv.includes("--write");
  const restore = process.argv.includes("--restore");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.pageContent.findMany({
      where: { namespace: { in: [...NAMESPACES] }, key: { in: [...KEYS] }, locale: { in: [...LOCALES] } },
    });
    const byId = new Map(rows.map((row) => [`${row.namespace}.${row.key} [${row.locale}]`, row]));

    const changes: { id: string; namespace: string; key: string; locale: Locale; from: string | null; to: string }[] = [];
    const kept: string[] = [];
    for (const locale of LOCALES) {
      const next = seedCopy(locale);
      for (const namespace of NAMESPACES) {
        for (const key of KEYS) {
          const [expected, to] = restore
            ? [next[namespace][key], PREVIOUS[locale][namespace][key]]
            : [PREVIOUS[locale][namespace][key], next[namespace][key]];
          const id = `${namespace}.${key} [${locale}]`;
          const row = byId.get(id);
          if (row?.value === to) continue;
          if (row && row.value !== expected) {
            kept.push(`${id}: changed in the admin, left as is: ${JSON.stringify(row.value)}`);
            continue;
          }
          changes.push({ id, namespace, key, locale, from: row?.value ?? null, to });
        }
      }
    }

    for (const line of kept) console.log(`KEEP ${line}`);
    for (const change of changes) console.log(`${change.id}: ${JSON.stringify(change.from)} -> ${JSON.stringify(change.to)}`);
    if (changes.length === 0) {
      console.log("Nothing to change.");
      return;
    }
    if (!write) {
      console.log(`Dry run: ${changes.length} rows would change, nothing written. Re-run with --write to apply.`);
      return;
    }

    const dir = path.join(__dirname, "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `update-hub-seo-copy-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
    console.log(`Backup written: ${file}`);

    for (const change of changes) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: change.namespace, key: change.key, locale: change.locale } },
        create: { namespace: change.namespace, key: change.key, locale: change.locale, value: change.to },
        update: { value: change.to },
      });
    }
    console.log(`Applied: ${changes.length} rows.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
