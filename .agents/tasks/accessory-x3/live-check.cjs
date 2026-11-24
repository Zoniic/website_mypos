// READ-ONLY browser check against the real database (server on :3100). Writes nothing to the DB:
// no admin edits, no form submits. The quote list lives in the browser only.
const { chromium } = require(process.env.PW_PATH);
const fs = require("fs");
const path = require("path");
const base = "http://localhost:3100";
const out = process.env.OUT;
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (id, name, ok, detail) => {
  results.push({ id, name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail !== undefined ? "  [" + String(detail).slice(0, 200).replace(/\s+/g, " ") + "]" : ""}`);
};

(async () => {
  const browser = await chromium.launch();
  const v = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  const errors = [];
  v.on("pageerror", (e) => errors.push(`${v.url()} :: ${e.message}`));
  v.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`${v.url()} :: ${m.text()}`); });

  let r = await v.goto(base + "/th/accessories");
  await v.locator('main a[href^="/th/accessories/"]').first().waitFor({ timeout: 15000 });
  const n = await v.locator('main a[href^="/th/accessories/"]').count();
  check("L1", "list page: every card is a link", r.status() === 200 && n === 9, n);
  const fm = v.locator('a[href="/th/accessories/mypos-fm2200"]').locator("xpath=..").locator("button[aria-pressed]");
  await fm.click();
  await v.waitForTimeout(300);
  check("L2", "+ adds to the quote list", (await fm.getAttribute("aria-pressed")) === "true");
  await v.screenshot({ path: path.join(out, "live-list.png"), fullPage: true });

  for (const slug of ["mypos-c300h", "mypos-f-330k", "mypos-fm2200", "mypos-label9210", "mypos-acc03", "mypos-scale-acs", "mypos-imo-printer", "mypos-pager-20-pcs", "mypos-pager-30-pcs"]) {
    r = await v.goto(`${base}/th/accessories/${slug}`);
    const h1 = await v.locator("h1").innerText().catch(() => "");
    check(`D-${slug}`, "detail page 200 with a name", r.status() === 200 && h1.length > 0, `${r.status()} ${h1}`);
  }
  await v.goto(base + "/th/accessories/mypos-c300h");
  await v.screenshot({ path: path.join(out, "live-detail.png"), fullPage: true });

  for (const locale of ["en", "zh"]) {
    r = await v.goto(`${base}/${locale}/accessories/mypos-c300h`);
    check(`I-${locale}`, `${locale} detail page 200`, r.status() === 200, r.status());
  }
  r = await v.goto(base + "/th/products/mypos-k156");
  check("P1", "product page still 200", r.status() === 200, r.status());
  await v.locator("button[aria-pressed]", { hasText: /เปรียบเทียบ|ใบเสนอราคา/ }).first().click();
  await v.waitForTimeout(300);

  await v.goto(base + "/th/compare");
  await v.waitForTimeout(800);
  const table = await v.locator("table").innerText().catch(() => "");
  check("C1", "quote list shows type column and both kinds", /ประเภท/.test(table) && /อุปกรณ์เสริม/.test(table) && /เครื่อง/.test(table), table);
  check("C2", "accessory without price shows สอบถามราคา", /สอบถามราคา/.test(table));
  await v.screenshot({ path: path.join(out, "live-compare.png"), fullPage: true });

  r = await v.goto(base + "/th/accessories/no-such-accessory");
  check("R1", "unknown accessory 404", r.status() === 404, r.status());
  const legacy = await v.request.get(base + "/products/FM2200.php", { maxRedirects: 0 });
  check("R2", "FM2200.php redirects to the accessory page", /\/accessories\/mypos-fm2200$/.test(legacy.headers()["location"] || ""), `${legacy.status()} ${legacy.headers()["location"]}`);
  const sm = await (await v.request.get(base + "/sitemap.xml")).text();
  check("R3", "sitemap lists accessory pages", /\/accessories\/mypos-c300h</.test(sm));
  r = await v.goto(base + "/th");
  check("H1", "home page 200", r.status() === 200, r.status());
  check("Z1", "no page errors", errors.length === 0, errors.join(" | "));

  fs.writeFileSync(path.join(out, "live-results.json"), JSON.stringify(results, null, 1));
  const failed = results.filter((x) => !x.ok).length;
  console.log(`DONE pass=${results.length - failed} fail=${failed}`);
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})().catch((e) => { console.error("CRASH", e); process.exitCode = 2; });
