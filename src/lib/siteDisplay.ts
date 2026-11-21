/** Rules for Site Settings values that are shown on the public pages. Shared by the pages and the admin validation. */

const GOOGLE_HOST = /^(?:www\.)?google\.(?:com|co\.th)$/i;

/** A real Google Maps embed URL (https://www.google.com/maps/embed?pb=...). Search links are refused by Google inside an iframe. */
export function isGoogleMapsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && GOOGLE_HOST.test(url.hostname) && /^\/maps\/embed(?:\/|$)/.test(url.pathname);
  } catch {
    return false;
  }
}

/** Link for "open in Google Maps": the stored link if it is a Google Maps page, otherwise a search for the address. */
export function googleMapsOpenUrl(stored: string, address: string): string {
  try {
    const url = new URL(stored.trim());
    if (url.protocol === "https:" && GOOGLE_HOST.test(url.hostname) && url.pathname.startsWith("/maps") && !isGoogleMapsEmbedUrl(stored)) {
      return url.toString();
    }
  } catch {
    // fall through to the address search
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Grid columns for a stats row of 1 to 3 items (literal class names so Tailwind sees them). */
export function statGridClass(count: number): string {
  if (count >= 3) return "sm:grid-cols-3";
  if (count === 2) return "sm:grid-cols-2 lg:max-w-2xl";
  return "lg:max-w-xs";
}

export const STAT_MAX_LENGTH = 16;

/** A homepage stat is a short figure such as "500+", "30 ปี" or "24/7". URLs and long text are not stats. */
export function isShowableStat(value: string): boolean {
  const v = value.trim();
  if (!v || v.length > STAT_MAX_LENGTH) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v) || /^www\./i.test(v)) return false;
  if (/[a-z0-9-]\.[a-z]{2,}(?:\/|$)/i.test(v)) return false; // looks like a domain
  return true;
}
