"use client";

import { useState, useTransition } from "react";
import { ChevronDown, History, RotateCcw } from "lucide-react";
import { getFieldHistory, type FieldHistory as FieldHistoryData } from "../history/actions";

const LOCALES = ["th", "en", "zh"] as const;
const LOCALE_NAMES: Record<(typeof LOCALES)[number], string> = { th: "ภาษาไทย", en: "ภาษาอังกฤษ", zh: "ภาษาจีน" };

const dateFormat = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Bangkok",
});

/**
 * "ประวัติ (n)" for one Page Content field (owners only). It lists the old
 * values per language. "ใช้ค่านี้" only puts the value into the field above:
 * nothing is saved until the admin presses the form's save button.
 */
export function FieldHistory({
  namespace,
  fieldKey,
  count,
  onUse,
}: {
  namespace: string;
  fieldKey: string;
  count: number;
  onUse: (locale: (typeof LOCALES)[number], value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<FieldHistoryData | null>(null);
  const [failed, setFailed] = useState(false);
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("th");
  const [used, setUsed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setFailed(false);
      startTransition(async () => {
        try {
          const result = await getFieldHistory(namespace, fieldKey);
          setData(result);
          setFailed(result === null);
        } catch {
          setFailed(true);
        }
      });
    }
  }

  const versions = data?.[locale] ?? [];
  const panelId = `field-history-${namespace}-${fieldKey}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex items-center gap-1.5 rounded-button border border-primary-500/40 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 outline-offset-2 hover:bg-primary-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
      >
        <History aria-hidden className="size-4" />
        ประวัติ ({count})
      </button>
      {open && (
        <div id={panelId} className="mt-3 rounded-xl border border-border bg-surface-0 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-sm font-bold">
              <History aria-hidden className="size-4 text-text-2" />
              ค่าเก่าของช่องนี้ ({LOCALE_NAMES[locale]})
            </p>
            <div className="relative">
              <label htmlFor={`${panelId}-locale`} className="sr-only">
                ภาษา
              </label>
              <select
                id={`${panelId}-locale`}
                value={locale}
                onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
                className="appearance-none rounded-lg border border-border-strong bg-bg py-1.5 pl-3 pr-8 text-sm"
              >
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_NAMES[l]}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-2" />
            </div>
          </div>
          {pending && <p className="mt-3 text-sm text-text-2">กำลังโหลด...</p>}
          {failed && !pending && <p className="mt-3 text-sm text-error">โหลดประวัติไม่สำเร็จ</p>}
          {!pending && !failed && versions.length === 0 && <p className="mt-3 text-sm text-text-2">ยังไม่มีประวัติของภาษานี้</p>}
          <ul className="mt-2 divide-y divide-border">
            {versions.map((v, i) => (
              <li key={`${v.at ?? "x"}-${i}`} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-text-3">
                    {v.current ? "ค่าปัจจุบัน" : v.initial ? "ค่าเริ่มต้น (ก่อนเริ่มเก็บประวัติ)" : null}
                    {!v.current && !v.initial && v.at ? `${dateFormat.format(new Date(v.at))}${v.by ? ` · ${v.by}` : ""}` : null}
                    {v.current && v.at ? ` · ${dateFormat.format(new Date(v.at))}${v.by ? ` · ${v.by}` : ""}` : null}
                  </p>
                  <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap break-words text-sm text-text-1">{v.value || "(ว่าง)"}</p>
                </div>
                {v.current ? (
                  <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success-strong">ค่าปัจจุบัน</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onUse(locale, v.value);
                      setUsed(locale);
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-button border border-border-strong bg-bg px-3 py-1.5 text-sm font-semibold text-text-1 hover:bg-surface-2"
                  >
                    <RotateCcw aria-hidden className="size-4" />
                    ใช้ค่านี้
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-text-2" role="status">
            {used
              ? `ใส่ค่าลงในช่อง${LOCALE_NAMES[used as (typeof LOCALES)[number]]}แล้ว ยังไม่ได้บันทึก กดบันทึกทั้งหมดด้านล่างเมื่อพร้อม`
              : "กด ใช้ค่านี้ แล้วค่าจะลงในช่องด้านบน ยังไม่บันทึกจนกว่าจะกดบันทึก"}
          </p>
        </div>
      )}
    </div>
  );
}
