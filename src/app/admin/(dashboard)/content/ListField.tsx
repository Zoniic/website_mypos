"use client";

import { useState } from "react";

/**
 * Form editor for Page Content values stored as JSON lists (FAQ, features,
 * steps, specs...). Each item gets its own card instead of raw JSON; a
 * hidden input carries the JSON so the save action is unchanged. "Edit as
 * JSON" stays available for unusual shapes.
 */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Item = Json;

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40";
const iconButton =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-sm text-text-2 hover:bg-surface-2 hover:text-text-1 disabled:opacity-30";

export function parseList(value: string): Item[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? (parsed as Item[]) : null;
  } catch {
    return null;
  }
}

const isPlainObject = (v: unknown): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

/** An empty item shaped like the existing ones. */
function blankLike(sample: Item | undefined): Item {
  if (isPlainObject(sample)) {
    return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, Array.isArray(v) ? [] : typeof v === "number" ? 0 : ""]));
  }
  return "";
}

/** Field names across all items, in first-seen order. */
function fieldNames(items: Item[]): string[] {
  const names: string[] = [];
  for (const item of items) if (isPlainObject(item)) for (const k of Object.keys(item)) if (!names.includes(k)) names.push(k);
  return names;
}

function FieldInput({ name, value, onChange }: { name: string; value: Json | undefined; onChange: (v: Json) => void }) {
  if (isStringArray(value)) {
    return (
      <label className="block">
        <span className="text-xs font-semibold text-text-2">{name} <span className="font-normal text-text-3">(บรรทัดละ 1 รายการ)</span></span>
        <textarea
          className={inputClass}
          rows={Math.max(3, value.length + 1)}
          value={value.join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        />
      </label>
    );
  }
  if (value !== undefined && value !== null && typeof value === "object") {
    return <RawJson label={name} value={value} onChange={onChange} />;
  }
  const text = value === undefined || value === null ? "" : String(value);
  const long = text.length > 60 || /description|answer|body|detail|summary|result|problem|install/i.test(name);
  const commit = (raw: string) => onChange(typeof value === "number" && raw.trim() !== "" && !Number.isNaN(Number(raw)) ? Number(raw) : raw);
  return (
    <label className="block">
      <span className="text-xs font-semibold text-text-2">{name}</span>
      {long ? (
        <textarea className={inputClass} rows={3} value={text} onChange={(e) => commit(e.target.value)} />
      ) : (
        <input className={inputClass} value={text} onChange={(e) => commit(e.target.value)} />
      )}
    </label>
  );
}

function RawJson({ label, value, onChange }: { label: string; value: Json; onChange: (v: Json) => void }) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(false);
  return (
    <label className="block">
      <span className="text-xs font-semibold text-text-2">{label} (JSON)</span>
      <textarea
        className={`${inputClass} font-mono text-xs ${error ? "border-error" : ""}`}
        rows={4}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          try {
            onChange(JSON.parse(e.target.value) as Json);
            setError(false);
          } catch {
            setError(true);
          }
        }}
      />
    </label>
  );
}

/** One locale's list. */
function ListEditor({ items, onChange }: { items: Item[]; onChange: (items: Item[]) => void }) {
  const names = fieldNames(items);
  // Fields holding lists (e.g. "points") start as an empty list on items that lack them.
  const listNames = new Set(names.filter((n) => items.some((x) => isPlainObject(x) && Array.isArray(x[n]))));
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-text-3">ยังไม่มีรายการ</p>}
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-bg p-3">
          <div className="flex items-center gap-1.5">
            <span className="flex-1 text-xs font-semibold text-text-3">รายการที่ {i + 1}</span>
            <button type="button" className={iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`เลื่อนรายการที่ ${i + 1} ขึ้น`}>↑</button>
            <button type="button" className={iconButton} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`เลื่อนรายการที่ ${i + 1} ลง`}>↓</button>
            <button
              type="button"
              className={iconButton}
              onClick={() => confirm(`ลบรายการที่ ${i + 1}?`) && onChange(items.filter((_, j) => j !== i))}
              aria-label={`ลบรายการที่ ${i + 1}`}
            >
              ×
            </button>
          </div>
          <div className="mt-2 grid gap-2">
            {isPlainObject(item) ? (
              names.map((name) => (
                <FieldInput
                  key={name}
                  name={name}
                  value={item[name] ?? (listNames.has(name) ? [] : "")}
                  onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...(x as Record<string, Json>), [name]: v } : x)))}
                />
              ))
            ) : typeof item === "string" ? (
              <textarea className={inputClass} rows={item.length > 60 ? 3 : 1} value={item} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <RawJson label="ค่า" value={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="rounded-button border border-dashed border-primary-600 px-4 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-50"
        onClick={() => onChange([...items, blankLike(items[items.length - 1])])}
      >
        + เพิ่มรายการ
      </button>
    </div>
  );
}

const LOCALES = ["th", "en", "zh"] as const;

/** List field for all three languages, with a tab per language. */
export function ListField({ fieldKey, values }: { fieldKey: string; values: Record<(typeof LOCALES)[number], Item[]> }) {
  const [lists, setLists] = useState(values);
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("th");
  const [raw, setRaw] = useState(false);
  const [rawDraft, setRawDraft] = useState("");
  const [rawError, setRawError] = useState(false);

  function openRaw() {
    setRawDraft(JSON.stringify(lists[locale], null, 2));
    setRawError(false);
    setRaw(true);
  }

  return (
    <div className="mt-2">
      {LOCALES.map((l) => (
        <input key={l} type="hidden" name={`${fieldKey}__${l}`} value={JSON.stringify(lists[l])} />
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-border-strong bg-surface-0 p-1" role="tablist">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={locale === l}
              onClick={() => {
                setLocale(l);
                setRaw(false);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${locale === l ? "bg-[image:var(--gradient-primary)] text-white" : "text-text-2 hover:text-text-1"}`}
            >
              {l} <span className="font-normal opacity-80">({lists[l].length})</span>
            </button>
          ))}
        </div>
        {lists[locale].length !== lists.th.length && (
          <span className="text-xs text-text-3">จำนวนรายการไม่เท่าภาษาไทย ({lists.th.length})</span>
        )}
        <button type="button" onClick={() => (raw ? setRaw(false) : openRaw())} className="ml-auto text-xs text-text-2 underline-offset-4 hover:underline">
          {raw ? "กลับไปแก้แบบฟอร์ม" : "แก้เป็น JSON"}
        </button>
      </div>
      <div className="mt-3">
        {raw ? (
          <>
            <textarea
              className={`${inputClass} font-mono text-xs ${rawError ? "border-error" : ""}`}
              rows={12}
              value={rawDraft}
              onChange={(e) => {
                setRawDraft(e.target.value);
                try {
                  const parsed: unknown = JSON.parse(e.target.value);
                  if (!Array.isArray(parsed)) throw new Error();
                  setLists({ ...lists, [locale]: parsed as Item[] });
                  setRawError(false);
                } catch {
                  setRawError(true);
                }
              }}
            />
            {rawError && <p className="text-xs text-error">JSON ยังไม่ถูกต้อง ระบบจะใช้ค่าล่าสุดที่ถูกต้อง</p>}
          </>
        ) : (
          <ListEditor items={lists[locale]} onChange={(items) => setLists({ ...lists, [locale]: items })} />
        )}
      </div>
    </div>
  );
}
