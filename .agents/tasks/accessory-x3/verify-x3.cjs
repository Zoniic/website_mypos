// Browser check of X3 (accessories like products) against the SCRATCH stack on :3100.
// Run: verify-x3.ps1 (sets PW_PATH, OUT). Results: shots/results.json, printed PASS/FAIL lines.
const { chromium } = require(process.env.PW_PATH);
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const base = "http://localhost:3100";
const out = process.env.OUT;
fs.mkdirSync(out, { recursive: true });
const results = [];
function check(id, name, ok, detail) {
  results.push({ id, name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail !== undefined ? "  [" + String(detail).slice(0, 240).replace(/\s+/g, " ") + "]" : ""}`);
}
function sql(q) {
  return execFileSync("docker", ["exec", "mypos-scratch-pg", "psql", "-U", "scratch", "-d", "mypos_scratch", "-At", "-c", q], { encoding: "utf8" }).trim();
}
const shot = (page, name, full = true) => page.screenshot({ path: path.join(out, name + ".png"), fullPage: full });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`${page.url()} :: ${m.text()}`); });
  page.on("pageerror", (e) => consoleErrors.push(`${page.url()} :: pageerror ${e.message}`));

  // A1 admin: fill the new fields on C300H.
  await page.goto(base + "/admin/login");
  await page.fill("#email", "owner@scratch.test");
  await page.fill("#password", "scratch-only-Passw0rd");
  await page.click("button[type=submit]");
  await page.waitForTimeout(2500);
  const accId = sql(`SELECT id FROM "Accessory" WHERE slug = 'mypos-c300h'`);
  await page.goto(`${base}/admin/accessories/${accId}/edit`);
  check("A1", "admin edit form shows the new sections", (await page.locator("text=ราคาและสต็อก").count()) === 1 && (await page.locator("text=ใช้ได้กับเครื่องรุ่น").count()) >= 1);
  await page.fill("input[name=priceFrom]", "1234");
  await page.selectOption("select[name=stockStatus]", "preorder");
  await page.fill("input[name=leadTimeDays]", "7");
  await page.fill("input[name=videoUrl]", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.fill("textarea[name=specs_th]", "ประเภท: เครื่องพิมพ์ความร้อน\nหน้ากว้างกระดาษ: 80 mm\nบรรทัดผิดรูปแบบ\nการเชื่อมต่อ: USB, LAN");
  await page.fill("textarea[name=specs_en]", "Type: Thermal printer\nPaper width: 80 mm");
  await page.check("input[name=compatibleSlugs][value=mypos-k156]");
  await page.check("input[name=compatibleSlugs][value=mypos-k1]");
  await shot(page, "a1-admin-form");
  await Promise.all([page.waitForURL("**/admin/accessories", { timeout: 30000 }).catch(() => {}), page.click("button[type=submit]:has-text('บันทึก')")]);
  const row = sql(`SELECT "priceFrom", "stockStatus", "leadTimeDays", "videoUrl" IS NOT NULL FROM "Accessory" WHERE id = ${accId}`);
  check("A2", "saved price, stock, lead time and video", row === "1234|preorder|7|t", row);
  const links = sql(`SELECT string_agg(p.slug, ',' ORDER BY p.slug) FROM "_AccessoryCompatibleProducts" l JOIN "Product" p ON p.id = l."B" WHERE l."A" = ${accId}`);
  check("A3", "saved works-with machines", links === "mypos-k1,mypos-k156", links);
  const specs = sql(`SELECT specs FROM "AccessoryTranslation" WHERE "accessoryId" = ${accId} AND locale = 'th'`);
  check("A4", "saved Thai specs", specs.includes("หน้ากว้างกระดาษ: 80 mm"), specs);
  const audit = sql(`SELECT count(*) FROM "AuditLog" WHERE "entityType" = 'Accessory' AND "entityId" = '${accId}'`);
  check("A5", "change history row written", Number(audit) >= 1, audit);

  // Fresh visitor context for the public pages.
  const vctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const v = await vctx.newPage();
  v.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`${v.url()} :: ${m.text()}`); });
  v.on("pageerror", (e) => consoleErrors.push(`${v.url()} :: pageerror ${e.message}`));

  // L: list page.
  let r = await v.goto(base + "/th/accessories");
  check("L1", "list page 200", r.status() === 200, r.status());
  // The list streams in after the loading skeleton.
  await v.locator('main a[href="/th/accessories/mypos-c300h"]').waitFor({ timeout: 15000 });
  const cardLinks = await v.locator('main a[href^="/th/accessories/"]').count();
  check("L2", "every card links to its detail page", cardLinks === 9, cardLinks);
  const c300 = v.locator('a[href="/th/accessories/mypos-c300h"]');
  check("L3", "C300H card shows price and pre-order badge", /฿1,234/.test(await c300.innerText()) && /พรีออเดอร์/.test(await c300.innerText()), await c300.innerText());
  const fm = v.locator('a[href="/th/accessories/mypos-fm2200"]');
  check("L4", "card without price shows no price line", !/฿/.test(await fm.innerText()), await fm.innerText());
  const fmPlus = fm.locator("xpath=..").locator("button[aria-pressed]");
  await fmPlus.click();
  await v.waitForTimeout(300);
  check("L5", "+ button toggles to added", (await fmPlus.getAttribute("aria-pressed")) === "true");
  await shot(v, "l-list");

  // D: detail page.
  r = await v.goto(base + "/th/accessories/mypos-c300h");
  check("D1", "detail page 200", r.status() === 200, r.status());
  const h1 = await v.locator("h1").innerText();
  check("D2", "detail h1 is the accessory name", /C300H/i.test(h1), h1);
  const main = await v.locator("main").innerText();
  check("D3", "price and stock shown", /เริ่มต้น\s*฿1,234/.test(main) && /พรีออเดอร์/.test(main) && /7 วัน/.test(main));
  const chips = await v.locator('a[href="/th/products/mypos-k156"], a[href="/th/products/mypos-k1"]').count();
  check("D4", "works-with chips link to the machines", chips >= 2 && /ใช้ได้กับเครื่องรุ่น/.test(main), chips);
  const specRows = await v.locator("dl > div").count();
  check("D5", "spec list: 3 valid rows, bad line skipped", specRows === 3, specRows);
  check("D6", "video embedded", (await v.locator('iframe[src*="youtube"]').count()) === 1);
  check("D7", "related accessories strip", /อุปกรณ์ที่ใช้คู่กัน/.test(main));
  const cmpBtn = v.locator("button[aria-pressed]", { hasText: /เปรียบเทียบ|ใบเสนอราคา/ }).first();
  await cmpBtn.click();
  await v.waitForTimeout(300);
  check("D8", "add-to-quote button toggles", (await cmpBtn.getAttribute("aria-pressed")) === "true");
  const ld = await v.locator('script[type="application/ld+json"]').allInnerTexts();
  const productLd = ld.map((t) => JSON.parse(t)).find((j) => j["@type"] === "Product");
  check("D9", "Product JSON-LD with price 1234 and PreOrder", productLd && productLd.offers?.price === 1234 && /PreOrder/.test(productLd.offers?.availability), JSON.stringify(productLd?.offers));
  const quoteHref = await v.locator('a[href*="/contact?product=mypos-c300h"]').count();
  check("D10", "request-quote button links to the contact form", quoteHref >= 1, quoteHref);
  await shot(v, "d-detail-th");

  // Accessory without data: FM2200 has no price, no specs.
  r = await v.goto(base + "/th/accessories/mypos-fm2200");
  const fmTop = await v.locator('section[data-edit-admin="/admin/goto/accessory/mypos-fm2200"]').innerText();
  const fmDl = await v.locator("dl > div").count();
  check("D11", "detail without price/specs renders without empty sections", r.status() === 200 && !/เริ่มต้น\s*฿/.test(fmTop) && fmDl === 0, `status=${r.status()} dlRows=${fmDl} top=${fmTop.slice(0, 120)}`);
  await shot(v, "d-detail-fm2200");

  // P: product page lists the accessory.
  r = await v.goto(base + "/th/products/mypos-k156");
  const pMain = await v.locator("main").innerText();
  check("P1", "product page shows 'accessories for this machine' with C300H", /อุปกรณ์เสริมที่ใช้กับเครื่องนี้ได้/.test(pMain) && (await v.locator('a[href="/th/accessories/mypos-c300h"]').count()) === 1);
  r = await v.goto(base + "/th/products/mypos-f58");
  check("P2", "product without linked accessories has no such section", !/อุปกรณ์เสริมที่ใช้กับเครื่องนี้ได้/.test(await v.locator("main").innerText()));
  // Add a machine from its page.
  await v.goto(base + "/th/products/mypos-k156");
  await v.locator("button[aria-pressed]", { hasText: /เปรียบเทียบ|ใบเสนอราคา/ }).first().click();
  await v.waitForTimeout(300);

  // C: quote list.
  await v.goto(base + "/th/compare");
  await v.waitForTimeout(800);
  const rows = v.locator("tbody tr");
  check("C1", "quote list has 3 lines (2 accessories, 1 machine)", (await rows.count()) === 3, await rows.count());
  const table = await v.locator("table").innerText();
  check("C2", "type column shows เครื่อง and อุปกรณ์เสริม", /ประเภท/.test(table) && /เครื่อง/.test(table) && /อุปกรณ์เสริม/.test(table));
  check("C3", "accessory without price shows สอบถามราคา", /สอบถามราคา/.test(table));
  check("C4", "names link to the right detail pages", (await v.locator('tbody a[href="/th/accessories/mypos-fm2200"]').count()) === 1 && (await v.locator('tbody a[href="/th/products/mypos-k156"]').count()) === 1);
  await shot(v, "c-compare");
  await v.fill("#quote-name", "Scratch Test");
  await v.fill("#quote-phone", "0800000000");
  await v.fill("#quote-email", "scratch@example.com");
  await v.click("form button[type=submit]");
  await v.waitForTimeout(3000);
  const items = sql(`SELECT string_agg("productSlug" || 'x' || quantity, ',' ORDER BY id) FROM "QuoteRequestItem"`);
  check("C5", "quote request stored with all 3 lines", /mypos-fm2200x1/.test(items) && /mypos-c300hx1/.test(items) && /mypos-k156x1/.test(items), items);

  // Old saved list (no kind) still reads as machines.
  await v.evaluate(() => localStorage.setItem("mypos-quote-cart", JSON.stringify([{ slug: "mypos-K1", name: "K1 old", priceFrom: 100, quantity: 2 }])));
  await v.goto(base + "/th/compare");
  await v.waitForTimeout(800);
  const oldTable = await v.locator("table").innerText().catch(() => "");
  check("C6", "old saved list loads as a machine line", /K1 old/.test(oldTable) && /เครื่อง/.test(oldTable) && (await v.locator('tbody a[href="/th/products/mypos-k1"]').count()) === 1, oldTable);

  // R: routing.
  r = await v.goto(base + "/th/accessories/no-such-accessory");
  check("R1", "unknown accessory slug returns 404", r.status() === 404, r.status());
  const resp = await v.request.get(base + "/th/accessories/MYPOS-C300H", { maxRedirects: 0 });
  check("R2", "old-style slug redirects 308 to the stored slug", resp.status() === 308 && /\/th\/accessories\/mypos-c300h$/.test(resp.headers()["location"] || ""), `${resp.status()} ${resp.headers()["location"]}`);
  const legacy = await v.request.get(base + "/products/FM2200.php", { maxRedirects: 0 });
  check("R3", "old site FM2200.php redirects to the accessory page", [301, 307, 308].includes(legacy.status()) && /\/accessories\/mypos-fm2200$/.test(legacy.headers()["location"] || ""), `${legacy.status()} ${legacy.headers()["location"]}`);
  const sitemap = await (await v.request.get(base + "/sitemap.xml")).text();
  check("R4", "sitemap lists accessory pages", /\/th\/accessories\/mypos-c300h</.test(sitemap));

  // I: other languages.
  r = await v.goto(base + "/en/accessories/mypos-c300h");
  const en = await v.locator("main").innerText();
  check("I1", "English page uses English copy and English specs", r.status() === 200 && /Works with/.test(en) && /Paper width/.test(en), r.status());
  r = await v.goto(base + "/zh/accessories/mypos-c300h");
  const zh = await v.locator("main").innerText();
  check("I2", "Chinese page uses Chinese copy", r.status() === 200 && /适用机型/.test(zh), r.status());
  await v.goto(base + "/zh/compare");
  await v.waitForTimeout(800);
  check("I3", "Chinese quote list type column", /类型/.test(await v.locator("table").innerText().catch(() => "")));

  // M: mobile layout.
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const m = await mctx.newPage();
  await m.goto(base + "/th/accessories/mypos-c300h");
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("M1", "detail page has no sideways scroll at 390 px", overflow <= 1, overflow);
  await shot(m, "m-detail");
  await m.goto(base + "/th/accessories");
  check("M2", "list page has no sideways scroll at 390 px", (await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1);
  await shot(m, "m-list");

  const relevant = consoleErrors.filter((e) => !/favicon|Failed to load resource.*(404|net::ERR)/.test(e));
  check("Z1", "no console errors on the visited pages", relevant.length === 0, relevant.join(" | "));

  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(results, null, 1));
  const failed = results.filter((x) => !x.ok).length;
  console.log(`DONE pass=${results.length - failed} fail=${failed}`);
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})().catch((e) => {
  console.error("CRASH", e);
  process.exitCode = 2;
});
