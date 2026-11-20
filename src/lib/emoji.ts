/**
 * Emoji detection for stored copy. The site uses Lucide icons only and never
 * emoji (DESIGN.md §10), so admin forms refuse them and prisma/strip-emoji.ts
 * cleans what is already in the database.
 *
 * The same pictographic test is used in eslint.config.mjs for source code.
 * (c), (r) and TM are legal marks, not emoji. Zero-width characters are not
 * touched on their own: edit mode uses them as invisible markers
 * (lib/editMode.ts).
 */

const PICTOGRAPH = String.raw`(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}`;

/** One emoji with its modifiers: variation selector, keycap, skin tone, ZWJ sequence. */
const EMOJI_SEQUENCE = new RegExp(
  String.raw`${PICTOGRAPH}(?:[\uFE0F\u20E3\u{1F3FB}-\u{1F3FF}]|\u200D\p{Extended_Pictographic})*|\p{Regional_Indicator}{2}|[\uFE0F\u20E3]`,
  "u",
);

/** True when the text contains an emoji. */
export function hasEmoji(text: string): boolean {
  return EMOJI_SEQUENCE.test(text);
}

/** Removes every emoji (and one space after it) from the text. */
export function stripEmoji(text: string): string {
  return text.replace(new RegExp(`(?:${EMOJI_SEQUENCE.source})[ \\t]?`, "gu"), "");
}

/** The name of the first text field in a submitted form that contains an emoji, if any. */
export function firstEmojiField(formData: FormData): string | null {
  for (const [name, value] of formData.entries()) {
    if (typeof value === "string" && hasEmoji(value)) return name;
  }
  return null;
}

/**
 * Error message for a form that contains an emoji, or null when it is clean.
 * Admin actions return it as their error state so nothing is saved.
 */
export function emojiFormError(formData: FormData): string | null {
  const field = firstEmojiField(formData);
  if (!field) return null;
  return `ช่อง "${field}" มี emoji ซึ่งใช้ไม่ได้ (เว็บนี้ใช้ไอคอน Lucide เท่านั้น) ลบ emoji ออกแล้วบันทึกอีกครั้ง ยังไม่ได้บันทึกอะไร`;
}

/** Same check for values saved outside a form (edit-on-site). */
export function emojiValuesError(values: Record<string, string | undefined>): string | null {
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "string" && hasEmoji(value)) {
      return `ข้อความภาษา ${name} มี emoji ซึ่งใช้ไม่ได้ (เว็บนี้ใช้ไอคอน Lucide เท่านั้น) ยังไม่ได้บันทึก`;
    }
  }
  return null;
}
