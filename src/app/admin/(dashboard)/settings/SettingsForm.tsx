"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import type { SiteSettings } from "@/lib/siteSettings";
import { HeroBackgroundUploadField } from "../HeroBackgroundUploadField";
import { updateSiteSettings } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

function Field({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {hint && <p className="text-xs text-text-2">{hint}</p>}
      <input name={name} defaultValue={defaultValue} className={inputClass} />
    </label>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [status, formAction, isPending] = useActionState(updateSiteSettings, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-2xl space-y-8">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Contact</h3>
        <Field label="Phone (tel: link, e.g. +66-2-123-4567)" name="phone" defaultValue={settings.phone} />
        <Field label="Phone (display text, e.g. 02-123-4567)" name="phoneDisplay" defaultValue={settings.phoneDisplay} />
        <Field label="Email" name="email" defaultValue={settings.email} />
        <Field label="LINE ID (e.g. @mypos)" name="lineId" defaultValue={settings.lineId} />
        <Field
          label="LINE chat link"
          name="lineUrl"
          defaultValue={settings.lineUrl}
          hint="Full URL, e.g. https://line.me/R/ti/p/@mypos"
        />
        <Field label="Facebook page URL" name="facebookUrl" defaultValue={settings.facebookUrl} />
        <Field label="YouTube channel URL" name="youtubeUrl" defaultValue={settings.youtubeUrl} />
        <Field label="TikTok profile URL" name="tiktokUrl" defaultValue={settings.tiktokUrl} />
        <Field label="Instagram profile URL" name="instagramUrl" defaultValue={settings.instagramUrl} />
        <p className="text-xs text-text-2">
          Social links are shown in the footer and told to Google as the company&apos;s official profiles
          (Organization &quot;sameAs&quot;), which helps the brand panel in search results.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Sales channels &amp; online ordering</h3>
        <Field
          label="Shopee shop URL"
          name="shopeeShopUrl"
          defaultValue={settings.shopeeShopUrl}
          hint="e.g. https://shopee.co.th/mypos — per-product Shopee links are set on each product."
        />
        <Field label="Lazada shop URL" name="lazadaShopUrl" defaultValue={settings.lazadaShopUrl} />
        <Field label="TikTok Shop URL (optional)" name="tiktokShopUrl" defaultValue={settings.tiktokShopUrl} />
        <label className="flex items-start gap-2 rounded-lg bg-surface-0 p-3">
          <input
            type="checkbox"
            name="onlineOrdering"
            defaultChecked={settings.onlineOrdering === "on"}
            className="mt-0.5 h-4 w-4 rounded"
          />
          <span className="text-sm">
            <span className="font-medium text-text-1">Accept orders on the website</span>
            <span className="block text-xs text-text-2">
              Shows &quot;Add to cart&quot; on products and accessories that have an online price. Customers pay by
              PromptPay QR or bank transfer; you confirm payment under Orders.
            </span>
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Delivery fee (THB)" name="shippingFee" defaultValue={settings.shippingFee} hint="0 or empty = free" />
          <Field
            label="Free delivery from (THB)"
            name="freeShippingMin"
            defaultValue={settings.freeShippingMin}
            hint="Order total that gets free delivery; empty = none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="PromptPay ID"
            name="promptpayId"
            defaultValue={settings.promptpayId}
            hint="Mobile number or 13-digit tax ID registered with PromptPay"
          />
          <Field label="PromptPay account name" name="promptpayName" defaultValue={settings.promptpayName} />
          <Field label="Bank" name="bankName" defaultValue={settings.bankName} hint="e.g. ธนาคารกสิกรไทย" />
          <Field label="Account name" name="bankAccountName" defaultValue={settings.bankAccountName} />
          <Field label="Account number" name="bankAccountNumber" defaultValue={settings.bankAccountNumber} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Tracking &amp; ad pixels</h3>
        <p className="text-xs text-text-2">
          Paste only the ID. Google tags start in &quot;consent denied&quot; mode; Meta, TikTok and LINE pixels load only
          after the visitor accepts cookies (PDPA). Events sent automatically: product view, add to cart, checkout,
          purchase, lead (contact / quote / demo forms), LINE and phone clicks, Shopee/Lazada clicks.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GA4 Measurement ID" name="ga4Id" defaultValue={settings.ga4Id} hint="G-XXXXXXXXXX" />
          <Field label="Google Tag Manager ID (optional)" name="gtmId" defaultValue={settings.gtmId} hint="GTM-XXXXXXX" />
          <Field label="Meta (Facebook) Pixel ID" name="metaPixelId" defaultValue={settings.metaPixelId} hint="15–16 digits" />
          <Field label="TikTok Pixel ID" name="tiktokPixelId" defaultValue={settings.tiktokPixelId} />
          <Field label="LINE Tag ID" name="lineTagId" defaultValue={settings.lineTagId} hint="From LINE Ads Manager → Tracking (LINE Tag)" />
          <Field label="Google Ads ID" name="googleAdsId" defaultValue={settings.googleAdsId} hint="AW-XXXXXXXXX" />
          <Field label="Google Ads lead conversion label" name="googleAdsLeadLabel" defaultValue={settings.googleAdsLeadLabel} />
          <Field
            label="Google Ads purchase conversion label"
            name="googleAdsPurchaseLabel"
            defaultValue={settings.googleAdsPurchaseLabel}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Search engine verification</h3>
        <p className="text-xs text-text-2">
          Paste only the content=&quot;…&quot; value of each verification meta tag.
        </p>
        <Field
          label="Google Search Console"
          name="googleSiteVerification"
          defaultValue={settings.googleSiteVerification}
        />
        <Field label="Bing Webmaster Tools" name="bingSiteVerification" defaultValue={settings.bingSiteVerification} />
        <Field
          label="Facebook domain verification"
          name="facebookDomainVerification"
          defaultValue={settings.facebookDomainVerification}
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Homepage Hero</h3>
        <HeroBackgroundUploadField
          name="heroVideoUrl"
          label="Background video or image (optional)"
          currentUrl={settings.heroVideoUrl}
          specHint="Leave empty to use the default animated gradient background. Upload a short, muted, looping MP4 clip of the product/hardware in use, or a still JPG/PNG/WebP image. MP4 max 50MB, image max 5MB."
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Map</h3>
        <Field
          label="Google Maps embed URL"
          name="mapEmbedUrl"
          defaultValue={settings.mapEmbedUrl}
          hint="From Google Maps: Share > Embed a map > copy the src=&quot;...&quot; URL"
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Homepage Stats</h3>
        <Field label="Businesses served" name="statsClients" defaultValue={settings.statsClients} />
        <Field label="Years of experience" name="statsYears" defaultValue={settings.statsYears} />
        <Field label="Support availability" name="statsSupport" defaultValue={settings.statsSupport} />
      </section>

      {status === "saved" && <p className="text-sm text-success">Saved.</p>}
      {status && status !== "saved" && (
        <p role="alert" className="whitespace-pre-line rounded-lg bg-error/10 p-3 text-sm text-error">
          {status}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}
