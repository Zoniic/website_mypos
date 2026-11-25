// Quick check of alertLink(); prints PASS/FAIL lines.
import { alertLink } from "../../../src/lib/alertLink";

const cases: [string, string, string][] = [
  [alertLink("/admin/quote-requests", "email", ""), "https://mypos.co.th/admin/quote-requests", "empty base falls back"],
  [alertLink("/admin/quote-requests", "line", "http://192.168.0.109:3000/"), "http://192.168.0.109:3000/admin/quote-requests?openExternalBrowser=1", "line link, trailing slash trimmed"],
  [alertLink("/admin/orders?status=paid", "line", "http://h:3000"), "http://h:3000/admin/orders?status=paid&openExternalBrowser=1", "existing query"],
  [alertLink("admin/orders/1", "email", "http://h:3000"), "http://h:3000/admin/orders/1", "missing leading slash"],
];
let failed = 0;
for (const [got, want, name] of cases) {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `: got ${got}`}`);
}
process.exitCode = failed ? 1 : 0;
