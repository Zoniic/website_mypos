import { headers } from "next/headers";

/**
 * Whether the admin cookies get the Secure flag. Browsers drop a Secure cookie
 * sent over plain http (for example a test server opened as http://192.168.x.x),
 * which made every refresh go back to the login page. So the flag follows how
 * the request actually arrived:
 *  - ADMIN_COOKIE_SECURE=true / false in the environment wins;
 *  - development: off;
 *  - behind a proxy (Railway, nginx): on when x-forwarded-proto is https;
 *  - otherwise: on when the form was posted from an https page, and on when that is unknown.
 */
export function secureCookieDecision(input: {
  override?: string;
  nodeEnv?: string;
  forwardedProto?: string | null;
  origin?: string | null;
}): boolean {
  if (input.override === "true") return true;
  if (input.override === "false") return false;
  if (input.nodeEnv !== "production") return false;
  const proto = input.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  if (proto) return proto === "https";
  if (input.origin) return input.origin.startsWith("https://");
  return true;
}

/** Secure flag for a cookie set in the current server action or route. */
export async function secureCookieWanted(): Promise<boolean> {
  const h = await headers();
  return secureCookieDecision({
    override: process.env.ADMIN_COOKIE_SECURE,
    nodeEnv: process.env.NODE_ENV,
    forwardedProto: h.get("x-forwarded-proto"),
    origin: h.get("origin"),
  });
}
