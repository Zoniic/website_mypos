"use client";

import { useState, useTransition } from "react";
import type { LayoutSection, StoredSection } from "@/lib/pageLayout";
import { resetPageLayout, savePageLayout } from "./actions";

const primaryButton =
  "rounded-button bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-50";
const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-2 outline-offset-2 hover:bg-surface-0 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-30";

type Props = {
  page: string;
  label: string;
  /** Site path of the page (or template), without the locale. */
  path: string;
  sections: LayoutSection[];
  initial: StoredSection[];
  /** Individual pages of this template that can have their own layout. */
  variants?: { key: string; label: string; path: string }[];
  /** Layouts already saved for individual pages, by slug. */
  variantLayouts?: Record<string, StoredSection[]>;
};

export function LayoutEditor({ page, label, path, sections, initial, variants = [], variantLayouts = {} }: Props) {
  const defs = new Map(sections.map((s) => [s.id, s]));
  const [shared, setShared] = useState(initial);
  const [own, setOwn] = useState(variantLayouts);
  const [variant, setVariant] = useState("");
  const [items, setItems] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasOwn = variant !== "" && variant in own;
  const previewHref = `/th${variant ? variants.find((v) => v.key === variant)?.path ?? path : path === "/" ? "" : path}`;

  function pick(next: string) {
    setVariant(next);
    setItems(next === "" ? shared : own[next] ?? shared);
    setStatus(null);
  }
  const firstMovable = items.findIndex((s) => !defs.get(s.id)?.locked);

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < firstMovable || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setStatus(null);
  }

  function toggle(index: number) {
    setItems(items.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s)));
    setStatus(null);
  }

  function save() {
    startTransition(async () => {
      const result = await savePageLayout(page, JSON.stringify(items), variant || undefined);
      if (result === "saved") {
        if (variant) setOwn({ ...own, [variant]: items });
        else setShared(items);
      }
      setStatus(result);
    });
  }

  function reset() {
    const question = variant
      ? "ลบการตั้งค่าเฉพาะหน้านี้ ให้กลับไปใช้แบบเดียวกับทุกหน้า?"
      : "คืนค่าลำดับและการแสดงผลเริ่มต้น (ใช้กับทุกหน้าที่ไม่ได้ตั้งค่าเฉพาะ)?";
    if (!confirm(question)) return;
    startTransition(async () => {
      const result = await resetPageLayout(page, variant || undefined);
      if (result === "saved") {
        if (variant) {
          const rest = { ...own };
          delete rest[variant];
          setOwn(rest);
          setItems(shared);
        } else {
          const defaults = sections.map((s) => ({ id: s.id, visible: true }));
          setShared(defaults);
          setItems(defaults);
        }
      }
      setStatus(result);
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{label}</h2>
        {variants.length > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-text-2">ตั้งค่าให้</span>
            <select className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm" value={variant} onChange={(e) => pick(e.target.value)}>
              <option value="">ทุกหน้า (ค่าหลัก)</option>
              {variants.map((v) => (
                <option key={v.key} value={v.key}>
                  เฉพาะ {v.label}
                  {v.key in own ? " ✓" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <a href={previewHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-700 hover:underline">
          ดูหน้าจริง ↗
        </a>
      </div>
      {variant && (
        <p className="mt-2 rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-2">
          {hasOwn
            ? "หน้านี้ใช้ลำดับของตัวเอง ไม่เปลี่ยนตามค่าหลัก"
            : "หน้านี้ใช้ค่าหลักอยู่ แก้แล้วกดบันทึก จะกลายเป็นลำดับเฉพาะของหน้านี้"}
        </p>
      )}
      <ol className="mt-3 divide-y divide-border rounded-lg border border-border">
        {items.map((item, index) => {
          const def = defs.get(item.id);
          if (!def) return null;
          return (
            <li key={item.id} className={`flex items-center gap-3 px-3 py-2 ${item.visible ? "" : "bg-surface-0"}`}>
              <span className="w-6 text-right text-sm tabular-nums text-text-3">{index + 1}</span>
              <label className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={item.visible}
                  disabled={def.locked}
                  onChange={() => toggle(index)}
                />
                <span className={item.visible ? "text-text-1" : "text-text-3 line-through"}>{def.label}</span>
                {def.locked && <span className="text-xs text-text-3">(แสดงเสมอ)</span>}
                {def.note && !def.locked && <span className="hidden text-xs text-text-3 sm:inline">· {def.note}</span>}
              </label>
              {!def.locked && (
                <div className="flex gap-1">
                  <button type="button" className={iconButton} onClick={() => move(index, -1)} disabled={index <= firstMovable} aria-label={`เลื่อน ${def.label} ขึ้น`}>
                    ↑
                  </button>
                  <button type="button" className={iconButton} onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`เลื่อน ${def.label} ลง`}>
                    ↓
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className={primaryButton} onClick={save} disabled={isPending}>
          {isPending ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {(!variant || hasOwn) && (
          <button type="button" className="text-sm text-text-2 underline-offset-4 hover:underline" onClick={reset} disabled={isPending}>
            {variant ? "กลับไปใช้ค่าหลัก" : "คืนค่าเริ่มต้น"}
          </button>
        )}
        {status === "saved" && <p className="text-sm text-success">บันทึกแล้ว เว็บอัปเดตทันที</p>}
        {status && status !== "saved" && <p className="text-sm text-error">{status}</p>}
      </div>
    </section>
  );
}
