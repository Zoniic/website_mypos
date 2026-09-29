"use client";

import { useState, useTransition } from "react";
import { resetStructure, saveIndustrySolutions, saveOnlineSolutions } from "./actions";
import { SaveBar, iconButton } from "./ui";

type Option = { key: string; label: string };

export function IndustrySolutionsEditor({
  industries,
  solutions,
  initial,
  defaults,
}: {
  industries: Option[];
  solutions: Option[];
  initial: Record<string, string[]>;
  defaults: Record<string, string[]>;
}) {
  const [map, setMap] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const label = new Map(solutions.map((s) => [s.key, s.label]));

  function set(type: string, list: string[]) {
    setMap({ ...map, [type]: list });
    setStatus(null);
  }

  function move(type: string, i: number, delta: number) {
    const list = [...(map[type] ?? [])];
    const target = i + delta;
    if (target < 0 || target >= list.length) return;
    [list[i], list[target]] = [list[target], list[i]];
    set(type, list);
  }

  function save() {
    startTransition(async () => setStatus(await saveIndustrySolutions(JSON.stringify(map))));
  }

  function reset() {
    if (!confirm("คืนค่าเริ่มต้นของระบบที่แนะนำทุกประเภทธุรกิจ?")) return;
    startTransition(async () => {
      const result = await resetStructure("map.industrySolutions");
      if (result === "saved") setMap(defaults);
      setStatus(result);
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">ระบบที่แนะนำ ในหน้าประเภทธุรกิจ</h2>
      <p className="mt-1 text-sm text-text-2">
        ลำดับแรกคือระบบหลักของธุรกิจนั้น (ใช้เป็นภาพ Hero ถ้ายังไม่มีรูปจริง) คำอธิบายใต้การ์ดแก้ได้ที่ &quot;ข้อความทุกหน้า&quot; → industries
      </p>
      <div className="mt-3 divide-y divide-border rounded-lg border border-border">
        {industries.map((industry) => {
          const list = map[industry.key] ?? [];
          const remaining = solutions.filter((s) => !list.includes(s.key));
          return (
            <div key={industry.key} className="flex flex-col gap-2 px-3 py-3 lg:flex-row lg:items-start">
              <p className="w-40 shrink-0 pt-1.5 text-sm font-semibold">{industry.label}</p>
              <ol className="flex flex-1 flex-wrap gap-2">
                {list.length === 0 && <li className="pt-1.5 text-sm text-text-3">ไม่มี (ส่วนนี้จะไม่แสดง)</li>}
                {list.map((key, i) => (
                  <li key={key} className="flex items-center gap-1 rounded-lg border border-border bg-surface-0 py-1 pl-2.5 pr-1 text-sm">
                    <span className="mr-1 tabular-nums text-text-3">{i + 1}.</span>
                    {label.get(key) ?? key}
                    <button type="button" className={`${iconButton} h-7 w-7`} onClick={() => move(industry.key, i, -1)} disabled={i === 0} aria-label={`เลื่อน ${label.get(key)} ไปก่อน`}>
                      ←
                    </button>
                    <button type="button" className={`${iconButton} h-7 w-7`} onClick={() => move(industry.key, i, 1)} disabled={i === list.length - 1} aria-label={`เลื่อน ${label.get(key)} ไปหลัง`}>
                      →
                    </button>
                    <button type="button" className={`${iconButton} h-7 w-7`} onClick={() => set(industry.key, list.filter((k) => k !== key))} aria-label={`เอา ${label.get(key)} ออก`}>
                      ×
                    </button>
                  </li>
                ))}
                {remaining.length > 0 && (
                  <li>
                    <select
                      className="rounded-lg border border-dashed border-border-strong bg-bg px-2 py-1.5 text-sm text-primary-700"
                      value=""
                      onChange={(e) => e.target.value && set(industry.key, [...list, e.target.value])}
                      aria-label={`เพิ่มระบบให้ ${industry.label}`}
                    >
                      <option value="">+ เพิ่มระบบ</option>
                      {remaining.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </li>
                )}
              </ol>
            </div>
          );
        })}
      </div>
      <SaveBar onSave={save} onReset={reset} isPending={isPending} status={status} />
    </section>
  );
}

export function OnlineSolutionsEditor({
  solutions,
  initial,
  defaults,
}: {
  solutions: Option[];
  initial: string[];
  defaults: string[];
}) {
  const [selected, setSelected] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(key: string) {
    setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
    setStatus(null);
  }

  function save() {
    startTransition(async () => setStatus(await saveOnlineSolutions(JSON.stringify(selected))));
  }

  function reset() {
    if (!confirm("คืนค่าเริ่มต้น?")) return;
    startTransition(async () => {
      const result = await resetStructure("map.onlineSolutions");
      if (result === "saved") setSelected(defaults);
      setStatus(result);
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">ระบบที่จัดการผ่านระบบหลังบ้าน</h2>
      <p className="mt-1 text-sm text-text-2">
        ระบบที่ติ๊กจะแสดงแถบ &quot;จัดการทั้งหมดจากระบบหลังบ้านเดียว&quot; ในหน้าของระบบนั้น
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {solutions.map((s) => (
          <label key={s.key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded" checked={selected.includes(s.key)} onChange={() => toggle(s.key)} />
            {s.label}
          </label>
        ))}
      </div>
      <SaveBar onSave={save} onReset={reset} isPending={isPending} status={status} />
    </section>
  );
}
