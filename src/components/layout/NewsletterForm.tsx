"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "./newsletterActions";

const initialState: NewsletterState = { status: "idle" };

export function NewsletterForm({
  title,
  placeholder,
  submitLabel,
  successMessage,
  alreadyMessage,
  invalidMessage,
}: {
  title: string;
  placeholder: string;
  submitLabel: string;
  successMessage: string;
  alreadyMessage: string;
  invalidMessage: string;
}) {
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, initialState);

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-1">{title}</h3>
      {state.status === "success" || state.status === "already" ? (
        <p className="mt-3 text-sm text-text-2" role="status">
          {state.status === "success" ? successMessage : alreadyMessage}
        </p>
      ) : (
        <form action={formAction} className="mt-3 flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </form>
      )}
      {state.status === "error" && (
        <p className="mt-2 text-xs text-error">{invalidMessage}</p>
      )}
    </div>
  );
}
