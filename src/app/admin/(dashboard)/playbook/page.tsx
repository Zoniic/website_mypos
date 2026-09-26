import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";
import { industrySlugs } from "@/data/industries";
import { SECTION_GUIDES, type SectionGuideKey } from "../guides";

const industryLabels: Record<string, string> = {
  restaurant: "ร้านอาหาร",
  cafeteria: "โรงอาหาร",
  buffet: "บุฟเฟต์",
  bakery: "เบเกอรี่",
  retail: "ค้าปลีก",
  convenience: "ร้านสะดวกซื้อ",
  hotel: "โรงแรม",
  themepark: "สวนสนุก",
  manufacturing: "โรงงาน",
  office: "สำนักงานและอาคาร",
  school: "สถานศึกษา",
};

const competitors = [
  { name: "Wongnai POS (FoodStory)", strength: "72,000+ ร้าน, 8 หน้าประเภทธุรกิจ, ราคาแพ็กเกจชัด, ปุ่มนัดสาธิต", gap: "ไม่มีเคสลูกค้าละเอียด ไม่มีวิดีโอสาธิต ไม่ผลิตฮาร์ดแวร์เอง" },
  { name: "StoreHub", strength: "คะแนน Google 4.7/5, รีวิวลูกค้า 6 ราย, หน้าตามอุตสาหกรรม", gap: "ไม่แสดงราคา ไม่ระบุการเชื่อมต่อจริง" },
  { name: "POSPOS", strength: "วิดีโอรีวิว 13+ คลิป, ราคาหลายแพ็กเกจ, พาร์ทเนอร์ 14+ ราย, e-Tax/EDC", gap: "เมนูแน่น ไม่มีเครื่องคำนวณความคุ้มค่า" },
  { name: "POS2U", strength: "ราคาเครื่อง + ซอฟต์แวร์ชัด, แท็บเลือกประเภทธุรกิจ, วิดีโอ", gap: "ไม่มีรีวิวลูกค้า ไม่บอกจำนวนลูกค้า" },
  { name: "SeniorSoft", strength: "55,000+ ร้าน, 27 ปี, 5 สาขาบริการ", gap: "ไม่มีราคา ไม่มีรีวิว เมนูรก" },
  { name: "SUPER restaurantOS", strength: "1,000+ ร้าน, เน้น AI/ระบบครบ, FAQ", gap: "ไม่มีเคสลูกค้า ไม่ขายฮาร์ดแวร์" },
  { name: "ChocoCRM / ChocoPOS", strength: "3,000+ ธุรกิจ, รางวัล/ใบรับรอง, หน้า Success Cases", gap: "ไม่แสดงราคา" },
  { name: "Ocha / Qashier / Myhost", strength: "Ocha ขายเครื่อง+ซอฟต์แวร์ผ่าน Shopee, Qashier มี kiosk + QR ordering", gap: "เว็บ Ocha ใบรับรอง SSL หมดอายุ (ความน่าเชื่อถือต่ำ), Myhost เนื้อหาน้อย" },
];

const done = [
  { label: "หน้าประเภทธุรกิจ 9 หน้า + หน้ารวม", href: "/th/industries", note: "คู่แข่งหลักมีทุกเจ้า — ตอนนี้เราครอบคลุมมากกว่า Wongnai (8)" },
  { label: "เครื่องคำนวณความคุ้มค่าตู้สั่งอาหาร", href: "/th/tools/savings-calculator", note: "ไม่มีคู่แข่งรายใดมี" },
  { label: "ปุ่มนัดสาธิต + ฟอร์มติดต่อบันทึกข้อมูลจริง", href: "/th/contact?topic=demo", note: "ดูคำขอได้ที่ Contact Messages" },
  { label: "เมนู \"ประเภทธุรกิจ\" และ \"คำนวณความคุ้มค่า\" บน Header/Footer", href: "/th", note: "ช่วย internal linking" },
  { label: "Sitemap ครบทุกหน้า (เคสลูกค้า บทความ ตำแหน่งงาน ประเภทธุรกิจ)", href: "/sitemap.xml", note: "ส่ง sitemap นี้ใน Google Search Console" },
  { label: "Structured data: FAQ, Breadcrumb, ItemList, WebApplication", href: "/th/industries/restaurant", note: "ช่วยให้ผลค้นหาแสดงคำถาม/เส้นทางหน้า" },
];

