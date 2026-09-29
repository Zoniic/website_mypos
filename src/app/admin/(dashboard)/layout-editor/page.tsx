import { getTranslations } from "next-intl/server";
import { getCatalog } from "@/lib/catalog";
import { PAGE_LAYOUTS, PAGES_WITH_VARIANTS, getLayoutVariants, getStoredLayout, type PageKey } from "@/lib/pageLayout";
import { LayoutEditor } from "./LayoutEditor";

export default async function AdminLayoutPage() {
  const pages = Object.keys(PAGE_LAYOUTS) as PageKey[];
  const [layouts, variantLayouts] = await Promise.all([
    Promise.all(pages.map((page) => getStoredLayout(page))),
    Promise.all(pages.map((page) => (PAGES_WITH_VARIANTS.includes(page) ? getLayoutVariants(page) : {}))),
  ]);
  const catalog = await getCatalog();
  const tNav = await getTranslations({ locale: "th", namespace: "nav" });
  const tProducts = await getTranslations({ locale: "th", namespace: "productsCommon" });

  // Individual pages that can override their template's layout.
  const variants: Partial<Record<PageKey, { key: string; label: string; path: string }[]>> = {
    solution: catalog.solutions.map((s) => ({
      key: s.slug,
      label: tNav(`solutionsItems.${s.key}`),
      path: `/solutions/${s.slug}`,
    })),
    industry: catalog.businessTypes.map((b) => ({
      key: b.slug,
      label: tProducts(`businessTypes.${b.slug}`),
      path: `/industries/${b.slug}`,
    })),
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">ลำดับส่วนของหน้า</h1>
      <p className="mt-1 text-text-2">
        เลือกว่าหน้าไหนแสดงส่วนอะไร และเรียงลำดับอย่างไร ติ๊กออกเพื่อซ่อน กดลูกศรเพื่อเลื่อน แล้วกดบันทึก
        ข้อความในแต่ละส่วนแก้ได้ที่ &quot;ข้อความทุกหน้า&quot; ส่วนรูปแก้ได้ที่ &quot;รูปภาพและโลโก้&quot;
      </p>
      <p className="mt-2 text-sm text-text-3">
        ส่วนที่มีหมายเหตุ &quot;ซ่อนเอง&quot; จะไม่แสดงถ้ายังไม่มีข้อมูล แม้จะติ๊กไว้ · หน้าโซลูชันและหน้าประเภทธุรกิจ
        ตั้งค่าให้ทุกหน้าพร้อมกัน หรือเลือก &quot;เฉพาะ...&quot; เพื่อจัดหน้าเดียวให้ต่างจากหน้าอื่น
      </p>
      <div className="mt-6 space-y-6">
        {pages.map((page, index) => (
          <LayoutEditor
            key={page}
            page={page}
            label={PAGE_LAYOUTS[page].label}
            path={PAGE_LAYOUTS[page].path}
            sections={PAGE_LAYOUTS[page].sections}
            initial={layouts[index]}
            variants={variants[page]}
            variantLayouts={variantLayouts[index]}
          />
        ))}
      </div>
    </div>
  );
}
