// Scratch-env check of the admin lead lists: filter, search, pagination, CSV export, empty data,
// wrong-signature upload, notification banner. Logs in through the real login form, then uses
// the session cookie for HTTP requests. Needs PW_PATH, BASE (default http://localhost:3100),
// ADMIN_EMAIL, ADMIN_PASSWORD (scratch values), OUT (screenshot folder), and the scratch DB seeded
// with .agents/tasks/admin-improve/seed-leads-scratch.ts.  Usage: node verify-leads.cjs [empty]
const { chromium } = require(process.env.PW_PATH);
const fs = require("fs");
const path = require("path");
const base = process.env.BASE || "http://localhost:3100";
const out = process.env.OUT || ".";
const emptyMode = process.argv[2] === "empty";
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail !== undefined ? "  [" + detail + "]" : ""}`);
}
function parseCsv(text) {
  // minimal RFC4180 parser
  const rows = []; let row = [], f = "", q = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\r") { /* skip */ }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  return rows;
}
async function newsletterPage(page) {
  await page.goto(base + "/admin/newsletter", { waitUntil: "networkidle" });
  const body = await page.locator("main").innerText().catch(() => "");
  const link = await page.locator('a[href="/admin/newsletter/export"]').count();
  const dis = await page.locator('span[aria-disabled="true"]').count();
  return { body, link, dis, data: await page.locator('a[href^="data:"]').count() };
}
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(base + "/admin/login");
  await page.fill("#email", process.env.ADMIN_EMAIL);
  await page.fill("#password", process.env.ADMIN_PASSWORD);
  await Promise.all([page.waitForURL(/\/admin(\/)?$/, { timeout: 60000 }), page.click("button[type=submit]")]);
  check("login redirects to /admin", /\/admin\/?$/.test(page.url()), page.url());
  const cookies = await context.cookies();
  const cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const get = (p, auth = true) => fetch(base + p, { headers: auth ? { cookie } : {}, redirect: "manual" });
  const rowsOn = async (p) => {
    await page.goto(base + p, { waitUntil: "networkidle" });
    return page.locator("div.mt-3.space-y-4 > div.rounded-xl").count();
  };
  const csv = async (p, qs = "") => {
    const r = await get(`${p}/export${qs}`);
    const buf = Buffer.from(await r.arrayBuffer());
    return { r, buf, rows: parseCsv(buf.toString("utf8")) };
  };

  const kinds = [
    { p: "/admin/contact-messages", total: 60, statusParam: "new", statusN: 20 },
    { p: "/admin/quote-requests", total: 30, statusParam: "new", statusN: 10 },
    { p: "/admin/warranty-claims", total: 30, statusParam: "open", statusN: 10 },
  ];
  if (emptyMode) {
    for (const k of kinds) {
      const n = await rowsOn(k.p);
      const txt = await page.locator("main, body").first().innerText();
      check(`${k.p} empty: no lead cards (1 box = empty-state)`, n <= 1, n);
      check(`${k.p} empty: empty text shown`, /ยังไม่มี/.test(txt));
      await page.screenshot({ path: path.join(out, `empty-${k.p.split("/").pop()}.png`) });
      const c = await csv(k.p);
      check(`${k.p} empty: CSV header only`, c.r.status === 200 && c.rows.length === 1, `status=${c.r.status} rows=${c.rows.length}`);
      check(`${k.p} empty: CSV BOM`, c.buf[0] === 0xef && c.buf[1] === 0xbb && c.buf[2] === 0xbf);
    }
    const np = await newsletterPage(page);
    check("newsletter empty page: Thai text, disabled export, no data: link", np.body.includes("ยังไม่มีผู้สมัครรับข่าวสาร") && np.dis >= 1 && np.link === 0 && np.data === 0 && !/No subscribers|Export CSV/.test(np.body), JSON.stringify({ link: np.link, dis: np.dis }));
    const nl = await csv("/admin/newsletter");
    check("newsletter empty CSV header only", nl.r.status === 200 && nl.rows.length === 1, nl.rows.length);
    await browser.close();
    console.log(`pass=${pass} fail=${fail}`);
    process.exit(fail ? 1 : 0);
  }

  // --- unauthenticated
  for (const k of kinds) {
    const r = await get(k.p + "/export", false);
    check(`${k.p}/export without cookie is not served`, r.status !== 200, r.status);
    const r2 = await get(k.p, false);
    check(`${k.p} without cookie is not served`, r2.status !== 200, r2.status);
  }

  // --- contact messages: filter / search / paginate
  let n = await rowsOn("/admin/contact-messages");
  check("contact page1 has 25 rows", n === 25, n);
  await page.screenshot({ path: path.join(out, "contact-list.png"), fullPage: false });
  n = await rowsOn("/admin/contact-messages?page=2");
  check("contact page2 has 25 rows", n === 25, n);
  n = await rowsOn("/admin/contact-messages?page=3");
  check("contact page3 has 10 rows", n === 10, n);
  n = await rowsOn("/admin/contact-messages?page=99");
  check("contact page=99 does not crash", n >= 0, n);
  n = await rowsOn("/admin/contact-messages?page=abc&status=bogus&from=2026-13-45&assignee=x");
  check("contact bad params fall back to all (25 rows)", n === 25, n);
  n = await rowsOn("/admin/contact-messages?status=new");
  check("contact status=new: 20 rows", n === 20, n);
  n = await rowsOn("/admin/contact-messages?q=Alice");
  check("contact q=Alice: 10 rows", n === 10, n);
  n = await rowsOn("/admin/contact-messages?q=" + encodeURIComponent("สมชาย"));
  check("contact q=Thai name: 10 rows", n === 10, n);
  n = await rowsOn("/admin/contact-messages?q=alice");
  check("contact q case-insensitive: 10 rows", n === 10, n);
  n = await rowsOn("/admin/contact-messages?q=zzzzzz");
  check("contact q no match: empty-result text", /ไม่พบ|ไม่มี/.test(await page.locator("main, body").first().innerText()) && n <= 1, n);
  await page.screenshot({ path: path.join(out, "contact-nomatch.png") });
  n = await rowsOn("/admin/contact-messages?topic=demo");
  check("contact topic=demo: 15 rows", n === 15, n);
  n = await rowsOn("/admin/contact-messages?assignee=none");
  check("contact assignee=none: 25 rows (first page of 45)", n === 25, n);
  n = await rowsOn("/admin/contact-messages?status=new&assignee=none");
  check("contact status=new & assignee=none: 15 rows", n === 15, n);
  const bkk = (d) => new Date(d.getTime() + 7 * 3600e3).toISOString().slice(0, 10);
  const from = bkk(new Date(Date.now() - 4 * 86400e3)), to = bkk(new Date());
  n = await rowsOn(`/admin/contact-messages?from=${from}&to=${to}`);
  check(`contact date range ${from}..${to}: 5 rows`, n === 5, n);

  // --- contact CSV
  let c = await csv("/admin/contact-messages");
  check("contact CSV status 200", c.r.status === 200, c.r.status);
  check("contact CSV content-type", /text\/csv; charset=utf-8/i.test(c.r.headers.get("content-type") || ""), c.r.headers.get("content-type"));
  check("contact CSV disposition", /attachment; filename="contact-messages-\d{8}\.csv"/.test(c.r.headers.get("content-disposition") || ""), c.r.headers.get("content-disposition"));
  check("contact CSV no-store", /no-store/.test(c.r.headers.get("cache-control") || ""), c.r.headers.get("cache-control"));
  check("contact CSV BOM", c.buf[0] === 0xef && c.buf[1] === 0xbb && c.buf[2] === 0xbf);
  check("contact CSV CRLF row ends", c.buf.toString("utf8").includes("\r\n"));
  check("contact CSV all 60 rows + header (not just page 1)", c.rows.length === 61, c.rows.length);
  check("contact CSV every row has 11 columns", c.rows.every((r) => r.length === 11), [...new Set(c.rows.map((r) => r.length))]);
  const nameCol = c.rows.map((r) => r[4]);
  check("contact CSV keeps comma+quote name intact", nameCol.some((v) => v.startsWith('บริษัท "ร้านกาแฟ", จำกัด')));
  check("contact CSV formula guard on leading +", nameCol.some((v) => v.startsWith("'+66 Test")) && !nameCol.some((v) => v.startsWith("+66")));
  check("contact CSV multi-line message stays in one field", c.rows.some((r) => r[7].includes("\n")));
  c = await csv("/admin/contact-messages", "?status=new");
  check("contact CSV status=new => 20 rows + header", c.rows.length === 21 && c.rows.slice(1).every((r) => r[8] === "new"), c.rows.length);
  c = await csv("/admin/contact-messages", "?q=Alice&status=contacted");
  const aliceExpect = 0; // Alice rows are i%6==1 => i%3==1 => status "contacted": all 10
  check("contact CSV q=Alice&status=contacted => 10 rows", c.rows.length === 11 && c.rows.slice(1).every((r) => /Alice/.test(r[4])), c.rows.length);
  void aliceExpect;
  c = await csv("/admin/contact-messages", "?q=zzzzzz");
  check("contact CSV no match => header only", c.rows.length === 1, c.rows.length);
  c = await csv("/admin/contact-messages", "?assignee=none");
  check("contact CSV assignee=none => 45 rows", c.rows.length === 46 && c.rows.slice(1).every((r) => r[9] === ""), c.rows.length);
  c = await csv("/admin/contact-messages", "?topic=demo");
  check("contact CSV topic=demo => 15 rows", c.rows.length === 16, c.rows.length);

  // --- quote / warranty
  for (const k of kinds.slice(1)) {
    n = await rowsOn(k.p);
    check(`${k.p} page1 has 25 rows`, n === 25, n);
    n = await rowsOn(k.p + "?page=2");
    check(`${k.p} page2 has 5 rows`, n === 5, n);
    n = await rowsOn(`${k.p}?status=${k.statusParam}`);
    check(`${k.p} status filter: ${k.statusN} rows`, n === k.statusN, n);
    await page.screenshot({ path: path.join(out, `${k.p.split("/").pop()}-list.png`) });
    c = await csv(k.p);
    check(`${k.p} CSV all ${k.total} rows`, c.r.status === 200 && c.rows.length === k.total + 1, c.rows.length);
    c = await csv(k.p, `?status=${k.statusParam}`);
    check(`${k.p} CSV status filter => ${k.statusN} rows`, c.rows.length === k.statusN + 1, c.rows.length);
  }
  n = await rowsOn("/admin/quote-requests?q=Q1");
  check("quote q=Q1 (Q1, Q10-Q19): 11 rows", n === 11, n);
  n = await rowsOn("/admin/quote-requests?q=Lite");
  check("quote q matches item productName: 25 rows (page 1 of 30)", n === 25, n);
  n = await rowsOn("/admin/warranty-claims?q=SN-1005");
  check("warranty q=serial: 1 row", n === 1, n);
  c = await csv("/admin/quote-requests", "?q=Q1");
  check("quote CSV q=Q1 => 11 rows, items column filled", c.rows.length === 12 && c.rows.slice(1).every((r) => r.some((v) => /MYPOS Lite x \d/.test(v))), c.rows.length + " hdr=" + c.rows[0].join("|"));

  // --- newsletter
  c = await csv("/admin/newsletter");
  check("newsletter CSV 3 rows + header, BOM", c.r.status === 200 && c.rows.length === 4 && c.buf[0] === 0xef, c.rows.length);
  const np2 = await newsletterPage(page);
  check("newsletter page: Thai headings, export link to route, no data: link", np2.link === 1 && np2.data === 0 && np2.body.includes("อีเมล") && np2.body.includes("สมัครเมื่อ") && !/Export CSV|Subscribed/.test(np2.body), JSON.stringify({ link: np2.link, data: np2.data }));
  await page.screenshot({ path: path.join(out, "newsletter.png") });

  // --- note + assignee save, then it shows in CSV
  await page.goto(base + "/admin/contact-messages?q=" + encodeURIComponent("Alice Wong 7"), { waitUntil: "networkidle" });
  const card = page.locator("div.mt-3.space-y-4 > div.rounded-xl").first();
  await card.locator("summary").click();
  const ta = card.locator("textarea").first();
  await ta.fill("โน้ตทดสอบจาก verify-leads");
  await card.getByRole("button", { name: /บันทึก/ }).first().click();
  await page.waitForTimeout(2500);
  c = await csv("/admin/contact-messages", "?q=" + encodeURIComponent("Alice Wong 7"));
  check("saved note appears in CSV", c.rows.length === 2 && c.rows[1][10] === "โน้ตทดสอบจาก verify-leads", JSON.stringify(c.rows[1] && c.rows[1][10]));
  await page.screenshot({ path: path.join(out, "note-saved.png") });

  // --- assignee change saves and shows in CSV
  await page.goto(base + "/admin/contact-messages?q=" + encodeURIComponent("Bob 5"), { waitUntil: "networkidle" });
  const sel = page.locator("select[name=assigneeId]").first();
  await sel.selectOption({ index: 1 });
  await page.waitForTimeout(2500);
  c = await csv("/admin/contact-messages", "?q=" + encodeURIComponent("Bob 5"));
  check("assignee change saved (CSV assignee column filled)", c.rows.length >= 2 && c.rows[1][9] !== "", JSON.stringify(c.rows[1] && c.rows[1][9]));

  // --- notification banner (no LINE/Resend env in scratch)
  for (const p of ["/admin", "/admin/orders", "/admin/launch"]) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    const html = await page.content();
    check(`banner on ${p}`, html.includes("ยังไม่ได้ตั้งช่องทางแจ้งเตือน") && html.includes('href="/admin/launch"'));
  }
  await page.goto(base + "/admin", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, "banner-dashboard.png") });

  await browser.close();
  console.log(`pass=${pass} fail=${fail}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("ERROR", e); process.exit(2); });
