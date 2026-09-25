"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsent, track } from "@/lib/analytics";

export type TrackingIds = {
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  lineTagId: string;
  googleAdsId: string;
  googleAdsLeadLabel: string;
  googleAdsPurchaseLabel: string;
};

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

type PixelWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  ttq?: { page: () => void };
  _lt?: (...args: unknown[]) => void;
};

/**
 * Loads every tag the admin configured in Site Settings. All IDs arrive
 * already validated against their vendor format (src/lib/trackingIds.ts),
 * and are still JSON-encoded when written into the inline scripts.
 *
 * - Google (GA4, Ads, GTM) loads immediately under Consent Mode v2 with
 *   everything "denied" until the visitor accepts, so GA gets cookieless
 *   pings and no cookies are set before consent.
 * - Meta, TikTok and LINE pixels load only after the visitor accepts.
 */
export function TrackingScripts({ ids }: { ids: TrackingIds }) {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);
  const accepted = consent === "accepted";
  const pathname = usePathname();
  const firstPath = useRef(true);

  const googleTagId = ids.ga4Id || ids.googleAdsId;
  const hasGoogle = Boolean(googleTagId || ids.gtmId);

  // Consent Mode: tell Google tags when the visitor's choice changes.
  useEffect(() => {
    const w = window as PixelWindow;
    if (!w.gtag) return;
    const state = accepted ? "granted" : "denied";
    w.gtag("consent", "update", {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }, [accepted]);

  // Client-side navigations: pixels only count the first page load by
  // themselves (GA4's enhanced measurement already follows history changes).
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const w = window as PixelWindow;
    w.fbq?.("track", "PageView");
    w.ttq?.page();
    if (ids.lineTagId) w._lt?.("send", "pv", [ids.lineTagId]);
  }, [pathname, ids.lineTagId]);

  // Contact and marketplace clicks anywhere on the site, without wiring
  // every link by hand.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track({ name: "contact", channel: "phone" });
      else if (href.startsWith("mailto:")) track({ name: "contact", channel: "email" });
      else if (/(^|\/\/)(line\.me|lin\.ee)\//.test(href)) track({ name: "contact", channel: "line" });
      else {
        const marketplace = /shopee\.co\.th|shp\.ee/.test(href)
          ? "shopee"
          : /lazada\.co\.th|s\.lazada/.test(href)
            ? "lazada"
            : /tiktok\.com\/.*shop|shop\.tiktok/.test(href)
              ? "tiktok"
              : null;
        if (marketplace) {
          track({ name: "marketplace_click", marketplace, itemName: link.getAttribute("data-item-name") ?? undefined });
        }
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  const googleBootstrap = hasGoogle
    ? `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var granted = false;
try { granted = localStorage.getItem(${JSON.stringify("mypos-cookie-consent")}) === "accepted"; } catch (e) {}
var state = granted ? "granted" : "denied";
gtag("consent", "default", { analytics_storage: state, ad_storage: state, ad_user_data: state, ad_personalization: state, wait_for_update: 500 });
gtag("js", new Date());
${ids.ga4Id ? `gtag("config", ${JSON.stringify(ids.ga4Id)});` : ""}
${ids.googleAdsId ? `gtag("config", ${JSON.stringify(ids.googleAdsId)});` : ""}
window.__myposAds = ${JSON.stringify({ id: ids.googleAdsId, lead: ids.googleAdsLeadLabel, purchase: ids.googleAdsPurchaseLabel })};
${
  googleTagId
    ? `(function(){var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+${JSON.stringify(googleTagId)};document.head.appendChild(s);})();`
    : ""
}
${
  ids.gtmId
    ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer",${JSON.stringify(ids.gtmId)});`
    : ""
}`
    : "";

  return (
    <>
      {hasGoogle && (
        <Script id="google-tags" strategy="afterInteractive">
          {googleBootstrap}
        </Script>
      )}

      {accepted && ids.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
fbq("init", ${JSON.stringify(ids.metaPixelId)});
fbq("track", "PageView");`}
        </Script>
      )}

      {accepted && ids.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};n=d.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load(${JSON.stringify(ids.tiktokPixelId)});
ttq.page();
}(window,document,"ttq");`}
        </Script>
      )}

      {accepted && ids.lineTagId && (
        <Script id="line-tag" strategy="afterInteractive">
          {`(function(g,d,o){g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};var h="https://d.line-scdn.net";var s=d.createElement("script");s.async=1;s.src=o||h+"/n/line_tag/public/release/v1/lt.js";var t=d.getElementsByTagName("script")[0];t.parentNode.insertBefore(s,t);})(window,document);
window.__myposLineTag = ${JSON.stringify(ids.lineTagId)};
_lt("init", { customerType: "lap", tagId: ${JSON.stringify(ids.lineTagId)} });
_lt("send", "pv", [${JSON.stringify(ids.lineTagId)}]);`}
        </Script>
      )}
    </>
  );
}
