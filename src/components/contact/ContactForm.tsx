"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { submitContactMessage, type ContactFormState } from "@/app/[locale]/contact/actions";
import { submitWithoutReset } from "@/lib/submitWithoutReset";

export function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") ?? "";
  const messageParam = searchParams.get("message") ?? "";
  const industryParam = searchParams.get("industry") ?? "";
  const topics = t.raw("topics") as Record<string, string>;
  const topicParam = searchParams.get("topic") ?? "";
  const defaultTopic = Object.hasOwn(topics, topicParam)
    ? topicParam
    : productParam
      ? "quote"
      : "general";
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(submitContactMessage, {
    status: "idle",
  });
  const handleSubmit = submitWithoutReset(formAction);
  const status = isPending ? "submitting" : state.status;

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
      <input type="hidden" name="industry" value={industryParam} />
      <div>
        <label htmlFor="contact-topic" className="text-sm font-medium text-text-2">
          {t("formTopic")}
        </label>
        <select
          id="contact-topic"
          name="topic"
          defaultValue={defaultTopic}
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          {Object.entries(topics).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-name" className="text-sm font-medium text-text-2">
          {t("formName")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
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
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
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
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
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
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 text-base font-semibold text-white shadow-[var(--shadow-glow-primary)] transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
