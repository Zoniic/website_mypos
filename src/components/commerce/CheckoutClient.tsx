"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useShopCart, MAX_QUANTITY } from "@/lib/shopCart";
import { track } from "@/lib/analytics";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { placeOrder, type CheckoutState } from "@/app/[locale]/checkout/actions";
import type { CatalogEntry, PaymentMethod } from "@/lib/orders";

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2.5 text-base text-text-1 focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40 aria-[invalid=true]:border-error";
const labelClass = "text-sm font-medium text-text-2";

export function CheckoutClient({
  locale,
  catalog,
  paymentMethods,
  shippingFee,
  freeShippingMin,
}: {
  locale: string;
  catalog: Record<string, CatalogEntry>;
  paymentMethods: PaymentMethod[];
  shippingFee: number;
  freeShippingMin: number | null;
}) {
  const t = useTranslations("checkout");
  const format = useFormatter();
  const router = useRouter();
  const cart = useShopCart();
  const [state, formAction, isPending] = useActionState<CheckoutState, FormData>(placeOrder, { status: "idle" });
  const [wantsTaxInvoice, setWantsTaxInvoice] = useState(false);
  const [removedNames, setRemovedNames] = useState<string[]>([]);
  const trackedCheckout = useRef(false);

  const baht = (value: number) => format.number(value, { style: "currency", currency: "THB", maximumFractionDigits: 0 });

  // Current price/name from the server; items no longer sold online drop out.
  const lines = useMemo(
    () =>
      cart.items.flatMap((item) => {
        const entry = catalog[`${item.kind}:${item.slug}`];
        return entry ? [{ ...item, name: entry.name, unitPrice: entry.price, imageUrl: entry.imageUrl }] : [];
      }),
    [cart.items, catalog]
  );

  const { hydrated, items, remove } = cart;
  useEffect(() => {
    if (!hydrated) return;
    const gone = items.filter((item) => !catalog[`${item.kind}:${item.slug}`]);
    if (!gone.length) return;
    gone.forEach((item) => remove(item.kind, item.slug));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tell the shopper once which items were dropped
    setRemovedNames(gone.map((item) => item.name));
  }, [hydrated, items, catalog, remove]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const freeShipping = freeShippingMin !== null && subtotal >= freeShippingMin;
  const shipping = freeShipping ? 0 : shippingFee;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!cart.hydrated || trackedCheckout.current || lines.length === 0) return;
    trackedCheckout.current = true;
    track({
      name: "begin_checkout",
      value: total,
      items: lines.map((line) => ({ id: line.slug, name: line.name, price: line.unitPrice, quantity: line.quantity })),
    });
  }, [cart.hydrated, lines, total]);

  useEffect(() => {
    if (state.status !== "success") return;
    cart.clear();
    router.push(`/order/${state.number}?t=${encodeURIComponent(state.token)}`);
    // Only react to the action result; cart/router identities are irrelevant here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const invalid = new Set(state.status === "error" ? state.fields ?? [] : []);
  const aria = (field: string) => (invalid.has(field) ? { "aria-invalid": true as const } : {});

  if (!cart.hydrated) {
    return <div className="mt-8 h-64 animate-pulse rounded-card bg-surface-2" aria-hidden />;
  }

  if (lines.length === 0 && state.status !== "success") {
    return (
      <div className="mt-8 max-w-xl">
        {removedNames.length > 0 && <p className="mb-4 text-sm text-error">{t("removedItems", { names: removedNames.join(", ") })}</p>}
        <p className="text-lg font-semibold">{t("empty")}</p>
        <p className="mt-2 text-text-2">{t("emptyBody")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/products" className="rounded-button bg-primary-600 px-5 py-2.5 font-semibold text-white hover:bg-primary-700">
            {t("browseProducts")}
          </Link>
          <Link href="/accessories" className="rounded-button border border-border-strong px-5 py-2.5 font-semibold text-text-1 hover:bg-surface-2">
            {t("browseAccessories")}
          </Link>
        </div>
      </div>
    );
  }

  const cartPayload = JSON.stringify(lines.map(({ kind, slug, quantity }) => ({ kind, slug, quantity })));

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start" noValidate>
      <input type="hidden" name="cart" value={cartPayload} />
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="space-y-10">
        <fieldset>
          <legend className="font-display text-xl font-semibold">{t("contactTitle")}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>{t("name")}</span>
              <input name="name" autoComplete="name" required className={inputClass} {...aria("name")} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("phone")}</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="08x-xxx-xxxx" className={inputClass} {...aria("phone")} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("email")}</span>
              <input name="email" type="email" autoComplete="email" required className={inputClass} {...aria("email")} />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>{t("address")}</span>
              <textarea name="address" rows={3} autoComplete="street-address" required className={inputClass} {...aria("address")} />
              <span className="mt-1 block text-xs text-text-2">{t("addressHint")}</span>
            </label>
            <label className="block">
              <span className={labelClass}>{t("postcode")}</span>
              <input name="postcode" inputMode="numeric" autoComplete="postal-code" maxLength={5} required className={inputClass} {...aria("postcode")} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="wantsTaxInvoice"
              checked={wantsTaxInvoice}
              onChange={(event) => setWantsTaxInvoice(event.target.checked)}
              className="mt-1 h-4 w-4 rounded"
            />
            <span>
              <span className="font-medium">{t("taxInvoice")}</span>
              <span className="block text-sm text-text-2">{t("taxInvoiceHint")}</span>
            </span>
          </label>
          {wantsTaxInvoice && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelClass}>{t("taxName")}</span>
                <input name="taxName" autoComplete="organization" className={inputClass} {...aria("taxName")} />
              </label>
              <label className="block">
                <span className={labelClass}>{t("taxId")}</span>
                <input name="taxId" inputMode="numeric" maxLength={17} className={inputClass} {...aria("taxId")} />
              </label>
              <label className="block">
                <span className={labelClass}>{t("taxBranch")}</span>
                <input name="taxBranch" placeholder={t("taxBranchPlaceholder")} className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>{t("taxAddress")}</span>
                <textarea name="taxAddress" rows={2} className={inputClass} />
                <span className="mt-1 block text-xs text-text-2">{t("taxAddressHint")}</span>
              </label>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl font-semibold">{t("paymentTitle")}</legend>
          <div className="mt-4 space-y-3">
            {paymentMethods.map((method, index) => (
              <label
                key={method}
                className="flex cursor-pointer items-start gap-3 rounded-card border border-border-strong p-4 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <input type="radio" name="paymentMethod" value={method} defaultChecked={index === 0} className="mt-1 h-4 w-4" />
                <span>
                  <span className="font-semibold">{t(method === "promptpay" ? "payPromptpay" : "payBank")}</span>
                  <span className="block text-sm text-text-2">{t(method === "promptpay" ? "payPromptpayDesc" : "payBankDesc")}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className={labelClass}>{t("note")}</span>
          <textarea name="note" rows={2} placeholder={t("notePlaceholder")} className={inputClass} />
        </label>
      </div>

      <aside className="rounded-card border border-border bg-surface-0 p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">{t("yourCart")}</h2>
        {removedNames.length > 0 && <p className="mt-3 text-sm text-error">{t("removedItems", { names: removedNames.join(", ") })}</p>}
        <ul className="mt-4 divide-y divide-border">
          {lines.map((line) => (
            <li key={`${line.kind}:${line.slug}`} className="flex gap-3 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{line.name}</p>
                <p className="mt-0.5 text-sm tabular-nums text-text-2">{baht(line.unitPrice)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border border-border-strong">
                    <button
                      type="button"
                      aria-label={t("decrease")}
                      disabled={line.quantity <= 1}
                      onClick={() => cart.setQuantity(line.kind, line.slug, line.quantity - 1)}
                      className="h-9 w-9 text-lg disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums" aria-label={t("quantity")}>
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={t("increase")}
                      disabled={line.quantity >= MAX_QUANTITY}
                      onClick={() => cart.setQuantity(line.kind, line.slug, line.quantity + 1)}
                      className="h-9 w-9 text-lg disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(line.kind, line.slug)}
                    className="text-sm text-text-2 underline-offset-4 hover:text-error hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold tabular-nums">{baht(line.unitPrice * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-2">{t("subtotal")}</dt>
            <dd className="tabular-nums">{baht(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-2">{t("shipping")}</dt>
            <dd className="tabular-nums">{shipping === 0 ? t("shippingFree") : baht(shipping)}</dd>
          </div>
          {!freeShipping && freeShippingMin !== null && shippingFee > 0 && (
            <p className="text-xs text-primary-700">{t("freeShippingHint", { amount: baht(freeShippingMin - subtotal) })}</p>
          )}
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <dt className="font-semibold">{t("total")}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{baht(total)}</dd>
          </div>
          <p className="text-right text-xs text-text-2">{t("vatIncluded")}</p>
        </dl>

        <label className="mt-5 flex items-start gap-2.5 text-sm">
          <input type="checkbox" name="acceptTerms" required className="mt-0.5 h-4 w-4 rounded" {...aria("acceptTerms")} />
          <span className={invalid.has("acceptTerms") ? "text-error" : "text-text-2"}>
            {t.rich("acceptTerms", {
              terms: (chunks) => (
                <Link href="/terms-of-service" target="_blank" className="underline underline-offset-2">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy-policy" target="_blank" className="underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        {state.status === "error" && (
          <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">
            {t(`errors.${state.error}`)}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || state.status === "success"}
          className="mt-5 w-full cursor-pointer rounded-button bg-primary-600 px-6 py-3.5 text-lg font-semibold text-white outline-offset-2 transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending || state.status === "success" ? t("placing") : t("placeOrder", { total: baht(total) })}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-text-2">{t("deliveryNote")}</p>
      </aside>
    </form>
  );
}
