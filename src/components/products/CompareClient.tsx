"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useTranslations, useFormatter } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQuoteCart } from "@/lib/quoteCart";
import { submitQuoteRequest, type SubmitQuoteState } from "@/app/[locale]/compare/actions";

const initialState: SubmitQuoteState = { status: "idle" };

export function CompareClient() {
  const t = useTranslations("compare");
  const format = useFormatter();
  const { items, removeItem, setQuantity, clear } = useQuoteCart();
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initialState);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="mt-10 rounded-lg border border-success/30 bg-success/10 px-6 py-10 text-center"
      >
        <p className="text-lg font-semibold text-text-1">{t("successTitle")}</p>
        <p className="mt-2 text-text-2">{t("successBody")}</p>
        <button
          type="button"
          onClick={clear}
          className="mt-6 text-sm font-semibold text-primary-400 hover:underline"
        >
          {t("backToBrowsing")}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-border-strong p-10 text-center text-text-2">
        <p>{t("empty")}</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-button border border-border-strong px-4 py-2 text-sm font-semibold text-text-1 transition-colors hover:border-primary-400/40 hover:text-primary-400"
        >
          {t("browseProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">{t("product")}</th>
              <th className="px-4 py-3 font-medium">{t("price")}</th>
              <th className="px-4 py-3 font-medium">{t("quantity")}</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.slug}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-2">
                        <Image src={item.imageUrl} alt="" fill className="object-cover" />
                      </span>
                    )}
                    <Link href={`/products/${item.slug}`} className="font-medium text-text-1 hover:underline">
                      {item.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-text-2">
                  {format.number(item.priceFrom, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => setQuantity(item.slug, Number(event.target.value))}
                    className="w-16 rounded-lg border border-border-strong px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="text-sm text-text-2 hover:text-error"
                  >
                    {t("remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-xl">
        <h2 className="text-xl font-bold tracking-tight">{t("formTitle")}</h2>
        <p className="mt-1 text-sm text-text-2">{t("formSubtitle")}</p>
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <div>
            <label htmlFor="quote-name" className="text-sm font-medium text-text-2">
              {t("formName")}
            </label>
            <input
              id="quote-name"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
            />
          </div>
          <div>
            <label htmlFor="quote-company" className="text-sm font-medium text-text-2">
              {t("formCompany")}
            </label>
            <input
              id="quote-company"
              name="company"
              className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-phone" className="text-sm font-medium text-text-2">
                {t("formPhone")}
              </label>
              <input
                id="quote-phone"
                name="phone"
                required
                className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
              />
            </div>
            <div>
              <label htmlFor="quote-email" className="text-sm font-medium text-text-2">
                {t("formEmail")}
              </label>
              <input
                id="quote-email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="quote-message" className="text-sm font-medium text-text-2">
              {t("formMessage")}
            </label>
            <textarea
              id="quote-message"
              name="message"
              rows={3}
              className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
            />
          </div>

          {state.status === "error" && <p className="text-sm text-error">{state.message}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
          >
            {isPending ? t("formSubmitting") : t("formSubmit")}
          </button>
        </form>
      </div>
    </div>
  );
}
