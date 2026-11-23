// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/leadlist-selftest.ts
// Pure logic only: no database access.
import {
  contactWhere,
  leadPagination,
  leadQueryString,
  parseLeadDetails,
  parseLeadParams,
  quoteWhere,
} from "../../../src/lib/leadList";

let failed = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) failed++;
  console.log(`${a === e ? "pass" : "FAIL"}  ${name}${a === e ? "" : `\n  got      ${a}\n  expected ${e}`}`);
}

const empty = parseLeadParams("contact", {});
check("defaults", empty, { q: "", assignee: "all", page: 1 });
check("bad page text", parseLeadParams("contact", { page: "abc" }).page, 1);
check("page 0", parseLeadParams("contact", { page: "0" }).page, 1);
check("page negative", parseLeadParams("contact", { page: "-3" }).page, 1);
check("page decimal", parseLeadParams("contact", { page: "2.5" }).page, 1);
check("page huge", parseLeadParams("contact", { page: "99999999999" }).page, 1);
check("page ok", parseLeadParams("contact", { page: "7" }).page, 7);
check("unknown status", parseLeadParams("contact", { status: "bogus" }).status, undefined);
check("status of other kind", parseLeadParams("contact", { status: "open" }).status, undefined);
check("warranty status", parseLeadParams("warranty", { status: "open" }).status, "open");
check("array param uses first", parseLeadParams("contact", { status: ["closed", "new"] }).status, "closed");
check("bad from date", parseLeadParams("contact", { from: "2026-13-40" }).from, undefined);
check("non-existent day", parseLeadParams("contact", { from: "2026-02-30" }).from, undefined);
check("garbage date", parseLeadParams("contact", { to: "yesterday" }).to, undefined);
check("good date", parseLeadParams("contact", { from: "2026-02-28" }).from, "2026-02-28");
check("assignee none", parseLeadParams("contact", { assignee: "none" }).assignee, "none");
check("assignee id", parseLeadParams("contact", { assignee: "12" }).assignee, 12);
check("assignee zero", parseLeadParams("contact", { assignee: "0" }).assignee, "all");
check("assignee junk", parseLeadParams("contact", { assignee: "1; DROP" }).assignee, "all");
check("topic only for contact", parseLeadParams("quote", { topic: "demo" }).topic, undefined);
check("unknown topic", parseLeadParams("contact", { topic: "x" }).topic, undefined);
check("q trimmed", parseLeadParams("contact", { q: "  สมชาย " }).q, "สมชาย");
check("q capped", parseLeadParams("contact", { q: "a".repeat(500) }).q.length, 100);

check("pagination empty", leadPagination(1, 0), { page: 1, pageCount: 1, total: 0, skip: 0 });
check("pagination 25", leadPagination(1, 25).pageCount, 1);
check("pagination 26", leadPagination(1, 26).pageCount, 2);
check("pagination clamps high", leadPagination(99, 60), { page: 3, pageCount: 3, total: 60, skip: 50 });

const p = parseLeadParams("contact", { status: "new", q: "a b", page: "3", from: "2026-01-01", assignee: "4" });
check("query string keeps filters", leadQueryString(p), "status=new&q=a+b&assignee=4&from=2026-01-01&page=3");
check("query string page override", leadQueryString(p, { page: 1 }), "status=new&q=a+b&assignee=4&from=2026-01-01");

const w = contactWhere(parseLeadParams("contact", { to: "2026-01-31", assignee: "none", status: "closed" })) as {
  createdAt?: { lt?: Date };
  assigneeId?: null;
  status?: string;
};
check("where to is exclusive next day (Bangkok)", w.createdAt?.lt?.toISOString(), "2026-01-31T17:00:00.000Z");
check("where unassigned", w.assigneeId, null);
check("where status", w.status, "closed");
check("quote search covers items", JSON.stringify(quoteWhere(parseLeadParams("quote", { q: "x" }))).includes("productName"), true);

function form(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}
check("details empty", parseLeadDetails(form({})), { ok: true, value: { adminNote: null, assigneeId: null } });
check("details trims", parseLeadDetails(form({ adminNote: "  hi  ", assigneeId: "3" })), { ok: true, value: { adminNote: "hi", assigneeId: 3 } });
check("details note too long", parseLeadDetails(form({ adminNote: "x".repeat(2001) })).ok, false);
check("details note 2000 ok", parseLeadDetails(form({ adminNote: "x".repeat(2000) })).ok, true);
check("details bad assignee", parseLeadDetails(form({ assigneeId: "abc" })).ok, false);
check("details file as note", parseLeadDetails(Object.assign(new FormData(), { get: (k: string) => (k === "adminNote" ? new Blob(["x"]) : null) }) as FormData).ok, false);

if (failed) {
  console.log(`${failed} failed`);
  process.exit(1);
}
console.log("all pass");