const roadmap = [
  {
    phase: "สัปดาห์ที่ 1–2: ใส่ข้อมูลจริง",
    items: [
      "Site Settings: เบอร์ LINE แผนที่ และตัวเลขสถิติจริง",
      "Page Content → pricing: ราคาแพ็กเกจจริงที่ฝ่ายขายยืนยัน",
      "สร้าง/อัปเดต Google Business Profile และเริ่มขอรีวิวจากลูกค้า",
      "Site Photos: รูปหน้าประเภทธุรกิจ 9 ภาพ",
      "ตรวจตัวเลขในเคสลูกค้าเดิมทุกเคสว่ามีที่มาจริง",
    ],
  },
  {
    phase: "เดือนที่ 1: เนื้อหาหลัก",
    items: [
      "สินค้าทุกรุ่น: รูปครบ ราคาเริ่มต้น Business Types และ Datasheet",
      "เคสลูกค้าอย่างน้อย 1 เคสต่อประเภทธุรกิจหลัก",
      "โลโก้ลูกค้า 12+ แบรนด์",
      "ตรวจและปรับข้อความหน้าประเภทธุรกิจทั้ง 3 ภาษา",
    ],
  },
  {
    phase: "เดือนที่ 2–3: ขยายการเข้าถึง",
    items: [
      "บทความ 2 บทความ/เดือน ตามคู่มือหัวข้อ Blog",
      "KB: 10 คำถามที่ซัพพอร์ตเจอบ่อยที่สุด",
      "วิดีโอสาธิตรุ่นหลัก 30–60 วินาที + วิดีโอรีวิวลูกค้า 3 คลิป",
    ],
  },
  {
    phase: "ต่อเนื่อง: วัดผลทุกเดือน",
    items: [
      "Google Search Console: คำค้นที่ติดอันดับ และหน้าที่ถูกคลิก",
      "จำนวนคำขอนัดสาธิต / ใบเสนอราคา ต่อเดือน",
      "เวลาตอบกลับลีด (เป้าหมาย: ภายในวันทำการเดียวกัน)",
      "เทียบคู่แข่งทุกไตรมาส (ตัวเลข ราคา ฟีเจอร์ใหม่)",
    ],
  },
];

const sectionLinks: Record<SectionGuideKey, string> = {
  products: "/admin/products",
  accessories: "/admin/accessories",
  references: "/admin/references",
  blog: "/admin/blog",
  careers: "/admin/careers",
  kbCategories: "/admin/kb-categories",
  kbArticles: "/admin/kb-articles",
  content: "/admin/content",
  photos: "/admin/photos",
  trustLogos: "/admin/trust-logos",
  officialPartners: "/admin/official-partners",
  settings: "/admin/settings",
  contactMessages: "/admin/contact-messages",
  quoteRequests: "/admin/quote-requests",
  orders: "/admin/orders",
};

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden>{ok ? "✅" : "⚠️"}</span>
      <span className={ok ? "text-text-2" : "text-text-1"}>{children}</span>
    </li>
  );
}

