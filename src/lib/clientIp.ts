import { headers } from "next/headers";
import { isRateLimited, recordAttempt } from "@/lib/rateLimit";

/**
 * The visitor's IP for rate limiting. Uses the rightmost x-forwarded-for
 * entry — the one appended by our own reverse proxy (nginx
 * `proxy_add_x_forwarded_for`) — since anything to its left is sent by the
 * client and can be forged to dodge limits.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.at(-1) || h.get("x-real-ip") || "unknown";
}

/**
 * Anti-spam for public forms: true once this IP has submitted `kind` 5 times
 * in 15 minutes (see lib/rateLimit). Counts the submission otherwise.
 */
export async function overSubmissionLimit(kind: string): Promise<boolean> {
  const ip = await clientIp();
  // No client IP (no reverse proxy in front): one shared bucket would block every
  // real customer after five submissions, so nothing is limited here. Put the app
  // behind a proxy that sets x-forwarded-for (docs/deploy-checklist-th.md).
  if (ip === "unknown") return false;
  const key = `${kind}:${ip}`;
  if (isRateLimited(key)) return true;
  recordAttempt(key);
  return false;
}
