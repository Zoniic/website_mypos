/**
 * Copy for the accessory detail page, the "accessories for this machine" strip
 * on product pages and the type column of the quote list (namespace
 * "accessoryDetail"). The site reads copy from PageContent; these values are
 * inserted there by prisma/add-accessory-detail-keys.ts (create-only) and are
 * also the fallback while a row is missing, so the pages never show a raw key.
 */
export const ACCESSORY_COPY_NAMESPACE = "accessoryDetail";

export const ACCESSORY_COPY = {
  th: {
    compatibleTitle: "ใช้ได้กับเครื่องรุ่น",
    relatedTitle: "อุปกรณ์ที่ใช้คู่กัน",
    forProductTitle: "อุปกรณ์เสริมที่ใช้กับเครื่องนี้ได้",
    askPrice: "สอบถามราคา",
    typeHeader: "ประเภท",
    kindProduct: "เครื่อง",
    kindAccessory: "อุปกรณ์เสริม",
  },
  en: {
    compatibleTitle: "Works with",
    relatedTitle: "Goes well with",
    forProductTitle: "Accessories for this machine",
    askPrice: "Ask for a price",
    typeHeader: "Type",
    kindProduct: "Machine",
    kindAccessory: "Accessory",
  },
  zh: {
    compatibleTitle: "适用机型",
    relatedTitle: "搭配使用的配件",
    forProductTitle: "适用于本机的配件",
    askPrice: "询价",
    typeHeader: "类型",
    kindProduct: "设备",
    kindAccessory: "配件",
  },
} as const;

export type AccessoryCopyKey = keyof (typeof ACCESSORY_COPY)["th"];

type Translator = { has: (key: string) => boolean; (key: string): string };

/** The PageContent text when it exists, else the built-in text for the locale (Thai when the locale is unknown). */
export function accessoryCopy(t: Translator, locale: string, key: AccessoryCopyKey): string {
  if (t.has(key)) return t(key);
  const table = ACCESSORY_COPY[locale as keyof typeof ACCESSORY_COPY] ?? ACCESSORY_COPY.th;
  return table[key];
}
