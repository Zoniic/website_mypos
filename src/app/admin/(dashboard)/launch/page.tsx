import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { availablePaymentMethods } from "@/lib/orders";
import { organizationSameAs } from "@/lib/structuredData";
import { cleanTrackingId, cleanVerificationToken } from "@/lib/trackingIds";
import { notificationStatus } from "@/lib/notify";

type Check = {
  label: string;
  /** "optional" checks never count against the score. */
  state: "ok" | "todo" | "optional";
  detail: string;
  href: string;
};

type Group = { title: string; why: string; checks: Check[] };

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

export default async function LaunchChecklistPage() {
  const settings = await getSiteSettings();
  const [
    products,
    accessories,
    trustLogos,
    references,
    blogPosts,
    kbArticles,
    heroImage,
  ] = await Promise.all([
    prisma.product.findMany({ include: { translations: true } }),
    prisma.accessory.findMany({ select: { onlinePrice: true, imageUrl: true, shopeeUrl: true, lazadaUrl: true } }),
    prisma.trustLogo.count(),
    prisma.referenceCase.count(),
    prisma.blogPost.count(),
    prisma.kbArticle.count(),
    prisma.siteImage.findUnique({ where: { key: "hero" } }),
  ]);

  const withPhoto = products.filter((p) => p.imageUrl).length;
  const fullyTranslated = products.filter(
    (p) => ["th", "en", "zh"].every((l) => p.translations.some((t) => t.locale === l && t.name.trim() && t.highlight.trim()))
  ).length;
  const onlineItems =
    products.filter((p) => p.onlinePrice !== null).length + accessories.filter((a) => a.onlinePrice !== null).length;
  const feedItems =
    products.filter((p) => p.onlinePrice !== null && p.imageUrl).length +
    accessories.filter((a) => a.onlinePrice !== null && a.imageUrl).length;
  const marketplaceLinked =
    products.filter((p) => p.shopeeUrl || p.lazadaUrl).length + accessories.filter((a) => a.shopeeUrl || a.lazadaUrl).length;
  const payments = availablePaymentMethods(settings);
  const sameAs = organizationSameAs(settings).length;
  const notify = notificationStatus();
  const has = (key: Parameters<typeof cleanTrackingId>[0]) => Boolean(cleanTrackingId(key, settings[key]));

  const groups: Group[] = [
    {
      title: "ติดต่อได้ & น่าเชื่อถือ",
      why: "คนที่เห็นโฆษณาหรือผลค้นหาจะตัดสินใจภายในไม่กี่วินาที — ต้องติดต่อได้ทันทีและเห็นหลักฐานว่ามีร้านใช้จริง",
      checks: [
        { label: "เบอร์โทร", state: settings.phone ? "ok" : "todo", detail: settings.phoneDisplay || settings.phone || "ยังไม่ได้ใส่", href: "/admin/settings" },
        { label: "LINE OA", state: settings.lineUrl ? "ok" : "todo", detail: settings.lineId || "ยังไม่ได้ใส่ — ช่องทางปิดการขายหลักของลูกค้าไทย", href: "/admin/settings" },
        { label: "อีเมล", state: settings.email ? "ok" : "todo", detail: settings.email || "ยังไม่ได้ใส่", href: "/admin/settings" },
        { label: "รูป Hero หน้าแรก (ภาพจริง)", state: heroImage?.url ? "ok" : "todo", detail: heroImage?.url ? "อัปโหลดแล้ว" : "ยังใช้ภาพวาดเครื่อง — ภาพจริงในร้านลูกค้าน่าเชื่อกว่า", href: "/admin/photos" },
        { label: "รูปสินค้า", state: products.length && withPhoto === products.length ? "ok" : "todo", detail: `${withPhoto}/${products.length} รุ่นมีรูป (${pct(withPhoto, products.length)}%)`, href: "/admin/products" },
        { label: "โลโก้ลูกค้า ≥ 8", state: trustLogos >= 8 ? "ok" : "todo", detail: `${trustLogos} โลโก้`, href: "/admin/trust-logos" },
        { label: "ผลงานลูกค้า (Case study) ≥ 3", state: references >= 3 ? "ok" : "todo", detail: `${references} เรื่อง`, href: "/admin/references" },
        { label: "ตัวเลขหน้าแรก (จำนวนร้าน/ปี)", state: settings.statsClients && settings.statsYears ? "ok" : "todo", detail: settings.statsClients ? `${settings.statsClients} ร้าน · ${settings.statsYears} ปี` : "ยังไม่ได้ใส่ — ส่วนนี้จะซ่อนจนกว่าจะใส่", href: "/admin/settings" },
      ],
    },
    {
      title: "SEO — ให้ Google หาเจอ",
      why: "ลูกค้าส่วนใหญ่เริ่มจากค้น Google เช่น \"เครื่อง pos ร้านอาหาร\" หรือ \"ตู้สั่งอาหาร\" — ติดหน้าแรกคือได้ลูกค้าฟรีทุกวัน",
      checks: [
        { label: "ยืนยันเว็บกับ Google Search Console", state: cleanVerificationToken(settings.googleSiteVerification) ? "ok" : "todo", detail: "จากนั้นส่ง sitemap: " + `${siteConfig.url}/sitemap.xml`, href: "/admin/settings" },
        { label: "ยืนยันเว็บกับ Bing", state: cleanVerificationToken(settings.bingSiteVerification) ? "ok" : "optional", detail: "นำเข้าจาก Search Console ได้ในคลิกเดียว", href: "/admin/settings" },
        { label: "สินค้าแปลครบ 3 ภาษา", state: products.length && fullyTranslated === products.length ? "ok" : "todo", detail: `${fullyTranslated}/${products.length} รุ่นมีชื่อ + highlight ครบ th/en/zh`, href: "/admin/products" },
        { label: "โปรไฟล์โซเชียลอย่างเป็นทางการ ≥ 2", state: sameAs >= 2 ? "ok" : "todo", detail: `${sameAs} ลิงก์ (Facebook, YouTube, TikTok, LINE, Shopee...) — บอก Google ว่าเป็นแบรนด์เดียวกัน`, href: "/admin/settings" },
        { label: "บทความบล็อก ≥ 8", state: blogPosts >= 8 ? "ok" : "todo", detail: `${blogPosts} บทความ — เขียนตอบคำถามที่ลูกค้าค้นจริง ดูแผนเนื้อหา`, href: "/admin/blog" },
        { label: "บทความคลังความรู้ ≥ 10", state: kbArticles >= 10 ? "ok" : "todo", detail: `${kbArticles} บทความ`, href: "/admin/kb-articles" },
      ],
    },
    {
      title: "วัดผล & โฆษณา (Pixel)",
      why: "ต้องติดก่อนเริ่มยิงแอด อย่างน้อย 2–4 สัปดาห์ เพื่อเก็บข้อมูลคนเข้าเว็บไว้ทำ Retargeting และให้ระบบแอดเรียนรู้ว่าใครคือผู้ซื้อ",
      checks: [
        { label: "Google Analytics 4", state: has("ga4Id") || cleanTrackingId("ga4Id", process.env.NEXT_PUBLIC_GA_ID) ? "ok" : "todo", detail: settings.ga4Id || "ยังไม่ได้ใส่", href: "/admin/settings" },
        { label: "Meta (Facebook/Instagram) Pixel", state: has("metaPixelId") ? "ok" : "todo", detail: settings.metaPixelId || "ยังไม่ได้ใส่ — จำเป็นถ้าจะยิงแอด Facebook", href: "/admin/settings" },
        { label: "TikTok Pixel", state: has("tiktokPixelId") ? "ok" : "optional", detail: settings.tiktokPixelId || "ใส่เมื่อเริ่มยิงแอด TikTok", href: "/admin/settings" },
        { label: "LINE Tag", state: has("lineTagId") ? "ok" : "optional", detail: settings.lineTagId || "ใส่เมื่อเริ่มยิง LINE Ads", href: "/admin/settings" },
        { label: "Google Ads conversion", state: has("googleAdsId") && (has("googleAdsLeadLabel") || has("googleAdsPurchaseLabel")) ? "ok" : "optional", detail: settings.googleAdsId || "ใส่เมื่อเริ่มยิง Google Ads", href: "/admin/settings" },
        { label: "ยืนยันโดเมนกับ Facebook", state: cleanVerificationToken(settings.facebookDomainVerification) ? "ok" : "optional", detail: "จำเป็นสำหรับ Conversions ของแอด iOS", href: "/admin/settings" },
      ],
    },
    {
      title: "ช่องทางขาย",
      why: "ให้ลูกค้าซื้อในที่ที่เขาสะดวก: เว็บเราเอง (ไม่เสียค่าธรรมเนียม) + Shopee/Lazada (คนค้นหาสินค้าในแอปโดยตรง)",
      checks: [
        {
          label: "แจ้งเตือนทีมขายทันที (LINE / อีเมล)",
          state: notify.line || notify.email ? "ok" : "todo",
          detail:
            notify.line || notify.email
              ? `เปิดอยู่: ${[notify.line && "LINE", notify.email && "อีเมล"].filter(Boolean).join(" + ")}`
              : "ยังไม่ตั้งค่า — ออเดอร์/ลีดใหม่จะเห็นเฉพาะในหน้า Admin. ตั้งค่า LINE_* หรือ RESEND_* ใน environment ของเซิร์ฟเวอร์ (ดู .env.example)",
          href: "/admin/launch",
        },
        { label: "ร้าน Shopee", state: settings.shopeeShopUrl ? "ok" : "todo", detail: settings.shopeeShopUrl || "ยังไม่ได้ใส่", href: "/admin/settings" },
        { label: "ร้าน Lazada", state: settings.lazadaShopUrl ? "ok" : "todo", detail: settings.lazadaShopUrl || "ยังไม่ได้ใส่", href: "/admin/settings" },
        { label: "เปิดรับออเดอร์บนเว็บ", state: isOnlineOrderingOn(settings) ? "ok" : "todo", detail: isOnlineOrderingOn(settings) ? `เปิดอยู่ · ชำระได้: ${payments.join(", ") || "—"}` : "ปิดอยู่ — ต้องมี PromptPay หรือบัญชีธนาคารก่อน", href: "/admin/settings" },
        { label: "สินค้าที่ขายออนไลน์ได้", state: onlineItems > 0 ? "ok" : "todo", detail: `${onlineItems} รายการมีราคาออนไลน์ (แนะนำเริ่มจากอุปกรณ์เสริม/กระดาษ/เครื่องพิมพ์)`, href: "/admin/accessories" },
        { label: "ลิงก์ Shopee/Lazada ต่อสินค้า", state: marketplaceLinked > 0 ? "ok" : "todo", detail: `${marketplaceLinked} รายการ`, href: "/admin/products" },
        { label: "Product feed (Google Shopping / FB Catalog)", state: feedItems > 0 && isOnlineOrderingOn(settings) ? "ok" : "todo", detail: `${isOnlineOrderingOn(settings) ? feedItems : 0} รายการใน ${siteConfig.url}/feeds/products.xml`, href: "/feeds/products.xml" },
      ],
    },
  ];

  const scored = groups.flatMap((g) => g.checks).filter((c) => c.state !== "optional");
  const done = scored.filter((c) => c.state === "ok").length;

  const manualSteps = [
    { title: "Google Search Console", body: `เพิ่มโดเมน → ยืนยันด้วย meta tag (วางในตั้งค่าเว็บไซต์) → เมนู Sitemaps ส่ง ${siteConfig.url}/sitemap.xml → ใช้ "URL Inspection" ขอ index หน้าสำคัญ`, href: "https://search.google.com/search-console" },
    { title: "Google Business Profile", body: "ลงทะเบียนสำนักงาน/โรงงาน ใส่รูปจริง เวลาทำการ ลิงก์เว็บ และขอรีวิวจากลูกค้าหลังติดตั้งทุกครั้ง — ทำให้ขึ้นใน Google Maps และช่องขวาของผลค้นหา", href: "https://business.google.com" },
    { title: "Google Merchant Center", body: `Products → Add feed → Scheduled fetch ใส่ ${siteConfig.url}/feeds/products.xml (ภาษาไทย, ประเทศไทย) → เปิด Free listings เพื่อขึ้นแท็บ Shopping ฟรี`, href: "https://merchants.google.com" },
    { title: "Meta Commerce Manager", body: `สร้าง Catalog → Data source → Scheduled feed ใส่ URL เดียวกัน → เชื่อม Pixel เพื่อทำ Advantage+ catalog ads (แอดสินค้าที่เคยดู) บน Facebook/Instagram`, href: "https://business.facebook.com/commerce" },
    { title: "Shopee / Lazada", body: "เปิดร้านทางการ (Shopee Mall / LazMall ต้องใช้เอกสารบริษัท+เครื่องหมายการค้า) ตั้งชื่อสินค้าให้ตรงคำค้น แล้วนำลิงก์แต่ละสินค้ามาใส่ในหน้าแก้ไขสินค้า", href: "https://seller.shopee.co.th" },
    { title: "LINE OA", body: "ตั้ง Rich menu: ดูสินค้า (ลิงก์เว็บ) · ขอใบเสนอราคา · แจ้งซ่อม — และตอบแชทภายใน 5 นาทีในเวลาทำการ", href: "https://manager.line.biz" },
    { title: "PageSpeed ก่อนยิงแอด", body: "ทดสอบหน้าแรกและหน้าสินค้าบนมือถือ ต้องได้ Core Web Vitals ผ่าน — แอดจะแพงขึ้นถ้าหน้าโหลดช้า", href: "https://pagespeed.web.dev" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">ความพร้อมเปิดเว็บ</h1>
      <p className="mt-1 text-text-2">
        ตรวจอัตโนมัติจากข้อมูลจริงในระบบ ทุกข้อที่เป็น &quot;ต้องทำ&quot; คลิกไปแก้ได้ทันที
      </p>

      <div className="mt-6 rounded-2xl border border-border p-6">
        <p className="text-sm text-text-2">ความพร้อม</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {done}/{scored.length}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-primary-600" style={{ width: `${pct(done, scored.length)}%` }} />
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <p className="mt-1 text-sm text-text-2">{group.why}</p>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {group.checks.map((check) => (
              <li key={check.label} className="flex items-start gap-4 px-4 py-3">
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    check.state === "ok"
                      ? "bg-success text-white"
                      : check.state === "todo"
                        ? "border-2 border-primary-600"
                        : "border border-border-strong"
                  }`}
                >
                  {check.state === "ok" ? "✓" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {check.label}
                    <span className="sr-only">
                      {check.state === "ok" ? " (เสร็จแล้ว)" : check.state === "todo" ? " (ต้องทำ)" : " (ไม่บังคับ)"}
                    </span>
                    {check.state === "optional" && <span className="ml-2 text-xs font-normal text-text-3">ไม่บังคับ</span>}
                  </p>
                  <p className="break-words text-sm text-text-2">{check.detail}</p>
                </div>
                {check.state !== "ok" && (
                  <Link href={check.href} className="shrink-0 text-sm font-semibold text-primary-700 hover:underline">
                    แก้ไข →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ต้องทำนอกเว็บ (ครั้งเดียว)</h2>
        <p className="mt-1 text-sm text-text-2">ระบบตรวจให้ไม่ได้ ทำตามลำดับหลังเว็บขึ้นโดเมนจริง</p>
        <ol className="mt-4 space-y-3">
          {manualSteps.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-border p-4">
              <p className="font-medium">
                {index + 1}. {step.title}{" "}
                <a href={step.href} target="_blank" rel="noopener noreferrer" className="text-sm font-normal text-primary-700 hover:underline">
                  เปิด ↗
                </a>
              </p>
              <p className="mt-1 text-sm text-text-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
