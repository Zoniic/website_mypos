import { draftMode } from "next/headers";
import { getSessionUser, requireAdmin } from "@/lib/adminAuth";

/**
 * "Edit on site" mode: an admin browses the real website and clicks text,
 * photos or sections to edit them. It rides on Next's Draft Mode, so only
 * that admin's browser renders pages fresh — everyone else keeps the cached
 * pages. Entered via /admin/live (behind the admin proxy check).
 */

/** Non-secret hint cookie set at login so the public site can offer "Edit this page". */
export const ADMIN_HINT_COOKIE = "mypos_admin";

/** True for an admin with Draft Mode on. Reads cookies only when Draft Mode is on. */
export async function isEditMode(): Promise<boolean> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return false;
  return (await getSessionUser()) !== null;
}

/**
 * Guard for server actions used from public pages: those URLs aren't covered
 * by the /admin proxy check, so every action verifies the session itself.
 */
export async function requireEditor() {
  return requireAdmin();
}

// Copy rendered in edit mode carries an invisible marker naming its
// PageContent row, so a click on any text can open the right field:
// U+2063, the row id in base 4 written with zero-width characters, U+2064.
const START = "⁣";
const END = "⁤";
const DIGITS = ["​", "‌", "‍", "⁠"];

export function encodeEditMarker(rowId: number): string {
  return START + [...rowId.toString(4)].map((d) => DIGITS[Number(d)]).join("") + END;
}

/** Fields whose values are identifiers, links or numbers — never marked. */
const UNMARKED_FIELDS = /^(href|url|type|slug|key|icon|id|value|image|imageUrl|category|kind|locale|variant)$/i;

/** Appends the row's marker to every visible string inside a message value. */
export function markValue(value: unknown, marker: string, field = ""): unknown {
  if (typeof value === "string") {
    const text = value.trim();
    if (!text || UNMARKED_FIELDS.test(field) || /^(\/|https?:|mailto:|tel:|#)/.test(text) || /^[\d.,\s%฿+-]+$/.test(text)) {
      return value;
    }
    return value + marker;
  }
  if (Array.isArray(value)) return value.map((v) => markValue(v, marker, field));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, markValue(v, marker, k)]));
  }
  return value;
}
