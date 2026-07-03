"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") ?? "";

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => event.preventDefault()}
    >
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
          className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-2 px-6 py-2.5 text-base font-medium text-text-1 transition-colors hover:bg-surface-3"
      >
        {t("formSubmit")}
      </button>

      <p className="text-xs text-text-2">{t("formNote")}</p>
    </form>
  );
}
