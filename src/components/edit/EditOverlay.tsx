"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getContentRow, saveContentRow, saveSectionLayout, uploadSlotImage, type ContentRow } from "@/lib/editActions";
import { ListField, parseList } from "@/app/admin/(dashboard)/content/ListField";
import { ContentGuidePanel, getContentGuide } from "@/app/admin/(dashboard)/content/ContentGuidePanel";

/**
 * Edit-on-site mode (admins only, loaded lazily): click text, a photo, a
 * product/article card or a section toolbar on the real page to edit it.
 * Copy carries invisible row markers (lib/editMode); sections, photos and
 * cards carry data-edit-* attributes.
 */

const MARK = /⁣([​‌‍⁠]+)⁤/g;
const DIGIT: Record<string, string> = { "​": "0", "‌": "1", "‍": "2", "⁠": "3" };
const decode = (digits: string) => parseInt([...digits].map((d) => DIGIT[d]).join(""), 4);

const LOCALES = ["th", "en", "zh"] as const;
type Locale = (typeof LOCALES)[number];

type LayoutItem = { id: string; visible: boolean };
type LayoutInfo = {
  page: string;
  variant: string | null;
  hasOwn: boolean;
  items: LayoutItem[];
  labels: Record<string, { label: string; locked: boolean }>;
};

type Panel =
  | { kind: "text"; ids: number[] }
  | { kind: "image"; slot: string; preview: string | null }
  | null;

/** Marks every element whose text carries a copy marker with data-edit-ids. */
function tagCopy() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue ?? "";
    if (!text.includes("⁣")) continue;
    const el = node.parentElement;
    if (!el || el.closest("[data-edit-ui]")) continue;
    const ids = [...text.matchAll(MARK)].map((m) => String(decode(m[1])));
    const existing = el.dataset.editIds ? el.dataset.editIds.split(",") : [];
    const merged = [...new Set([...existing, ...ids])].join(",");
    if (merged !== el.dataset.editIds) el.dataset.editIds = merged;
  }
}

function readLayout(): LayoutInfo | null {
  const raw = document.getElementById("edit-layout")?.getAttribute("data-layout");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LayoutInfo;
  } catch {
    return null;
  }
}

const STYLES = `
body.edit-on [data-edit-ids]{cursor:pointer}
body.edit-on [data-edit-ids]:hover{outline:2px dashed #e85520;outline-offset:3px;background:rgba(232,85,32,.07);border-radius:4px}
body.edit-on [data-edit-image]:hover{outline:3px solid #2563eb;outline-offset:-3px;cursor:pointer}
body.edit-on [data-edit-admin]:hover{outline:2px solid #059669;outline-offset:2px;cursor:pointer}
body.edit-on [data-edit-section].edit-hover{box-shadow:inset 0 0 0 2px rgba(37,99,235,.45)}
`;

const btn =
  "rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-40";
const panelInput =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40";

