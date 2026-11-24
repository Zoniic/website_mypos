"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { ImageUploadField } from "../ImageUploadField";
import { PdfUploadField } from "../PdfUploadField";
import { FormError } from "../FormError";
import { SeoHint } from "../SeoHint";
import { CategoryCheckboxes } from "../CategoryCheckboxes";

type Locale = "th" | "en" | "zh";

export type AccessoryFormValues = {
  slug: string;
  categories: string[];
  imageUrl: string | null;
  galleryUrls: string[];
  priceFrom: number | null;
  stockStatus: string;
  leadTimeDays: number | null;
  datasheetUrl: string | null;
  videoUrl: string;
  compatibleSlugs: string[];
  onlinePrice: number | null;
  shopeeUrl: string;
  lazadaUrl: string;
  translations: Record<Locale, { name: string; description: string; specs: string }>;
};

const emptyValues: AccessoryFormValues = {
  slug: "",
  categories: [],
  imageUrl: null,
  galleryUrls: [],
  priceFrom: null,
  stockStatus: "in_stock",
  leadTimeDays: null,
  datasheetUrl: null,
  videoUrl: "",
  compatibleSlugs: [],
  onlinePrice: null,
  shopeeUrl: "",
  lazadaUrl: "",
  translations: {
    th: { name: "", description: "", specs: "" },
    en: { name: "", description: "", specs: "" },
    zh: { name: "", description: "", specs: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";
const sectionClass = "space-y-4 rounded-xl border border-border p-4";
const sectionTitleClass = "text-sm font-semibold text-text-1";

const LOCALE_NAMES: Record<Locale, string> = { th: "ภาษาไทย", en: "ภาษาอังกฤษ", zh: "ภาษาจีน" };

export function AccessoryForm({
  action,
  initialValues = emptyValues,
  categoryOptions,
  productOptions = [],
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: AccessoryFormValues;
  categoryOptions?: string[];
  /** Machines the accessory can be marked as working with. */
  productOptions?: { slug: string; name: string }[];
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const compatible = new Set(initialValues.compatibleSlugs);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-3xl space-y-8">
      <label className="block">
        <span className={labelClass}>Slug (unique identifier)</span>
        <input name="slug" required defaultValue={initialValues.slug} className={inputClass} />
        <SeoHint type="slug" />
      </label>

      <CategoryCheckboxes
        name="categories"
        label="Applies to categories (which POS types this accessory suits)"
        options={categoryOptions}
        defaultValue={initialValues.categories}
      />

      <ImageUploadField
        name="image"
        label="Photo"
        currentUrl={initialValues.imageUrl}
        ratio="1/1"
        specHint="สี่เหลี่ยมจัตุรัส อย่างน้อย 800×800px พื้นขาวดีที่สุด · JPG, PNG หรือ WebP ไม่เกิน 5 MB"
      />
      <SeoHint type="altText" />

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>ราคาและสต็อก</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>ราคาเริ่มต้น (บาท) ว่าง = สอบถามราคา</span>
            <input
              name="priceFrom"
              type="number"
              min={1}
              defaultValue={initialValues.priceFrom ?? undefined}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>สถานะสต็อก</span>
            <select name="stockStatus" defaultValue={initialValues.stockStatus} className={inputClass}>
              <option value="in_stock">มีสินค้าพร้อมส่ง</option>
              <option value="preorder">สินค้าพรีออเดอร์</option>
              <option value="out_of_stock">สินค้าหมดชั่วคราว</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>ระยะเวลารอสินค้า (วัน)</span>
            <input
              name="leadTimeDays"
              type="number"
              min={1}
              defaultValue={initialValues.leadTimeDays ?? undefined}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>รูปเพิ่มเติมและเอกสาร</h3>
        <p className="text-xs text-text-2">รูปเพิ่ม 3 รูป · PDF สเปก · ลิงก์วิดีโอ YouTube ไม่ใส่ก็ได้</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <ImageUploadField
              key={index}
              name={`galleryImage${index + 1}`}
              label={`รูปที่ ${index + 2}`}
              currentUrl={initialValues.galleryUrls[index]}
              ratio="1/1"
              specHint="เหมือนรูปหลัก ไม่ใส่ก็ได้"
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <PdfUploadField
            name="datasheet"
            label="เอกสารสเปก (PDF)"
            currentUrl={initialValues.datasheetUrl}
            specHint="ไฟล์ PDF ไม่เกิน 20 MB ไม่ใส่ก็ได้"
          />
          <label className="block">
            <span className={labelClass}>ลิงก์วิดีโอ</span>
            <input
              name="videoUrl"
              placeholder="https://youtube.com/..."
              defaultValue={initialValues.videoUrl}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>ใช้ได้กับเครื่องรุ่น</h3>
        <p className="text-xs text-text-2">
          ติ๊กเลือก แสดงในหน้าอุปกรณ์ และในหน้าเครื่องรุ่นนั้นด้วย (อุปกรณ์เสริมที่ใช้ได้) อุปกรณ์ที่ใช้คู่กันคำนวณจากหมวดเดียวกัน
        </p>
        {productOptions.length === 0 ? (
          <p className="text-sm text-text-2">ยังไม่มีเครื่อง</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {productOptions.map((option) => (
              <label
                key={option.slug}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm text-text-1 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-400/10"
              >
                <input
                  type="checkbox"
                  name="compatibleSlugs"
                  value={option.slug}
                  defaultChecked={compatible.has(option.slug)}
                  className="h-4 w-4 rounded outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                />
                {option.name}
              </label>
            ))}
          </div>
        )}
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-semibold uppercase text-text-2">Online sales</h3>
        <p className="text-xs text-text-2">
          Consumables and add-ons (paper rolls, printers, cash drawers) sell best online. With a price set, the
          accessory page shows it with &quot;Add to cart&quot; when online ordering is on.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Online price (THB, incl. VAT)</span>
            <input name="onlinePrice" type="number" min={1} defaultValue={initialValues.onlinePrice ?? undefined} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Shopee listing URL</span>
            <input name="shopeeUrl" defaultValue={initialValues.shopeeUrl} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Lazada listing URL</span>
            <input name="lazadaUrl" defaultValue={initialValues.lazadaUrl} className={inputClass} />
          </label>
        </div>
      </section>

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                name={`name_${locale}`}
                required={locale === "th"}
                defaultValue={initialValues.translations[locale].name}
                className={inputClass}
              />
              {locale === "en" && <SeoHint type="name" />}
            </label>
            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                name={`description_${locale}`}
                defaultValue={initialValues.translations[locale].description}
                rows={3}
                className={inputClass}
              />
              {locale === "en" && <SeoHint type="description" />}
            </label>
            <label className="block">
              <span className={labelClass}>สเปก ({LOCALE_NAMES[locale]})</span>
              <textarea
                name={`specs_${locale}`}
                defaultValue={initialValues.translations[locale].specs}
                rows={5}
                placeholder={"ประเภท: เครื่องพิมพ์ความร้อน\nหน้ากว้างกระดาษ: 80 mm"}
                className={`${inputClass} font-mono`}
              />
              <span className="mt-1 block text-xs text-text-2">
                พิมพ์บรรทัดละ 1 ข้อ รูปแบบ ชื่อ: ค่า หน้าเว็บแสดงเป็นตารางสเปกเหมือนหน้าสินค้า
              </span>
            </label>
          </div>
        </section>
      ))}

      {error && <FormError>{error}</FormError>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
