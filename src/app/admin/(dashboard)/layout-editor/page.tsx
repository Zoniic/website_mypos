import { PAGE_LAYOUTS, getStoredLayout, type PageKey } from "@/lib/pageLayout";
import { LayoutEditor } from "./LayoutEditor";

export default async function AdminLayoutPage() {
  const pages = Object.keys(PAGE_LAYOUTS) as PageKey[];
  const layouts = await Promise.all(pages.map((page) => getStoredLayout(page)));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Page Layout</h1>
      <p className="mt-1 text-text-2">
        เลือกว่าหน้าไหนแสดงส่วนอะไร และเรียงลำดับอย่างไร ติ๊กออกเพื่อซ่อน กดลูกศรเพื่อเลื่อน แล้วกดบันทึก
        ข้อความในแต่ละส่วนแก้ได้ที่ Page Content ส่วนรูปแก้ได้ที่ Site Photos
      </p>
      <p className="mt-2 text-sm text-text-3">
        ส่วนที่มีหมายเหตุ &quot;ซ่อนเอง&quot; จะไม่แสดงถ้ายังไม่มีข้อมูล แม้จะติ๊กไว้
      </p>
      <div className="mt-6 space-y-6">
        {pages.map((page, index) => (
          <LayoutEditor
            key={page}
            page={page}
            label={PAGE_LAYOUTS[page].label}
            previewHref={`/th${PAGE_LAYOUTS[page].path === "/" ? "" : PAGE_LAYOUTS[page].path}`}
            sections={PAGE_LAYOUTS[page].sections}
            initial={layouts[index]}
          />
        ))}
      </div>
    </div>
  );
}
