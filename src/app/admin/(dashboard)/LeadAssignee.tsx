"use client";

import { useActionState } from "react";
import { ChevronDown, User } from "lucide-react";
import type { LeadDetailsState } from "@/lib/leadList";

type DetailsAction = (prev: LeadDetailsState, formData: FormData) => Promise<LeadDetailsState>;

/** Assignee select; saves as soon as it changes (same as the status select). */
export function LeadAssignee({
  assigneeId,
  admins,
  action,
}: {
  assigneeId: number | null;
  admins: { id: number; name: string }[];
  action: DetailsAction;
}) {
  const [state, formAction] = useActionState<LeadDetailsState, FormData>(action, null);
  return (
    <form action={formAction}>
      <div className="relative">
        <User aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
        <select
          name="assigneeId"
          aria-label="ผู้รับผิดชอบ"
          defaultValue={assigneeId === null ? "" : String(assigneeId)}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className={`w-full appearance-none rounded-lg border border-border-strong bg-surface-0 py-1.5 pl-9 pr-9 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40 ${
            assigneeId === null ? "text-text-2" : "text-text-1"
          }`}
        >
          <option value="">ยังไม่มอบหมาย</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
      </div>
      {state && !state.ok && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
