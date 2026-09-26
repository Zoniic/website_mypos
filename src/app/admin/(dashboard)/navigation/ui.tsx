"use client";

export const primaryButton =
  "rounded-button bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-50";
export const iconButton =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-2 outline-offset-2 hover:bg-surface-0 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-30";
export const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400";

export function SaveBar({
  onSave,
  onReset,
  isPending,
  status,
}: {
  onSave: () => void;
  onReset: () => void;
  isPending: boolean;
  status: string | null;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" className={primaryButton} onClick={onSave} disabled={isPending}>
        {isPending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
      <button type="button" className="text-sm text-text-2 underline-offset-4 hover:underline" onClick={onReset} disabled={isPending}>
        คืนค่าเริ่มต้น
      </button>
      {status === "saved" && <p className="text-sm text-success">บันทึกแล้ว เว็บอัปเดตทันที</p>}
      {status && status !== "saved" && <p className="whitespace-pre-line text-sm text-error">{status}</p>}
    </div>
  );
}
