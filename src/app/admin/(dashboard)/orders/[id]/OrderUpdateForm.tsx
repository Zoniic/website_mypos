"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";

export function OrderUpdateForm({
  action,
  status,
  adminNote,
  options,
}: {
  action: (prev: string | null, formData: FormData) => Promise<string | null>;
  status: string;
  adminNote: string;
  options: { value: string; label: string }[];
}) {
  const [result, formAction, isPending] = useActionState(action, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="space-y-4 rounded-xl border border-border p-4">
      <label className="block">
        <span className="text-sm font-medium text-text-2">สถานะ</span>
        <select
          name="status"
          defaultValue={status}
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-text-2">โน้ตภายใน (ลูกค้าไม่เห็น)</span>
        <textarea
          name="adminNote"
          rows={4}
          defaultValue={adminNote}
          placeholder="เช่น ตรวจสลิปแล้ว / เลขพัสดุ Kerry: ..."
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-button bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "บันทึก"}
      </button>
      {result === "saved" && <p className="text-sm text-success">Saved.</p>}
      {result && result !== "saved" && <p className="text-sm text-error">{result}</p>}
    </form>
  );
}
