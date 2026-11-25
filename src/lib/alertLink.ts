import { siteConfig } from "@/config/site";

/**
 * Link to the admin page in a team alert. The site address comes from
 * ADMIN_BASE_URL when set (for example http://192.168.0.109:3000 on the test
 * server), else siteConfig.url. Before 2026-11-24 it was always
 * https://mypos.co.th, which still serves the old site.
 *
 * LINE opens links in its own in-app browser, which does not share the admin
 * login with the phone's browser, so every tap asked for the password again.
 * `openExternalBrowser=1` makes LINE open the link in the default browser.
 */
export function alertLink(adminPath: string, channel: "line" | "email", base = process.env.ADMIN_BASE_URL): string {
  const origin = (base?.trim() || siteConfig.url).replace(/\/+$/, "");
  const url = `${origin}${adminPath.startsWith("/") ? adminPath : `/${adminPath}`}`;
  if (channel !== "line") return url;
  return `${url}${url.includes("?") ? "&" : "?"}openExternalBrowser=1`;
}
