"use client";

import { useActionState, useId, useState } from "react";
import { Check, ChevronDown, FileText } from "lucide-react";
import type { LeadDetailsState } from "@/lib/leadList";

// Keep in sync with LEAD_NOTE_MAX in src/lib/leadList.ts (that module imports Prisma, so it cannot be bundled here).
const LEAD_NOTE_MAX = 2000;

type DetailsAction = (prev: LeadDetailsState, formData: FormData) => Promise<LeadDetailsState>;

/** Collapsible internal note. Saves only the note (the assignee is saved by its own select). */
export function LeadNote({ note, action }: { note: string; action: DetailsAction }) {
  const fieldId = useId();
  const [saved, setSaved] = useState(note);
  const [value, setValue] = useState(note);
  const [state, formAction, pending] = useActionState<LeadDetailsState, FormData>(async (prev, formData) => {
    const result = await action(prev, formData);
    if (result?.ok) setSaved(String(formData.get("adminNote") ?? "").trim());
    return result;
  }, null);
  const dirty = value.trim() !== saved.trim();
  const preview = saved.trim().split("\n")[0];

  return (
    <details className="group mt-3 rounded-lg border border-border bg-surface-0 open:border-primary-400">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
        <FileText aria-hidden className="size-4 shrink-0 text-text-2" />
        <span className="shrink-0 text-xs font-semibold text-text-1">บันทึกภายใน</span>
        <span className={`min-w-0 flex-1 truncate group-open:hidden ${preview ? "text-text-1" : "text-text-2"}`}>
          {preview || "เพิ่มบันทึก เช่น ผลการโทร นัดหมาย"}
        </span>
        <span className="hidden flex-1 text-xs text-text-2 group-open:inline">เห็นเฉพาะทีมงาน</span>
        <span className="hidden text-xs text-text-2 group-open:inline">
          {value.length}/{LEAD_NOTE_MAX}
        </span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-text-2 transition-transform group-open:rotate-180" />
      </summary>
      <form action={formAction} className="px-3 pb-3">
        <label htmlFor={fieldId} className="sr-only">
          บันทึกภายใน
        </label>
        <textarea
          id={fieldId}
          name="adminNote"
          rows={3}
          maxLength={LEAD_NOTE_MAX}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="เพิ่มบันทึก เช่น ผลการโทร นัดหมาย"
          className="w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
        <div className="mt-2 flex items-center gap-3 text-xs">
          <button
            type="submit"
            disabled={pending || !dirty}
            className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            บันทึก
          </button>
          {state && !state.ok ? (
            <span role="alert" className="text-red-700">
              {state.error}
            </span>
          ) : dirty ? (
            <span className="text-text-2">ยังไม่ได้บันทึก</span>
          ) : state?.ok ? (
            <span role="status" className="inline-flex items-center gap-1 font-semibold text-green-700">
              <Check aria-hidden className="size-4" />
              บันทึกแล้ว
            </span>
          ) : null}
        </div>
      </form>
    </details>
  );
}
