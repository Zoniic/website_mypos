"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";

export type UserFormValues = { email: string; name: string };

const emptyValues: UserFormValues = { email: "", name: "" };

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function UserForm({
  action,
  initialValues = emptyValues,
  submitLabel,
  isEdit = false,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: UserFormValues;
  submitLabel: string;
  isEdit?: boolean;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-xl space-y-6">
      <label className="block">
        <span className={labelClass}>Email</span>
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
        <span className={labelClass}>Name</span>
        <input name="name" defaultValue={initialValues.name} className={inputClass} />
      </label>

      <label className="block">
        <span className={labelClass}>
          Password {isEdit && <span className="text-text-2">(leave blank to keep unchanged)</span>}
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-text-2">At least 8 characters.</p>
      </label>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