export default async function PlaybookPage() {
  const [products, references, blogCount, trustLogoCount, newLeads, settings, images] =
    await Promise.all([
      prisma.product.findMany({ select: { slug: true, imageUrl: true, businessTypes: { select: { slug: true } } } }),
      prisma.referenceCase.findMany({ select: { businessType: true, imageUrl: true } }),
      prisma.blogPost.count(),
      prisma.trustLogo.count(),
      prisma.contactMessage.count({ where: { status: "new" } }),
      getSiteSettings(),
      getSiteImages(),
    ]);

  const productsNoImage = products.filter((p) => !p.imageUrl).length;
  const productsNoType = products.filter((p) => p.businessTypes.length === 0).length;
  const industriesWithCase = new Set(references.map((r) => r.businessType));
  const industriesMissingCase = industrySlugs.filter((type) => !industriesWithCase.has(type));
  const industryPhotos = industrySlugs.filter((type) => images[`industry-${type}`]).length;
  const settingFields = ["phone", "email", "lineUrl", "mapEmbedUrl", "statsClients", "statsYears"] as const;
  const missingSettings = settingFields.filter((field) => !settings[field]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Content Playbook — แผนแซงคู่แข่ง</h1>
      <p className="mt-1 text-text-2">
        สรุปว่าคู่แข่งทำอะไร เว็บเราทำอะไรไปแล้ว และทีมต้องใส่เนื้อหาอะไรต่อ ทุกเมนูใน Admin มีกล่อง
        &quot;📋 คู่มือเนื้อหา&quot; ด้านบนที่ลงรายละเอียดของหัวข้อนั้น
      </p>

      <section className="mt-8 rounded-xl border border-border p-5">
        <h2 className="text-lg font-semibold">สถานะเนื้อหาตอนนี้ (ดึงจากข้อมูลจริง)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <Status ok={products.length > 0 && productsNoImage === 0}>
            สินค้า {products.length} รุ่น{productsNoImage > 0 && ` — ยังไม่มีรูปหลัก ${productsNoImage} รุ่น`}
          </Status>
          <Status ok={products.length > 0 && productsNoType === 0}>
            {productsNoType > 0
              ? `สินค้า ${productsNoType} รุ่นยังไม่ได้เลือก Business Types (จะไม่ขึ้นในหน้าประเภทธุรกิจ)`
              : "สินค้าทุกรุ่นเลือก Business Types แล้ว"}
          </Status>
          <Status ok={industriesMissingCase.length === 0}>
            {industriesMissingCase.length === 0
              ? "ทุกประเภทธุรกิจมีเคสลูกค้าแล้ว"
              : `ประเภทธุรกิจที่ยังไม่มีเคสลูกค้า: ${industriesMissingCase.map((t) => industryLabels[t]).join(", ")}`}
          </Status>
          <Status ok={industryPhotos === industrySlugs.length}>
            รูปหน้าประเภทธุรกิจ {industryPhotos}/{industrySlugs.length} ภาพ
          </Status>
          <Status ok={missingSettings.length === 0}>
            {missingSettings.length === 0
              ? "Site Settings ครบทุกช่องสำคัญ"
              : `Site Settings ที่ยังว่าง: ${missingSettings.join(", ")}`}
          </Status>
          <Status ok={trustLogoCount >= 12}>โลโก้ลูกค้า {trustLogoCount} แบรนด์ (เป้าหมาย 12+)</Status>
          <Status ok={blogCount >= 6}>บทความ {blogCount} บทความ (เป้าหมาย 2/เดือน)</Status>
          <Status ok={newLeads === 0}>
            {newLeads === 0 ? "ไม่มีข้อความติดต่อค้าง" : `ข้อความติดต่อที่ยังไม่ได้ตอบ ${newLeads} รายการ`}
          </Status>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">คู่แข่ง: จุดแข็ง และช่องที่เราชนะได้</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-0 text-text-2">
              <tr>
                <th className="px-4 py-2 font-medium">คู่แข่ง</th>
                <th className="px-4 py-2 font-medium">จุดแข็ง</th>
                <th className="px-4 py-2 font-medium">ช่องที่เราชนะได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {competitors.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-2 font-medium text-text-1">{row.name}</td>
                  <td className="px-4 py-2 text-text-2">{row.strength}</td>
                  <td className="px-4 py-2 text-text-2">{row.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-text-1">
          <strong>จุดยืนของเรา:</strong> คู่แข่งเกือบทั้งหมดเป็นบริษัทซอฟต์แวร์ที่ขายเครื่องของแบรนด์อื่น —
          MYPOS ผลิตเครื่องเองในไทย ทำ Self-service kiosk / เครื่องชั่ง / ตู้ขายตั๋วได้ และดูแลตลอดอายุการใช้งาน
          ทุกเนื้อหาควรพิสูจน์ 3 เรื่องนี้ด้วยรูปจริง ตัวเลขจริง และเคสลูกค้าจริง
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">สิ่งที่ทำบนเว็บแล้ว</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {done.map((item) => (
            <li key={item.label} className="flex gap-2">
              <span aria-hidden>✅</span>
              <span>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:underline"
                >
                  {item.label}
                </Link>
                <span className="text-text-2"> — {item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">งานที่ทีมต้องทำต่อ (เรียงตามลำดับ)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {roadmap.map((block) => (
            <div key={block.phase} className="rounded-xl border border-border p-4">
              <h3 className="font-semibold text-text-1">{block.phase}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-2">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">เช็คลิสต์รายเมนู</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {(Object.keys(SECTION_GUIDES) as SectionGuideKey[]).map((key) => {
            const guide = SECTION_GUIDES[key];
            return (
              <div key={key} className="rounded-xl border border-border p-4">
                <Link href={sectionLinks[key]} className="font-semibold text-primary-600 hover:underline">
                  {guide.title} →
                </Link>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-2">
                  {guide.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
