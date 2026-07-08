"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") ?? "";
  const messageParam = searchParams.get("message") ?? "";
  const [status, setStatus] = useState<SubmitStatus>("idle");

  // No backend endpoint exists yet (see README Phase 8) — this only
  // provides real loading/success UI feedback for the interaction itself.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-success/30 bg-success/10 px-4 py-6 text-center text-text-1"
      >
        <p className="font-semibold">{t("formSuccessTitle")}</p>
        <p className="mt-1 text-sm text-text-2">{t("formSuccessBody")}</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="contact-name" className="text-sm font-medium text-text-2">
          {t("formName")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className="text-sm font-medium text-text-2">
          {t("formPhone")}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          required
          className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contact-product" className="text-sm font-medium text-text-2">
          {t("formProduct")}
        </label>
        <input
          id="contact-product"
          name="product"
          type="text"
          defaultValue={productParam}
          className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-text-2">
          {t("formMessage")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          defaultValue={messageParam}
          className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-2 px-6 py-2.5 text-base font-medium text-text-1 transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-text-2 border-t-text-1"
            aria-hidden="true"
          />
        )}
        {status === "submitting" ? t("formSubmitting") : t("formSubmit")}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm text-error">
          {t("formError")}
        </p>
      )}

      <p className="text-xs text-text-2">{t("formNote")}</p>
    </form>
  );
}
