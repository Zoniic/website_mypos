/**
 * The admin's information architecture: one list drives the sidebar, the
 * mobile menu, the page heading context and the dashboard shortcuts.
 * Grouped by what the team is doing — answering customers, managing what we
 * sell, changing the website, supporting content, settings.
 */
export type BadgeKey = "orders" | "quotes" | "messages" | "warranty";

export type AdminNavItem = {
  href: string;
  label: string;
  /** One line shown on the dashboard. */
  hint: string;
  icon: keyof typeof ADMIN_ICONS;
  badge?: BadgeKey;
  /** Route handler (edit-on-site): plain link, never prefetched. */
  external?: boolean;
};

export type AdminNavGroup = { title: string; items: AdminNavItem[] };

export const ADMIN_ICONS = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z",
  cart: "M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h4",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  mail: "M4 4h16v16H4zM4 6l8 7 8-7",
  box: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  tag: "M20 12l-8 8-9-9V3h8l9 9zM7 7h.01",
  layers: "M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  pencil: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  type: "M4 7V4h16v3M9 20h6M12 4v16",
  image: "M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  rows: "M3 3h18v6H3zM3 15h18v6H3z",
  menu: "M3 6h18M3 12h18M3 18h12",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 23l5-3 5 3-1.2-9.1",
  pen: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  folder: "M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  star: "M12 2l3 7h7l-5.5 4.5 2 7.5L12 17l-6.5 4 2-7.5L2 9h7z",
  handshake: "M11 17l-1.5-1.5a2.1 2.1 0 0 1 3-3L14 14l4-4M3 10l4-4 4 4M11 6l2-2 6 6-2 2",
  briefcase: "M3 7h18v13H3zM8 7V4h8v3M3 13h18",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
} as const;

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "ภาพรวม",
    items: [
      { href: "/admin", label: "หน้าหลัก", hint: "งานค้างและทางลัด", icon: "home" },
      { href: "/admin/launch", label: "ความพร้อมเปิดเว็บ", hint: "เช็คลิสต์ก่อนยิงโฆษณา", icon: "check" },
      { href: "/admin/playbook", label: "แผนเนื้อหา", hint: "คู่แข่ง และสิ่งที่ต้องทำต่อ", icon: "compass" },
    ],
  },
  {
    title: "ลูกค้าและงานขาย",
    items: [
      { href: "/admin/orders", label: "ออเดอร์", hint: "ตรวจยอดโอนและจัดส่ง", icon: "cart", badge: "orders" },
      { href: "/admin/quote-requests", label: "ขอใบเสนอราคา", hint: "ลูกค้าที่เลือกรุ่นแล้ว", icon: "file", badge: "quotes" },
      { href: "/admin/contact-messages", label: "ข้อความติดต่อ", hint: "นัดสาธิตและคำถาม", icon: "chat", badge: "messages" },
      { href: "/admin/warranty-claims", label: "แจ้งซ่อม / เคลม", hint: "งานบริการหลังการขาย", icon: "wrench", badge: "warranty" },
      { href: "/admin/newsletter", label: "ผู้รับข่าวสาร", hint: "อีเมลที่สมัครรับข่าว", icon: "mail" },
    ],
  },
  {
    title: "สินค้า",
    items: [
      { href: "/admin/products", label: "สินค้า (เครื่อง)", hint: "ราคา สเปก รูป ลิงก์ Shopee/Lazada", icon: "box" },
      { href: "/admin/accessories", label: "อุปกรณ์เสริม", hint: "เครื่องพิมพ์ ลิ้นชัก กระดาษ", icon: "tag" },
      { href: "/admin/catalog", label: "สายสินค้าและประเภทธุรกิจ", hint: "เพิ่มหน้าโซลูชัน / อุตสาหกรรมใหม่", icon: "layers" },
    ],
  },
  {
    title: "หน้าเว็บ",
    items: [
      { href: "/admin/live?path=/th", label: "แก้บนหน้าเว็บ", hint: "คลิกข้อความหรือรูปบนหน้าจริง", icon: "pencil", external: true },
      { href: "/admin/content", label: "ข้อความทุกหน้า", hint: "แก้ข้อความ 3 ภาษาแบบรายการ", icon: "type" },
      { href: "/admin/photos", label: "รูปภาพและโลโก้", hint: "รูปหลักของแต่ละหน้า", icon: "image" },
      { href: "/admin/layout-editor", label: "ลำดับส่วนของหน้า", hint: "ซ่อน / เรียงส่วนต่างๆ", icon: "rows" },
      { href: "/admin/navigation", label: "เมนูและลิงก์", hint: "เมนูบน ท้ายเว็บ ระบบที่แนะนำ", icon: "menu" },
    ],
  },
  {
    title: "เนื้อหาเสริม",
    items: [
      { href: "/admin/references", label: "ผลงานลูกค้า", hint: "เคสจริงพร้อมผลลัพธ์", icon: "award" },
      { href: "/admin/blog", label: "บทความ", hint: "บทความ SEO", icon: "pen" },
      { href: "/admin/kb-articles", label: "คลังความรู้", hint: "คู่มือและคำถามซัพพอร์ต", icon: "book" },
      { href: "/admin/kb-categories", label: "หมวดคลังความรู้", hint: "จัดกลุ่มบทความคลังความรู้", icon: "folder" },
      { href: "/admin/trust-logos", label: "โลโก้ลูกค้า", hint: "แถบโลโก้บนหน้าแรก", icon: "star" },
      { href: "/admin/official-partners", label: "พาร์ทเนอร์", hint: "พาร์ทเนอร์ที่รับรอง", icon: "handshake" },
      { href: "/admin/careers", label: "ร่วมงานกับเรา", hint: "ตำแหน่งงานที่เปิดรับ", icon: "briefcase" },
    ],
  },
  {
    title: "ตั้งค่า",
    items: [
      { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", hint: "ติดต่อ ชำระเงิน Pixel SEO", icon: "settings" },
      { href: "/admin/admin-users", label: "ผู้ดูแลระบบ", hint: "บัญชีทีมงาน", icon: "key" },
    ],
  },
];

/** The nav item a path belongs to (longest matching href). */
export function findNavItem(pathname: string): { group: AdminNavGroup; item: AdminNavItem } | null {
  let best: { group: AdminNavGroup; item: AdminNavItem } | null = null;
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      const base = item.href.split("?")[0];
      const matches = base === "/admin" ? pathname === "/admin" : pathname === base || pathname.startsWith(`${base}/`);
      if (matches && (!best || base.length > best.item.href.split("?")[0].length)) best = { group, item };
    }
  }
  return best;
}
