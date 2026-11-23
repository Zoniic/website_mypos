/**
 * Input limits for the public forms (contact, quote, warranty, newsletter).
 * Server Actions are public endpoints, so every field is capped here instead
 * of trusting the browser's maxlength.
 */

/** Same shape as the checkout form uses; requires a 2+ letter ending. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MAX = {
  name: 120,
  company: 200,
  phone: 30,
  email: 160,
  product: 200,
  slug: 120,
  serial: 100,
  message: 2000,
} as const;

/** A trimmed text field, cut to `max` characters. Missing fields become "". */
export function textField(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

/** Name of the hidden honeypot input (same name the checkout form uses). */
export const HONEYPOT_FIELD = "website";

/**
 * True when the hidden honeypot field was filled, which people never do.
 * Callers answer with a normal "success" and store nothing, so bots get no
 * signal that they were filtered.
 */
export function isBotSubmission(formData: FormData): boolean {
  return String(formData.get(HONEYPOT_FIELD) ?? "") !== "";
}

export type QuoteLine = { slug: string; name: string; quantity: number };

export const MAX_QUOTE_LINES = 50;

/**
 * Validates the quote cart sent by the browser. Returns null for anything that
 * is not a list of 1 to 50 lines with a slug and a name. Quantities are clamped to 1 to 999.
 */
export function parseQuoteLines(raw: string): QuoteLine[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > MAX_QUOTE_LINES) return null;
  const lines: QuoteLine[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) return null;
    const { slug, name, quantity } = entry as Record<string, unknown>;
    if (typeof slug !== "string" || !slug.trim() || typeof name !== "string") return null;
    // The browser cart has no quantity cap, so clamp instead of rejecting a real customer.
    const qty = Math.min(999, Math.max(1, Math.round(Number(quantity)) || 1));
    lines.push({ slug: slug.trim().slice(0, MAX.slug), name: name.trim().slice(0, MAX.product), quantity: qty });
  }
  return lines;
}
