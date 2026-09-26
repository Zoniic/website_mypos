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
  previewHref: string;
  sections: LayoutSection[];
  initial: StoredSection[];
};

export function LayoutEditor({ page, label, previewHref, sections, initial }: Props) {
  const defs = new Map(sections.map((s) => [s.id, s]));
  const [items, setItems] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
    startTransition(async () => setStatus(await savePageLayout(page, JSON.stringify(items))));
  }

  function reset() {
    if (!confirm("คืนค่าลำดับและการแสดงผลเริ่มต้นของหน้านี้?")) return;
    startTransition(async () => {
      const result = await resetPageLayout(page);
      if (result === "saved") setItems(sections.map((s) => ({ id: s.id, visible: true })));
      setStatus(result);
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{label}</h2>
        <a href={previewHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-700 hover:underline">
          ดูหน้าจริง ↗
        </a>
      </div>
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
        <button type="button" className="text-sm text-text-2 underline-offset-4 hover:underline" onClick={reset} disabled={isPending}>
          คืนค่าเริ่มต้น
        </button>
        {status === "saved" && <p className="text-sm text-success">บันทึกแล้ว เว็บอัปเดตทันที</p>}
        {status && status !== "saved" && <p className="text-sm text-error">{status}</p>}
      </div>
    </section>
  );
}
