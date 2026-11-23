// Logic check for src/lib/formInput.ts (no database needed).
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/formInput-selftest.ts
import { EMAIL_PATTERN, MAX, parseQuoteLines, textField } from "../../../src/lib/formInput";

let failed = 0;
function check(name: string, ok: boolean) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

const fd = new FormData();
fd.set("a", "  hello  ");
fd.set("long", "x".repeat(5000));
check("textField trims", textField(fd, "a", 50) === "hello");
check("textField caps length", textField(fd, "long", MAX.message).length === MAX.message);
check("textField missing key is empty", textField(fd, "nope", 10) === "");

check("email ok", EMAIL_PATTERN.test("a@b.co"));
check("email without domain dot rejected", !EMAIL_PATTERN.test("a@b"));
check("email with space rejected", !EMAIL_PATTERN.test("a b@c.com"));

const good = JSON.stringify([{ slug: "mypos-k1", name: "K1", quantity: 2 }]);
check("valid cart parses", parseQuoteLines(good)?.[0].quantity === 2);
check("not JSON rejected", parseQuoteLines("{oops") === null);
check("empty list rejected", parseQuoteLines("[]") === null);
check("null entry rejected (used to crash the action)", parseQuoteLines("[null]") === null);
check("missing slug rejected", parseQuoteLines(JSON.stringify([{ name: "x", quantity: 1 }])) === null);
check("51 lines rejected", parseQuoteLines(JSON.stringify(Array.from({ length: 51 }, () => ({ slug: "a", name: "b", quantity: 1 })))) === null);
check("quantity clamps low", parseQuoteLines(JSON.stringify([{ slug: "a", name: "b", quantity: -5 }]))?.[0].quantity === 1);
check("quantity clamps high", parseQuoteLines(JSON.stringify([{ slug: "a", name: "b", quantity: 100000 }]))?.[0].quantity === 999);
check("quantity text becomes 1", parseQuoteLines(JSON.stringify([{ slug: "a", name: "b", quantity: "abc" }]))?.[0].quantity === 1);
check("long name capped", parseQuoteLines(JSON.stringify([{ slug: "a", name: "n".repeat(900), quantity: 1 }]))?.[0].name.length === MAX.product);

console.log(failed === 0 ? "ALL PASSED" : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
