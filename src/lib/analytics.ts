/**
 * One place to send marketing/analytics events. Each call fans out to every
 * tag the admin configured (GA4 + GTM dataLayer, Google Ads, Meta Pixel,
 * TikTok Pixel, LINE Tag), using each vendor's standard event names so
 * their ad platforms can optimise on them. Tags that aren't loaded — not
 * configured, or no cookie consent yet — are simply skipped.
 */

export const CONSENT_KEY = "mypos-cookie-consent";
export const CONSENT_EVENT = "mypos-consent";
/** "accepted" = analytics + marketing; "necessary" = strictly necessary only. */
export type ConsentValue = "accepted" | "necessary";

export function readConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "necessary" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue | null) {
  try {
    if (value) window.localStorage.setItem(CONSENT_KEY, value);
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  // Mirrors the pre-paint script in app/[locale]/layout.tsx; CSS hides the
  // banner while this attribute is present.
  if (value) document.documentElement.dataset.consent = "1";
  else delete document.documentElement.dataset.consent;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export type TrackItem = {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  category?: string;
};

export type TrackEvent =
  | { name: "view_item"; item: TrackItem }
  | { name: "add_to_cart"; item: TrackItem }
  | { name: "begin_checkout"; items: TrackItem[]; value: number }
  | { name: "purchase"; orderNumber: string; items: TrackItem[]; value: number; shipping: number }
  | { name: "generate_lead"; topic: string }
  | { name: "contact"; channel: "line" | "phone" | "email" }
  | { name: "marketplace_click"; marketplace: "shopee" | "lazada" | "tiktok"; itemName?: string };

type AdsConfig = { id: string; lead: string; purchase: string };

type TrackingWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (event: string, params?: Record<string, unknown>) => void; page: () => void };
  _lt?: (...args: unknown[]) => void;
  __myposAds?: AdsConfig;
  __myposLineTag?: string;
};

const CURRENCY = "THB";

function gaItems(items: TrackItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_category: item.category,
  }));
}

function contents(items: TrackItem[]) {
  return items.map((item) => ({
    id: item.id,
    content_id: item.id,
    content_name: item.name,
    quantity: item.quantity ?? 1,
    price: item.price,
  }));
}

export function track(event: TrackEvent) {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  const gtag = w.gtag;
  const fbq = w.fbq;
  const ttq = w.ttq;
  const lt = w._lt;
  const ads = w.__myposAds;

  // GA4 recommended events (also picked up by GTM via the dataLayer).
  let ga: [string, Record<string, unknown>];
  switch (event.name) {
    case "view_item":
      ga = ["view_item", { currency: CURRENCY, value: event.item.price, items: gaItems([event.item]) }];
      break;
    case "add_to_cart":
      ga = ["add_to_cart", { currency: CURRENCY, value: (event.item.price ?? 0) * (event.item.quantity ?? 1), items: gaItems([event.item]) }];
      break;
    case "begin_checkout":
      ga = ["begin_checkout", { currency: CURRENCY, value: event.value, items: gaItems(event.items) }];
      break;
    case "purchase":
      ga = ["purchase", { transaction_id: event.orderNumber, currency: CURRENCY, value: event.value, shipping: event.shipping, items: gaItems(event.items) }];
      break;
    case "generate_lead":
      ga = ["generate_lead", { lead_source: event.topic }];
      break;
    case "contact":
      ga = ["contact", { method: event.channel }];
      break;
    case "marketplace_click":
      ga = ["marketplace_click", { marketplace: event.marketplace, item_name: event.itemName }];
      break;
  }
  if (gtag) gtag("event", ...ga);
  else if (w.dataLayer) w.dataLayer.push({ event: ga[0], ...ga[1] });

  // Google Ads conversions.
  if (gtag && ads?.id) {
    if (event.name === "generate_lead" && ads.lead) {
      gtag("event", "conversion", { send_to: `${ads.id}/${ads.lead}` });
    }
    if (event.name === "purchase" && ads.purchase) {
      gtag("event", "conversion", {
        send_to: `${ads.id}/${ads.purchase}`,
        value: event.value,
        currency: CURRENCY,
        transaction_id: event.orderNumber,
      });
    }
  }

  // Meta Pixel standard events.
  if (fbq) {
    switch (event.name) {
      case "view_item":
        fbq("track", "ViewContent", { content_ids: [event.item.id], content_name: event.item.name, content_type: "product", value: event.item.price, currency: CURRENCY });
        break;
      case "add_to_cart":
        fbq("track", "AddToCart", { content_ids: [event.item.id], content_name: event.item.name, content_type: "product", value: event.item.price, currency: CURRENCY });
        break;
      case "begin_checkout":
        fbq("track", "InitiateCheckout", { content_ids: event.items.map((i) => i.id), num_items: event.items.length, value: event.value, currency: CURRENCY });
        break;
      case "purchase":
        fbq("track", "Purchase", { content_ids: event.items.map((i) => i.id), content_type: "product", contents: contents(event.items), value: event.value, currency: CURRENCY }, { eventID: event.orderNumber });
        break;
      case "generate_lead":
        fbq("track", "Lead", { content_category: event.topic });
        break;
      case "contact":
        fbq("track", "Contact", { content_category: event.channel });
        break;
      case "marketplace_click":
        fbq("trackCustom", "MarketplaceClick", { marketplace: event.marketplace, content_name: event.itemName });
        break;
    }
  }

  // TikTok Pixel standard events.
  if (ttq) {
    switch (event.name) {
      case "view_item":
        ttq.track("ViewContent", { contents: contents([event.item]), content_type: "product", value: event.item.price, currency: CURRENCY });
        break;
      case "add_to_cart":
        ttq.track("AddToCart", { contents: contents([event.item]), content_type: "product", value: event.item.price, currency: CURRENCY });
        break;
      case "begin_checkout":
        ttq.track("InitiateCheckout", { contents: contents(event.items), content_type: "product", value: event.value, currency: CURRENCY });
        break;
      case "purchase":
        ttq.track("CompletePayment", { contents: contents(event.items), content_type: "product", value: event.value, currency: CURRENCY });
        break;
      case "generate_lead":
        ttq.track("SubmitForm", { content_name: event.topic });
        break;
      case "contact":
        ttq.track("Contact", { content_name: event.channel });
        break;
      case "marketplace_click":
        ttq.track("ClickButton", { content_name: `${event.marketplace}${event.itemName ? `: ${event.itemName}` : ""}` });
        break;
    }
  }

  // LINE Tag: conversions for the events LINE Ads can optimise on.
  if (lt && w.__myposLineTag) {
    const type =
      event.name === "purchase" ? "Conversion" : event.name === "generate_lead" ? "Lead" : event.name === "add_to_cart" ? "AddToCart" : null;
    if (type) lt("send", "cv", { type }, [w.__myposLineTag]);
  }
}
