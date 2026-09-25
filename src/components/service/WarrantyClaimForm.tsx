"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { submitWarrantyClaim, type WarrantyClaimState } from "@/app/[locale]/service/warrantyActions";

const initialState: WarrantyClaimState = { status: "idle" };

export function WarrantyClaimForm({
  labels,
}: {
  labels: {
    title: string;
    subtitle: string;
    name: string;
    phone: string;
    email: string;
    serialNumber: string;
    issue: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    required: string;
  };
}) {
  const [state, formAction, isPending] = useActionState(submitWarrantyClaim, initialState);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-card border border-success/30 bg-success/10 p-8 text-center"
      >
        <p className="font-semibold text-text-1">{labels.successTitle}</p>
        <p className="mt-2 text-text-2">{labels.successBody}</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface-1 p-6 sm:p-8">
      <h3 className="text-xl font-bold tracking-tight">{labels.title}</h3>
      <p className="mt-2 text-text-2">{labels.subtitle}</p>
      <form onSubmit={submitWithoutReset(formAction)} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-text-2">{labels.name}</span>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-2">{labels.phone}</span>
          <input
            name="phone"
            required
            className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-text-2">{labels.email}</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-text-2">{labels.serialNumber}</span>
          <input
            name="serialNumber"
            className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-text-2">{labels.issue}</span>
          <textarea
            name="issue"
            required
            rows={4}
            className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
          />
        </label>

        {state.status === "error" && (
          <p className="text-sm text-error sm:col-span-2">{labels.required}</p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? labels.submitting : labels.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
