import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { tokenMatches } from "@/lib/orders";
import { promptPayPayload } from "@/lib/promptpay";
import { cleanPromptPayId } from "@/lib/trackingIds";
import { PurchaseTracker } from "@/components/analytics/PurchaseTracker";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; number: string }> }): Promise<Metadata> {
  const { locale, number } = await params;
  const t = await getTranslations({ locale, namespace: "order" });
  return { title: { absolute: t("metaTitle", { number }) }, robots: { index: false, follow: false } };
}

/** LINE Official Account chat with a pre-filled message (the customer just attaches the slip). */
function lineMessageUrl(lineId: string, text: string): string | null {
  const id = lineId.trim();
  if (!/^@?[\w.-]{2,40}$/.test(id)) return null;
  return `https://line.me/R/oaMessage/${encodeURIComponent(id.startsWith("@") ? id : `@${id}`)}/?${encodeURIComponent(text)}`;
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; number: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale, number } = await params;
  const { t: token } = await searchParams;
  setRequestLocale(locale);

  const order = await prisma.order.findUnique({ where: { number }, include: { items: { orderBy: { id: "asc" } } } });
  // Same 404 for "no such order" and "wrong link", so numbers can't be probed.
  if (!order || !tokenMatches(order.accessToken, token)) notFound();

  const t = await getTranslations({ locale, namespace: "order" });
  const format = await getFormatter({ locale });
  const settings = await getSiteSettings();
  const baht = (value: number) => format.number(value, { style: "currency", currency: "THB", maximumFractionDigits: 0 });

  const awaitingPayment = order.status === "pending_payment";
  const promptpayId = cleanPromptPayId(settings.promptpayId);
  const qrDataUrl =
    awaitingPayment && order.paymentMethod === "promptpay" && promptpayId
      ? await QRCode.toDataURL(promptPayPayload(promptpayId, order.total), { errorCorrectionLevel: "M", margin: 2, width: 320 })
      : null;
  const lineUrl = lineMessageUrl(settings.lineId, t("lineMessage", { number: order.number, total: baht(order.total) }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PurchaseTracker
        orderNumber={order.number}
        value={order.total}
        shipping={order.shippingFee}
        items={order.items.map((item) => ({ id: item.slug, name: item.name, price: item.unitPrice, quantity: item.quantity }))}
      />

      <p className="text-sm font-medium text-text-2">{t("numberLabel")}</p>
      <p className="font-display text-2xl font-semibold tracking-tight">{order.number}</p>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {awaitingPayment ? t("titlePending") : t(`status.${order.status}`)}
      </h1>
      <p className="mt-3 max-w-2xl text-text-2">{awaitingPayment ? t("introPending") : t("introOther")}</p>

      {awaitingPayment && (
        <section aria-labelledby="pay-title" className="mt-10 rounded-card border border-primary-200 bg-primary-50 p-6 sm:p-8">
          <h2 id="pay-title" className="font-display text-xl font-semibold">
            {t("payTitle", { total: baht(order.total) })}
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start">
            {qrDataUrl && (
              <figure className="w-56 rounded-xl bg-white p-3 shadow-[var(--shadow-sm)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL, nothing to optimise */}
                <img src={qrDataUrl} alt={t("qrAlt", { total: baht(order.total) })} width={320} height={320} className="h-auto w-full" />
                <figcaption className="mt-2 text-center text-xs text-text-2">
                  PromptPay{settings.promptpayName ? ` · ${settings.promptpayName}` : ""}
                </figcaption>
              </figure>
            )}
            <div className="space-y-5 text-sm">
              {qrDataUrl && <p>{t("qrHowTo")}</p>}
              {settings.bankAccountNumber && (
                <div>
                  <p className="font-semibold">{t("bankTitle")}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    {settings.bankName && (
                      <>
                        <dt className="text-text-2">{t("bank")}</dt>
                        <dd>{settings.bankName}</dd>
                      </>
                    )}
                    {settings.bankAccountName && (
                      <>
                        <dt className="text-text-2">{t("accountName")}</dt>
                        <dd>{settings.bankAccountName}</dd>
                      </>
                    )}
                    <dt className="text-text-2">{t("accountNumber")}</dt>
                    <dd className="font-display text-base font-semibold tracking-wide">{settings.bankAccountNumber}</dd>
                  </dl>
                </div>
              )}
              <div className="border-t border-primary-200 pt-5">
                <p className="font-semibold">{t("slipTitle")}</p>
                <p className="mt-1 text-text-2">{t("slipBody")}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {lineUrl && (
                    <a
                      href={lineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-button bg-[#06c755] px-5 py-2.5 font-semibold text-[#062b14] hover:brightness-95"
                    >
                      {t("slipLine")}
                    </a>
                  )}
                  {settings.phone && (
                    <a href={`tel:${settings.phone}`} className="inline-flex items-center rounded-button border border-border-strong bg-white px-5 py-2.5 font-semibold">
                      {t("call", { phone: settings.phoneDisplay || settings.phone })}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="items-title" className="mt-12">
        <h2 id="items-title" className="font-display text-xl font-semibold">
          {t("itemsTitle")}
        </h2>
        <table className="mt-4 w-full text-sm">
          <thead className="sr-only">
            <tr>
              <th>{t("item")}</th>
              <th>{t("qty")}</th>
              <th>{t("amount")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 pr-4">{item.name}</td>
                <td className="py-3 pr-4 text-right tabular-nums text-text-2">
                  {item.quantity} × {baht(item.unitPrice)}
                </td>
                <td className="py-3 text-right font-medium tabular-nums">{baht(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-3 text-right text-text-2">{t("shipping")}</td>
              <td className="pt-3 text-right tabular-nums">{order.shippingFee ? baht(order.shippingFee) : t("free")}</td>
            </tr>
            <tr>
              <td colSpan={2} className="pt-2 text-right font-semibold">{t("total")}</td>
              <td className="pt-2 text-right font-display text-xl font-semibold tabular-nums">{baht(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="mt-12 grid gap-8 text-sm sm:grid-cols-2">
        <div>
          <h2 className="font-semibold">{t("deliverTo")}</h2>
          <p className="mt-2 whitespace-pre-line text-text-2">
            {order.customerName}
            {"\n"}
            {order.address} {order.postcode}
            {"\n"}
            {order.phone}
          </p>
        </div>
        {order.wantsTaxInvoice && (
          <div>
            <h2 className="font-semibold">{t("taxInvoice")}</h2>
            <p className="mt-2 whitespace-pre-line text-text-2">
              {order.taxName}
              {"\n"}
              {t("taxIdLabel")} {order.taxId} ({order.taxBranch})
              {"\n"}
              {order.taxAddress}
            </p>
          </div>
        )}
      </section>

      <p className="mt-12 rounded-lg bg-surface-2 p-4 text-sm text-text-2">{t("bookmark")}</p>
    </div>
  );
}
