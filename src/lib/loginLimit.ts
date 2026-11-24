import { clientIp } from "@/lib/clientIp";

/**
 * Limit key for failed logins, shared by wrong passwords and wrong two-step
 * codes (5 tries per 15 minutes). Without a reverse proxy there is no client
 * IP ("unknown"), and one shared bucket would let five wrong passwords lock
 * every admin out, so in that case the limit is kept per account instead.
 */
export async function loginClientKey(email: string): Promise<string> {
  const ip = await clientIp();
  return ip === "unknown" ? `login:unknown:${email.slice(0, 160)}` : `login:${ip}`;
}
