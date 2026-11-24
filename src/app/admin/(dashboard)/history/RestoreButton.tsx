"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { restoreAuditChange } from "./actions";

const outlineButton =
  "inline-flex items-center gap-1.5 rounded-button border border-border-strong bg-bg px-3.5 py-2 text-sm font-semibold text-text-1 outline-offset-2 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400";

/** "กู้คืนค่าเดิม" with a confirm dialog. Nothing changes until the owner confirms. */
export function RestoreButton({
  auditId,
  changeIndex,
  localeLabel,
  fieldLabel,
  preview,
}: {
  auditId: number;
  changeIndex: number;
  localeLabel: string;
  fieldLabel: string;
  preview: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const shown = preview.length > 140 ? `${preview.slice(0, 140)}...` : preview;

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await restoreAuditChange(auditId, changeIndex);
      if (result === "restored") {
        dialog.current?.close();
        router.replace(`?restored=${encodeURIComponent(localeLabel)}`);
        router.refresh();
      } else {
        setError(result);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className={outlineButton}
        onClick={() => {
          setError(null);
          dialog.current?.showModal();
        }}
      >
        <RotateCcw aria-hidden className="size-4" />
        กู้คืนค่าเดิม
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`restore-title-${auditId}-${changeIndex}`}
        className="m-auto w-full max-w-md rounded-2xl border border-border bg-bg p-6 text-text-1 shadow-xl backdrop:bg-black/40"
      >
        <h2 id={`restore-title-${auditId}-${changeIndex}`} className="flex items-center gap-2 text-lg font-bold">
          <RotateCcw aria-hidden className="size-5 text-primary-600" />
          กู้คืนค่าเดิม{localeLabel}?
        </h2>
        <p className="mt-3 text-sm text-text-2">
          {fieldLabel}จะกลับเป็น &ldquo;{shown}&rdquo; ค่าปัจจุบันยังอยู่ในประวัติ กู้คืนกลับได้อีก
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={outlineButton} onClick={() => dialog.current?.close()} disabled={pending}>
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-button bg-primary-600 px-4 py-2 text-sm font-semibold text-white outline-offset-2 hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-50"
          >
            <RotateCcw aria-hidden className="size-4" />
            {pending ? "กำลังกู้คืน..." : "กู้คืน"}
          </button>
        </div>
      </dialog>
    </>
  );
}
