import { getTranslations } from "next-intl/server";
import { industrySlugs, industrySolutions as defaultIndustrySolutions } from "@/data/industries";
import { ONLINE_SOLUTIONS, solutionMessageKey, solutionSlugs } from "@/data/solutions";
import {
  MENU_ALLOWS_CUSTOM,
  MENU_DEFAULTS,
  MENU_KEYS,
  getSiteStructure,
  type MenuKey,
  type NavGroup,
} from "@/lib/siteStructure";
import { MenuEditor, type EditorGroup } from "./MenuEditor";
import { IndustrySolutionsEditor, OnlineSolutionsEditor } from "./MappingEditors";

const MENU_INFO: Record<MenuKey, { title: string; help: string }> = {
  "nav.solutions": {
    title: "เมนู \"โซลูชัน\" (Header)",
    help: "เมนูใหญ่ด้านบน แบ่งเป็นกลุ่ม ติ๊กออกเพื่อซ่อน ย้ายกลุ่มได้ หรือเพิ่มลิงก์ใหม่ ชื่อกลุ่มแก้ที่ Page Content → nav",
  },
  "nav.categories": {
    title: "หมวดในเมนู \"สินค้า\" และ \"อุปกรณ์เสริม\"",
    help: "ลำดับหมวดที่แสดงในเมนูสินค้าและอุปกรณ์เสริม",
  },
  "nav.industries": {
    title: "เมนู \"ประเภทธุรกิจ\"",
    help: "ลำดับประเภทธุรกิจในเมนู ซ่อนแล้วหน้านั้นยังเข้าได้จากลิงก์อื่น",
  },
  "nav.resources": {
    title: "เมนู \"ข้อมูล/บริการ\"",
    help: "ลิงก์ในเมนูแหล่งข้อมูล เพิ่มลิงก์ไปบทความหรือเว็บภายนอก (https://) ได้",
  },
  "nav.footer": {
    title: "ลิงก์ท้ายเว็บ (Footer)",
    help: "ลิงก์ 3 กลุ่มท้ายทุกหน้า ย้ายข้ามกลุ่มได้ ชื่อกลุ่มแก้ที่ Page Content → nav",
  },
};

export default async function AdminNavigationPage() {
  const structure = await getSiteStructure();
  const t = await getTranslations({ locale: "th", namespace: "nav" });
  const tp = await getTranslations({ locale: "th", namespace: "productsCommon" });

  const itemLabel = (menu: MenuKey, key: string): string => {
    switch (menu) {
      case "nav.solutions":
        return t(`solutionsItems.${key}`);
      case "nav.categories":
        return tp(`categories.${key}`);
      case "nav.industries":
        return tp(`businessTypes.${key}`);
      default:
        return t(key);
    }
  };
  const groupLabel = (menu: MenuKey, key: string): string =>
    menu === "nav.solutions" ? t(`solutionsGroups.${key}`) : menu === "nav.footer" ? t(key) : "";

  const toEditor = (menu: MenuKey, groups: NavGroup[]): EditorGroup[] =>
    groups.map((g) => ({
      key: g.key,
      label: groupLabel(menu, g.key),
      items: g.items.map((i) => ({ ...i, display: i.label?.th ?? itemLabel(menu, i.key) })),
    }));

  const solutionOptions = solutionSlugs.map((slug) => ({ key: slug, label: t(`solutionsItems.${solutionMessageKey[slug]}`) }));
  const industryOptions = industrySlugs.map((slug) => ({ key: slug, label: tp(`businessTypes.${slug}`) }));

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Navigation</h1>
      <p className="mt-1 text-text-2">
        จัดเมนูบนสุด ลิงก์ท้ายเว็บ และระบบที่แนะนำในแต่ละหน้า กดบันทึกทีละกล่อง เว็บอัปเดตทันที
        ชื่อเมนูที่มีอยู่แล้วแก้ได้ที่ Page Content → nav (ครบ 3 ภาษา)
      </p>
      <div className="mt-6 space-y-6">
        {MENU_KEYS.map((menu) => (
          <MenuEditor
            key={menu}
            menu={menu}
            title={MENU_INFO[menu].title}
            help={MENU_INFO[menu].help}
            allowCustom={MENU_ALLOWS_CUSTOM[menu]}
            initial={toEditor(menu, structure.menus[menu])}
            defaults={toEditor(menu, MENU_DEFAULTS[menu])}
          />
        ))}
        <IndustrySolutionsEditor
          industries={industryOptions}
          solutions={solutionOptions}
          initial={structure.industrySolutions}
          defaults={defaultIndustrySolutions}
        />
        <OnlineSolutionsEditor solutions={solutionOptions} initial={structure.onlineSolutions} defaults={[...ONLINE_SOLUTIONS]} />
      </div>
    </div>
  );
}
