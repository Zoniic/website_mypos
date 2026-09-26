import { getTranslations } from "next-intl/server";
import { BUSINESS_ICONS, MACHINE_KINDS, SOLUTION_GROUPS, getCatalog } from "@/lib/catalog";
import { BusinessTypesCatalog, SolutionsCatalog } from "./CatalogEditor";

const MACHINE_LABELS: Record<string, string> = {
  kiosk: "ตู้สั่งอาหาร",
  pos: "เครื่อง POS",
  kds: "จอ KDS",
  scale: "เครื่องชั่ง",
  queue: "จอเรียกคิว",
  vending: "ตู้ Vending",
  ticket: "ตู้ขายตั๋ว",
};

export default async function AdminCatalogPage() {
  const catalog = await getCatalog();
  const tNav = await getTranslations({ locale: "th", namespace: "nav" });
  const tProducts = await getTranslations({ locale: "th", namespace: "productsCommon" });
  const typeLabel = (slug: string) => (tProducts.has(`businessTypes.${slug}`) ? tProducts(`businessTypes.${slug}`) : slug);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Catalog</h1>
      <p className="mt-1 text-text-2">
        เพิ่มสายสินค้าใหม่หรือประเภทธุรกิจใหม่ได้เอง ระบบจะสร้างหน้า 3 ภาษาโดยคัดลอกข้อความจากหน้าต้นแบบ
        แล้วเก็บเป็นฉบับร่างจนกว่าจะกดเผยแพร่ ของที่มีอยู่ในระบบแล้วลบไม่ได้ แต่ซ่อนจากเมนูได้ที่ Navigation
      </p>
      <div className="mt-6 space-y-6">
        <SolutionsCatalog
          rows={catalog.solutions.map((s) => ({
            slug: s.slug,
            key: s.key,
            name: tNav.has(`solutionsItems.${s.key}`) ? tNav(`solutionsItems.${s.key}`) : s.slug,
            machine: s.machine,
            group: s.group,
            builtIn: s.builtIn,
            published: s.published,
          }))}
          machines={MACHINE_KINDS.map((m) => ({ value: m, label: MACHINE_LABELS[m] ?? m }))}
          groups={SOLUTION_GROUPS.map((g) => ({ value: g, label: tNav(`solutionsGroups.${g}`) }))}
        />
        <BusinessTypesCatalog
          rows={catalog.businessTypes.map((b) => ({
            slug: b.slug,
            name: typeLabel(b.slug),
            icon: b.icon,
            builtIn: b.builtIn,
            published: b.published,
          }))}
          icons={BUSINESS_ICONS.map((i) => ({ value: i, label: i === "generic" ? "ร้านค้าทั่วไป" : `แบบ ${typeLabel(i)}` }))}
        />
      </div>
    </div>
  );
}
