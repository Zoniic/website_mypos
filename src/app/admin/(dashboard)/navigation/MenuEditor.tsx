"use client";

import { useState, useTransition } from "react";
import { resetStructure, saveMenu } from "./actions";
import { SaveBar, iconButton, inputClass } from "./ui";

type Label = { th?: string; en?: string; zh?: string };
export type EditorItem = { key: string; href: string; hidden?: boolean; label?: Label; display: string };
export type EditorGroup = { key: string; label: string; items: EditorItem[] };

type Props = {
  menu: string;
  title: string;
  help: string;
  allowCustom: boolean;
  initial: EditorGroup[];
  defaults: EditorGroup[];
};

const emptyDraft = { th: "", en: "", zh: "", href: "" };

export function MenuEditor({ menu, title, help, allowCustom, initial, defaults }: Props) {
  const [groups, setGroups] = useState(initial);
  const [draft, setDraft] = useState({ ...emptyDraft, group: initial[0]?.key ?? "main" });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const grouped = groups.length > 1;

  function update(next: EditorGroup[]) {
    setGroups(next);
    setStatus(null);
  }

  function move(g: number, i: number, delta: number) {
    const items = [...groups[g].items];
    const target = i + delta;
    if (target < 0 || target >= items.length) return;
    [items[i], items[target]] = [items[target], items[i]];
    update(groups.map((group, gi) => (gi === g ? { ...group, items } : group)));
  }

  function moveToGroup(g: number, i: number, targetKey: string) {
    const item = groups[g].items[i];
    update(
      groups.map((group, gi) => {
        if (gi === g) return { ...group, items: group.items.filter((_, ii) => ii !== i) };
        if (group.key === targetKey) return { ...group, items: [...group.items, item] };
        return group;
      }),
    );
  }

  function patch(g: number, i: number, change: Partial<EditorItem>) {
    update(
      groups.map((group, gi) =>
        gi === g ? { ...group, items: group.items.map((item, ii) => (ii === i ? { ...item, ...change } : item)) } : group,
      ),
    );
  }

  function remove(g: number, i: number) {
    update(groups.map((group, gi) => (gi === g ? { ...group, items: group.items.filter((_, ii) => ii !== i) } : group)));
  }

  function addCustom() {
    const label: Label = { th: draft.th.trim(), en: draft.en.trim(), zh: draft.zh.trim() };
    if (!label.th || !draft.href.trim()) {
      setStatus("ใส่ชื่อภาษาไทยและลิงก์ก่อนเพิ่ม");
      return;
    }
    const item: EditorItem = { key: `custom-${Date.now().toString(36)}`, href: draft.href.trim(), label, display: label.th };
    update(groups.map((group) => (group.key === draft.group ? { ...group, items: [...group.items, item] } : group)));
    setDraft({ ...emptyDraft, group: draft.group });
  }

  function save() {
    const payload = groups.map((g) => ({
      key: g.key,
      items: g.items.map(({ key, href, hidden, label }) => ({ key, href, hidden, label })),
    }));
    startTransition(async () => setStatus(await saveMenu(menu, JSON.stringify(payload))));
  }

  function reset() {
    if (!confirm(`คืนค่าเริ่มต้นของ "${title}"?`)) return;
    startTransition(async () => {
      const result = await resetStructure(menu);
      if (result === "saved") setGroups(defaults);
      setStatus(result);
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-text-2">{help}</p>
      <div className={`mt-3 grid gap-4 ${grouped ? "lg:grid-cols-2" : ""}`}>
        {groups.map((group, g) => (
          <div key={group.key}>
            {grouped && <p className="mb-1.5 text-sm font-semibold text-text-1">{group.label}</p>}
            <ol className="divide-y divide-border rounded-lg border border-border">
              {group.items.length === 0 && <li className="px-3 py-2 text-sm text-text-3">ไม่มีลิงก์ (กลุ่มนี้จะไม่แสดง)</li>}
              {group.items.map((item, i) => {
                const custom = item.key.startsWith("custom-");
                return (
                  <li key={item.key} className={`space-y-2 px-3 py-2 ${item.hidden ? "bg-surface-0" : ""}`}>
                    <div className="flex items-center gap-2">
                      <label className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded"
                          checked={!item.hidden}
                          onChange={() => patch(g, i, { hidden: !item.hidden })}
                          aria-label={`แสดง ${item.display}`}
                        />
                        <span className={`truncate text-sm ${item.hidden ? "text-text-3 line-through" : "text-text-1"}`}>
                          {item.display}
                        </span>
                        {custom && <span className="shrink-0 rounded bg-primary-50 px-1.5 text-xs text-primary-700">เพิ่มเอง</span>}
                      </label>
                      {grouped && (
                        <select
                          className="rounded-lg border border-border bg-bg px-1.5 py-1 text-xs"
                          value={group.key}
                          onChange={(e) => moveToGroup(g, i, e.target.value)}
                          aria-label={`ย้าย ${item.display} ไปกลุ่ม`}
                        >
                          {groups.map((target) => (
                            <option key={target.key} value={target.key}>
                              {target.label}
                            </option>
                          ))}
                        </select>
                      )}
                      <button type="button" className={iconButton} onClick={() => move(g, i, -1)} disabled={i === 0} aria-label={`เลื่อน ${item.display} ขึ้น`}>
                        ↑
                      </button>
                      <button type="button" className={iconButton} onClick={() => move(g, i, 1)} disabled={i === group.items.length - 1} aria-label={`เลื่อน ${item.display} ลง`}>
                        ↓
                      </button>
                      {custom && (
                        <button type="button" className={iconButton} onClick={() => remove(g, i)} aria-label={`ลบ ${item.display}`}>
                          ×
                        </button>
                      )}
                    </div>
                    {custom && (
                      <div className="grid gap-2 sm:grid-cols-4">
                        {(["th", "en", "zh"] as const).map((l) => (
                          <input
                            key={l}
                            className={inputClass}
                            placeholder={`ชื่อ (${l})`}
                            value={item.label?.[l] ?? ""}
                            onChange={(e) =>
                              patch(g, i, { label: { ...item.label, [l]: e.target.value }, display: l === "th" ? e.target.value : item.display })
                            }
                          />
                        ))}
                        <input className={inputClass} placeholder="/contact หรือ https://..." value={item.href} onChange={(e) => patch(g, i, { href: e.target.value })} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      {allowCustom && (
        <details className="mt-3 rounded-lg border border-dashed border-border-strong p-3">
          <summary className="cursor-pointer text-sm font-semibold text-primary-700">+ เพิ่มลิงก์ใหม่</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input className={inputClass} placeholder="ชื่อภาษาไทย (จำเป็น)" value={draft.th} onChange={(e) => setDraft({ ...draft, th: e.target.value })} />
            <input className={inputClass} placeholder="ลิงก์ เช่น /blog/xxx หรือ https://..." value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} />
            <input className={inputClass} placeholder="English name" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />
            <input className={inputClass} placeholder="中文名称" value={draft.zh} onChange={(e) => setDraft({ ...draft, zh: e.target.value })} />
            {grouped && (
              <select className={inputClass} value={draft.group} onChange={(e) => setDraft({ ...draft, group: e.target.value })}>
                {groups.map((group) => (
                  <option key={group.key} value={group.key}>
                    {group.label}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="rounded-button border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50" onClick={addCustom}>
              เพิ่มลงเมนู
            </button>
          </div>
          <p className="mt-2 text-xs text-text-3">ถ้าไม่ใส่ชื่อภาษาอังกฤษหรือจีน หน้าภาษานั้นจะใช้ชื่อภาษาไทย</p>
        </details>
      )}

      <SaveBar onSave={save} onReset={reset} isPending={isPending} status={status} />
    </section>
  );
}
