/**
 * Accessory specs are typed in the admin as one "Label: value" per line, because
 * accessory types (printers, drawers, scanners, paper) have different specs.
 * Pure: no database access, so it is unit tested directly.
 */
export type SpecLine = { label: string; value: string };

export const MAX_SPEC_LINES = 40;

/** Rows from the admin text. Lines without a label and a value are skipped. Splits at the first ":" so values may contain ":". */
export function parseSpecLines(text: string | null | undefined): SpecLine[] {
  const rows: SpecLine[] = [];
  for (const raw of (text ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    const at = line.indexOf(":");
    if (at <= 0) continue;
    const label = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();
    if (!label || !value) continue;
    rows.push({ label, value });
    if (rows.length >= MAX_SPEC_LINES) break;
  }
  return rows;
}
