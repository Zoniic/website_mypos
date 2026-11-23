// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/csv-selftest.ts
import { csvDate, csvField, toCsv } from "../../../src/lib/csv";

let failed = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "pass" : "FAIL"}  ${name}${ok ? "" : `\n  got      ${JSON.stringify(actual)}\n  expected ${JSON.stringify(expected)}`}`);
}

check("plain", csvField("abc"), '"abc"');
check("quotes doubled", csvField('say "hi"'), '"say ""hi"""');
check("comma", csvField("a,b"), '"a,b"');
check("newline kept inside quotes", csvField("a\nb"), '"a\nb"');
check("crlf kept inside quotes", csvField("a\r\nb"), '"a\r\nb"');
check("thai", csvField("สมชาย ใจดี"), '"สมชาย ใจดี"');
check("formula =", csvField("=1+1"), `"'=1+1"`);
check("formula + phone", csvField("+66812345678"), `"'+66812345678"`);
check("formula -", csvField("-5"), `"'-5"`);
check("formula @", csvField("@x"), `"'@x"`);
check("formula after spaces", csvField("  =cmd"), `"'  =cmd"`);
check("leading tab", csvField("\tx"), `"'\tx"`);
check("leading CR", csvField("\rx"), `"'\rx"`);
check("dash inside is untouched", csvField("a-b"), '"a-b"');
check("null", csvField(null), '""');
check("undefined", csvField(undefined), '""');
check("number", csvField(3), '"3"');
check("date +07:00", csvDate(new Date("2026-01-01T20:00:00Z")), "2026-01-02T03:00:00+07:00");
const out = toCsv(["a", "b"], [["1", "x,y"], ["2", "=z"]]);
check("BOM first", out.charCodeAt(0), 0xfeff);
check("CRLF rows", out.slice(1), '"a","b"\r\n"1","x,y"\r\n"2","\'=z"\r\n');

if (failed) {
  console.log(`${failed} failed`);
  process.exit(1);
}
console.log("all pass");