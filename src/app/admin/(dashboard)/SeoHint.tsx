const HINTS = {
  slug: {
    tip: "ส่วนนี้จะกลายเป็นส่วนหนึ่งของ URL หน้าเว็บ ใช้ตัวพิมพ์เล็ก คั่นด้วยขีดกลาง และมีคีย์เวิร์ดที่เกี่ยวข้อง — ห้ามเปลี่ยนหลังจากหน้าเว็บเผยแพร่แล้ว (จะทำให้ลิงก์เดิมเสียและกระทบอันดับการค้นหา)",
    example: "mypos-t2-android-pos  (ไม่ใช่: product1 หรือ MYPOS_T2!!)",
  },
  name: {
    tip: "ช่องนี้จะกลายเป็น alt text ของรูปภาพโดยอัตโนมัติ และใช้เป็นชื่อหน้าเว็บด้วย ให้เขียนแบบที่ลูกค้าจะค้นหาจริง ไม่ใช่ชื่อรหัสภายในบริษัท",
    example: '"เครื่อง POS Android หน้าจอ 15 นิ้ว" (ไม่ใช่: "T2-V3-FINAL")',
  },
  description: {
    tip: "ประโยคแรก 1-2 ประโยคสำคัญที่สุด — ทั้ง search engine และลูกค้าจะอ่านแค่ช่วงต้น ควรระบุการใช้งานจริงหรือประเภทธุรกิจที่เหมาะ",
    example: '"ออกแบบมาสำหรับร้านอาหารที่ต้องการรับออเดอร์หน้าเคาน์เตอร์อย่างรวดเร็ว"',
  },
  metaTitle: {
    tip: "ข้อความนี้จะแสดงเป็นหัวข้อสีน้ำเงินที่คลิกได้ในผลการค้นหาของ Google ควรมีความยาวไม่เกินประมาณ 60 ตัวอักษร ไม่งั้นจะถูกตัด และควรใส่คีย์เวิร์ดสำคัญไว้ข้างหน้า",
    example: '"เครื่อง POS Android สำหรับร้านอาหาร | MYPOS" (~45 ตัวอักษร)',
  },
  metaDescription: {
    tip: "ข้อความนี้จะแสดงเป็นคำอธิบายสีเทาใต้หัวข้อในผลการค้นหา ควรมีความยาว 120-160 ตัวอักษร — สั้นไปจะเสียพื้นที่ ยาวไปจะถูกตัดด้วย '...'",
    example: '"เครื่อง POS Android หน้าจอ 15 นิ้ว ออกแบบสำหรับร้านอาหารไทย ติดตั้งเร็ว รับประกันโดยผู้ผลิต มีให้ทดลองใช้ฟรี"',
  },
  altText: {
    tip: "ใช้อธิบายรูปภาพให้ screen reader และการค้นหารูปภาพเข้าใจ — เนื่องจากระบบนี้สร้าง alt text อัตโนมัติจากช่อง Name ด้านบน จึงควรตั้งชื่อให้สื่อความหมาย ไม่ใช่รหัสสินค้า",
    example: '"ตู้ self-order kiosk ของ MYPOS ในฟู้ดคอร์ท" (ไม่ใช่: "IMG_2024")',
  },
} as const;

export type SeoHintType = keyof typeof HINTS;

export function SeoHint({ type }: { type: SeoHintType }) {
  const { tip, example } = HINTS[type];
  return (
    <p className="mt-1 flex gap-1.5 text-xs text-text-2">
      <span aria-hidden="true">💡</span>
      <span>
        <span className="font-medium text-text-1">เคล็ดลับ SEO:</span> {tip}
        <br />
        <span className="italic">เช่น {example}</span>
      </span>
    </p>
  );
}

/** Live character counter for meta title/description fields, with a color cue when out of the recommended range. */
export function CharCounter({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  const inRange = length >= min && length <= max;
  return (
    <span className={`text-xs ${inRange ? "text-success" : "text-warning"}`}>
      {length}/{max} ตัวอักษร {inRange ? "✓" : length > max ? "(ยาวเกินไป)" : "(สั้นไปหน่อย)"}
    </span>
  );
}
