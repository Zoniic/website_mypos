/** CSV helpers for admin exports: RFC 4180 quoting, formula-injection guard, UTF-8 BOM for Excel. */

const BOM = "\uFEFF";

/** Dates are written as ISO 8601 in Asia/Bangkok (+07:00, no DST). */
export function csvDate(date: Date | null | undefined): string {
  if (!date) return "";
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${shifted.toISOString().slice(0, 19)}+07:00`;
}

/**
 * Neutralizes spreadsheet formulas (OWASP CSV injection): a value whose first
 * non-space character is = + - @ , or that starts with a tab or CR, gets a
 * leading apostrophe so Excel/Sheets treat it as text.
 */
function guardFormula(text: string): string {
  const first = text.trimStart().charAt(0);
  if (/^[=+\-@]$/.test(first) || text.startsWith("\t") || text.startsWith("\r")) return `'${text}`;
  return text;
}

/** One quoted field: always wrapped in double quotes, inner quotes doubled, newlines kept inside. */
export function csvField(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const text = value instanceof Date ? csvDate(value) : String(value);
  return `"${guardFormula(text).replace(/"/g, '""')}"`;
}

/** Builds the whole file: BOM, header row, data rows, CRLF row ends. */
export function toCsv(header: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [header, ...rows].map((row) => row.map(csvField).join(","));
  return `${BOM}${lines.join("\r\n")}\r\n`;
}

/** `text/csv` download response. `name` is a fixed server-side prefix, never user input. */
export function csvResponse(name: string, body: string): Response {
  const day = csvDate(new Date()).slice(0, 10).replace(/-/g, "");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}