"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";

export type UserFormValues = { email: string; name: string; role: "owner" | "editor" };

const emptyValues: UserFormValues = { email: "", name: "", role: "editor" };

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

const ROLE_OPTIONS = [
  { value: "editor", title: "ผู้แก้ไข", hint: "งานประจำวัน ลบและส่งออก CSV ได้" },
  { value: "owner", title: "เจ้าของ", hint: "ทุกอย่าง รวมผู้ดูแล ตั้งค่า และประวัติ" },
] as const;

export function UserForm({
  action,
  initialValues = emptyValues,
  submitLabel,
  isEdit = false,
  actingName,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: UserFormValues;
  submitLabel: string;
  isEdit?: boolean;
  /** Name of the signed-in admin, shown on the password confirmation card (edit only). */
  actingName?: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-xl space-y-6">
      <label className="block">
        <span className={labelClass}>อีเมล</span>
        <input
          name="email"
          type="text"
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={initialValues.email}
          autoComplete="off"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>ชื่อ</span>
        <input name="name" defaultValue={initialValues.name} className={inputClass} />
      </label>
      <fieldset>
        <legend className={labelClass}>บทบาท</legend>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-bg p-3 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-400/40"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={initialValues.role === option.value}
                className="mt-1 accent-[var(--color-primary-600)]"
              />
              <span>
                <span className="block text-sm font-semibold text-text-1">{option.title}</span>
                <span className="block text-xs text-text-2">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className={labelClass}>
          {isEdit ? "รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)" : "รหัสผ่าน"}
        </span>
        <input name="password" type="password" autoComplete="new-password" className={inputClass} />
        <p className="mt-1 text-xs text-text-2">
          อย่างน้อย 8 ตัวอักษร{isEdit ? " เมื่อเปลี่ยน บัญชีนี้จะถูกออกจากระบบทุกเครื่อง" : ""}
        </p>
      </label>
      {isEdit && (
        <div className="rounded-xl border border-warning/35 bg-[#fdf3e3] p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#92400e]">
            <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
            ยืนยันว่าเป็นคุณ
          </p>
          <label className="mt-2 block">
            <span className="text-xs text-[#92400e]">
              รหัสผ่านปัจจุบันของคุณ{actingName ? ` (${actingName})` : ""}
            </span>
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-border-strong bg-bg px-3 py-2 text-sm text-text-1"
            />
          </label>
          <p className="mt-1 text-xs text-[#92400e]">ต้องใส่ทุกครั้งที่เปลี่ยนอีเมล รหัสผ่าน หรือบทบาท</p>
        </div>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
          {error}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