export default function EditOverlay({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(true);
  const [panel, setPanel] = useState<Panel>(null);
  const [layout, setLayout] = useState<LayoutInfo | null>(null);
  const [scope, setScope] = useState<"shared" | "own">("shared");
  const [hover, setHover] = useState<{ id: string; top: number; right: number } | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hoverEl = useRef<HTMLElement | null>(null);

  // Tag copy now and whenever the page re-renders (navigation, refresh after save).
  useEffect(() => {
    // setTimeout, not requestAnimationFrame: rAF doesn't fire in background tabs.
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastLayout: string | null | undefined;
    const run = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        tagCopy();
        // Only when the page's layout data changed — keeps the chosen scope otherwise.
        const raw = document.getElementById("edit-layout")?.getAttribute("data-layout") ?? null;
        if (raw === lastLayout) return;
        lastLayout = raw;
        const next = readLayout();
        setLayout(next);
        if (next) setScope(next.hasOwn ? "own" : "shared");
      }, 60);
    };
    run();
    // Changes inside the overlay itself (toolbar, panel) don't need a rescan.
    const observer = new MutationObserver((records) => {
      if (records.every((r) => (r.target instanceof Element ? r.target : r.target.parentElement)?.closest("[data-edit-ui]"))) return;
      run();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("edit-on", enabled);
    return () => document.body.classList.remove("edit-on");
  }, [enabled]);

  // Clicks on tagged elements open the editor instead of following links/toggles.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!enabled) return;
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-edit-ui]")) return;
      const el = target.closest<HTMLElement>("[data-edit-ids],[data-edit-image],[data-edit-admin]");
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      if (el.dataset.editAdmin) {
        window.open(el.dataset.editAdmin, "_blank", "noopener");
      } else if (el.dataset.editImage) {
        const img = el.tagName === "IMG" ? (el as HTMLImageElement) : el.querySelector("img");
        setPanel({ kind: "image", slot: el.dataset.editImage, preview: img?.currentSrc || null });
      } else if (el.dataset.editIds) {
        setPanel({ kind: "text", ids: el.dataset.editIds.split(",").map(Number) });
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled]);

  // Section toolbar follows the section under the pointer.
  useEffect(() => {
    let frame = 0;
    function onMove(event: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = event.target as HTMLElement | null;
        if (target?.closest("[data-edit-ui]")) return;
        const section = target?.closest<HTMLElement>("[data-edit-section]") ?? null;
        if (hoverEl.current && hoverEl.current !== section) hoverEl.current.classList.remove("edit-hover");
        hoverEl.current = section;
        if (!section || !enabled) return setHover(null);
        section.classList.add("edit-hover");
        const rect = section.getBoundingClientRect();
        setHover({ id: section.dataset.editSection!, top: Math.max(rect.top + 8, 72), right: window.innerWidth - rect.right + 8 });
      });
    }
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  const refresh = useCallback((result: string) => {
    if (result === "saved") {
      setMessage("บันทึกแล้ว");
      router.refresh();
    } else {
      setMessage(result);
    }
  }, [router]);

  function saveLayout(items: LayoutItem[]) {
    if (!layout) return;
    const variant = scope === "own" && layout.variant ? layout.variant : undefined;
    startTransition(async () => refresh(await saveSectionLayout(layout.page, JSON.stringify(items), variant)));
  }

  function moveSection(id: string, delta: -1 | 1) {
    if (!layout) return;
    const items = [...layout.items];
    const from = items.findIndex((i) => i.id === id);
    // Step over hidden sections and never past a locked one (the hero).
    let to = from + delta;
    while (to >= 0 && to < items.length && !items[to].visible) to += delta;
    if (to < 0 || to >= items.length || layout.labels[items[to].id]?.locked) return;
    [items[from], items[to]] = [items[to], items[from]];
    saveLayout(items);
  }

  function setVisible(id: string, visible: boolean) {
    if (!layout) return;
    saveLayout(layout.items.map((i) => (i.id === id ? { ...i, visible } : i)));
  }

  const hidden = layout?.items.filter((i) => !i.visible) ?? [];
  const hoverLabel = hover && layout?.labels[hover.id];
  const exitHref = `/admin/live/exit?path=${encodeURIComponent(pathname)}`;

  return (
    <div data-edit-ui lang="th">
      <style>{STYLES}</style>

      {enabled && hover && hoverLabel && (
        <div
          className="fixed z-[70] flex items-center gap-1 rounded-lg bg-[#111318] p-1 text-xs text-white shadow-lg"
          style={{ top: hover.top, right: hover.right }}
        >
          <span className="px-2 font-semibold">{hoverLabel.label}</span>
          {!hoverLabel.locked && (
            <>
              <button type="button" className={btn} disabled={isPending} onClick={() => moveSection(hover.id, -1)} aria-label="เลื่อนส่วนนี้ขึ้น">↑</button>
              <button type="button" className={btn} disabled={isPending} onClick={() => moveSection(hover.id, 1)} aria-label="เลื่อนส่วนนี้ลง">↓</button>
              <button type="button" className={btn} disabled={isPending} onClick={() => setVisible(hover.id, false)}>ซ่อน</button>
            </>
          )}
        </div>
      )}

      <div className="fixed inset-x-3 bottom-20 z-[70] flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#111318] px-3 py-2 text-xs text-white shadow-2xl lg:inset-x-auto lg:bottom-5 lg:left-1/2 lg:max-w-[calc(100vw-2rem)] lg:-translate-x-1/2">
        <span className="font-semibold">✏️ โหมดแก้ไข</span>
        <button type="button" className={btn} onClick={() => setEnabled(!enabled)}>
          {enabled ? "คลิกเพื่อแก้: เปิด" : "คลิกเพื่อแก้: ปิด (ใช้งานปกติ)"}
        </button>
        {layout?.variant && (
          <select
            className="rounded-lg border border-white/20 bg-[#111318] px-2 py-1.5 text-xs"
            value={scope}
            onChange={(e) => setScope(e.target.value as "shared" | "own")}
            aria-label="จัดส่วนสำหรับ"
          >
            <option value="shared">จัดส่วน: ทุกหน้าแบบนี้</option>
            <option value="own">จัดส่วน: เฉพาะหน้านี้</option>
          </select>
        )}
        {hidden.length > 0 && (
          <div className="relative">
            <button type="button" className={btn} onClick={() => setShowHidden(!showHidden)}>
              ส่วนที่ซ่อน ({hidden.length})
            </button>
            {showHidden && (
              <ul className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-[#111318] p-1 shadow-xl">
                {hidden.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span>{layout?.labels[item.id]?.label ?? item.id}</span>
                    <button type="button" className={btn} disabled={isPending} onClick={() => setVisible(item.id, true)}>แสดง</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <Link href="/admin" className={btn}>หลังบ้าน</Link>
        {/* Route handler that ends draft mode and redirects: needs a full-page request, not a client navigation. */}
        <a href={exitHref} className={btn}>ออกจากโหมดแก้ไข</a>
        {message && <span className={message === "บันทึกแล้ว" ? "text-emerald-300" : "text-red-300"}>{message}</span>}
      </div>

      {panel && (
        <aside className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-lg flex-col border-l border-border bg-bg text-text-1 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-semibold">{panel.kind === "image" ? "เปลี่ยนรูป" : "แก้ข้อความ"}</p>
            <button type="button" className="rounded-lg px-2 py-1 text-text-2 hover:bg-surface-2" onClick={() => setPanel(null)} aria-label="ปิด">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {panel.kind === "text" ? (
              <TextEditor key={panel.ids.join(",")} ids={panel.ids} locale={locale} onSaved={(r) => { refresh(r); if (r === "saved") setPanel(null); }} />
            ) : (
              <ImageEditor key={panel.slot} slot={panel.slot} preview={panel.preview} onSaved={(r) => { refresh(r); if (r === "saved") setPanel(null); }} />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function TextEditor({ ids, locale, onSaved }: { ids: number[]; locale: string; onSaved: (result: string) => void }) {
  const [rows, setRows] = useState<(ContentRow | null)[] | null>(null);
  const [active, setActive] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    Promise.all(ids.map((id) => getContentRow(id))).then((result) => {
      if (!cancelled) setRows(result);
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (!rows) return <p className="text-sm text-text-2">กำลังโหลด...</p>;
  const found = rows.filter((r): r is ContentRow => r !== null);
  if (!found.length) return <p className="text-sm text-text-2">ไม่พบข้อความนี้ในฐานข้อมูล</p>;
  const row = found[Math.min(active, found.length - 1)];
  const lists = Object.fromEntries(LOCALES.map((l) => [l, row.values[l].trim() ? parseList(row.values[l]) : []])) as Record<Locale, ReturnType<typeof parseList>>;
  const isList = LOCALES.some((l) => row.values[l].trim().startsWith("[")) && LOCALES.every((l) => lists[l] !== null);
  const guide = getContentGuide(row.namespace, row.key);
  // Visitor's language first.
  const ordered = [...LOCALES].sort((a, b) => (a === locale ? -1 : b === locale ? 1 : 0));

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(LOCALES.map((l) => [l, String(data.get(`v__${l}`) ?? "")]));
    startTransition(async () => onSaved(await saveContentRow(row.namespace, row.key, values)));
  }

  return (
    <div>
      {found.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {found.map((r, i) => (
            <button
              key={`${r.namespace}.${r.key}`}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-md px-2 py-1 font-mono text-xs ${i === active ? "bg-primary-600 text-white" : "bg-surface-2 text-text-2"}`}
            >
              {r.key}
            </button>
          ))}
        </div>
      )}
      <p className="font-mono text-xs text-text-3">
        {row.namespace} › {row.key}
      </p>
      {guide && <ContentGuidePanel entry={guide} />}
      <form key={`${row.namespace}.${row.key}`} onSubmit={submit} className="mt-3 space-y-3">
        {isList ? (
          <ListField fieldKey="v" values={lists as Record<Locale, NonNullable<ReturnType<typeof parseList>>>} />
        ) : (
          ordered.map((l) => (
            <label key={l} className="block">
              <span className="text-xs font-semibold uppercase text-text-2">{l}</span>
              <textarea name={`v__${l}`} defaultValue={row.values[l]} rows={row.values[l].length > 80 ? 5 : 2} className={panelInput} />
            </label>
          ))
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึก (ขึ้นเว็บทันที)"}
        </button>
      </form>
    </div>
  );
}

function ImageEditor({ slot, preview, onSaved }: { slot: string; preview: string | null; onSaved: (result: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const localPreview = file ? URL.createObjectURL(file) : preview;

  function upload() {
    if (!file) return;
    const data = new FormData();
    data.set("slot", slot);
    data.set("file", file);
    startTransition(async () => onSaved(await uploadSlotImage(data)));
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-text-3">Site Photos › {slot}</p>
      {localPreview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
        <img src={localPreview} alt="" className="max-h-64 w-full rounded-lg border border-border object-contain" />
      ) : (
        <p className="rounded-lg bg-surface-2 p-4 text-sm text-text-2">ยังไม่มีรูป ตอนนี้ใช้ภาพวาดแทน</p>
      )}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
      <p className="text-xs text-text-3">JPG, PNG หรือ WebP ไม่เกิน 5MB · ขนาดและมุมภาพที่แนะนำดูได้ที่หลังบ้าน → Site Photos</p>
      <button
        type="button"
        onClick={upload}
        disabled={!file || isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "กำลังอัปโหลด..." : "อัปโหลดและใช้รูปนี้"}
      </button>
    </div>
  );
}
