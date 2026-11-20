import {
  Award,
  BookOpen,
  Briefcase,
  CircleCheck,
  Compass,
  FileText,
  Folder,
  Handshake,
  House,
  Image,
  KeyRound,
  Layers,
  Mail,
  Menu,
  MessageSquare,
  Package,
  Pencil,
  PenLine,
  Rows3,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Type,
  Wrench,
  type LucideIcon,
} from "lucide-react";
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

/** Sidebar and dashboard icons, all from Lucide (DESIGN.md §10). */
export const ADMIN_ICONS = {
  home: House,
  check: CircleCheck,
  compass: Compass,
  cart: ShoppingCart,
  file: FileText,
  chat: MessageSquare,
  wrench: Wrench,
  mail: Mail,
  box: Package,
  tag: Tag,
  layers: Layers,
  pencil: Pencil,
  type: Type,
  image: Image,
  rows: Rows3,
  menu: Menu,
  award: Award,
  pen: PenLine,
  book: BookOpen,
  folder: Folder,
  star: Star,
  handshake: Handshake,
  briefcase: Briefcase,
  settings: Settings,
  key: KeyRound,
} as const satisfies Record<string, LucideIcon>;

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
