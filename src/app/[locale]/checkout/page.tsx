import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { CheckoutClient } from "@/components/commerce/CheckoutClient";
import { getSiteSettings, isOnlineOrderingOn } from "@/lib/siteSettings";
import { availablePaymentMethods, getOnlineCatalog } from "@/lib/orders";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  // Cart pages are private and thin: keep them out of search results.
  return { title: { absolute: t("metaTitle") }, robots: { index: false, follow: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "checkout" });
  const tCommon = await getTranslations({ locale, namespace: "solutionsCommon" });
  const settings = await getSiteSettings();
  const open = isOnlineOrderingOn(settings);

  return (
    <>
      <Breadcrumb items={[{ label: tCommon("breadcrumbHome"), href: "/" }, { label: t("breadcrumb") }]} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
        {open ? (
          <CheckoutClient
            locale={locale}
            catalog={await getOnlineCatalog(locale)}
            paymentMethods={availablePaymentMethods(settings)}
            shippingFee={Math.max(0, Math.round(Number(settings.shippingFee) || 0))}
            freeShippingMin={settings.freeShippingMin.trim() ? Number(settings.freeShippingMin) : null}
          />
        ) : (
          <div className="mt-8 max-w-xl">
            <p className="text-text-2">{t("closed")}</p>
            <Button href="/contact?topic=quote" variant="primary" className="mt-6">
              {t("closedCta")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
