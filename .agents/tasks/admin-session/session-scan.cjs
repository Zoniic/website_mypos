// Admin session scan over plain http on a LAN address (as on the owner's test server).
// After every step: still signed in? session cookie still present? Scratch stack only.
const { chromium } = require(process.env.PW_PATH);
const base = process.env.BASE;
const issues = [];
let steps = 0;
const bad = (where, what) => { issues.push(`${where} :: ${what}`); console.log(`FAIL ${where} :: ${what}`); };

async function signedIn(page, ctx, where) {
  steps++;
  const url = page.url();
  const cookie = (await ctx.cookies()).find((c) => c.name === "mypos_admin_session");
  if (url.includes("/admin/login")) bad(where, `sent to login (${url.replace(base, "")})`);
  else if (!cookie) bad(where, "session cookie gone");
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.dismiss());
  await page.goto(base + "/admin/login");
  await page.fill("#email", "owner@scratch.test");
  await page.fill("#password", "scratch-only-Passw0rd");
  await page.click("button[type=submit]");
  await page.waitForTimeout(3000);
  await signedIn(page, ctx, "after login");
  const ck = (await ctx.cookies()).find((c) => c.name === "mypos_admin_session");
  console.log(`cookie secure=${ck?.secure} expires=${ck ? new Date(ck.expires * 1000).toISOString() : "-"}`);

  // Every sidebar link: client-side click, then a hard refresh.
  const hrefs = await page.locator("aside a[href^='/admin'], nav a[href^='/admin']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  console.log(`sidebar links: ${hrefs.length}`);
  for (const href of hrefs) {
    if (/logout|\/admin\/live/.test(href)) continue;
    await page.goto(base + "/admin");
    await page.waitForTimeout(800);
    const link = page.locator(`a[href="${href}"]`).first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.waitForTimeout(1500);
      await signedIn(page, ctx, `click ${href}`);
    }
    await page.reload();
    await page.waitForTimeout(1200);
    await signedIn(page, ctx, `refresh ${href}`);
  }

  // Lead pages: status change, note save, filter, pager, export, auto-refresh.
  for (const path of ["/admin/quote-requests", "/admin/contact-messages", "/admin/warranty-claims", "/admin/orders"]) {
    await page.goto(base + path);
    await page.waitForTimeout(1500);
    const sel = page.locator("main select").first();
    if (await sel.count()) {
      const opts = await sel.locator("option").evaluateAll((o) => o.map((x) => x.value));
      const cur = await sel.inputValue();
      const next = opts.find((v) => v && v !== cur);
      if (next) { await sel.selectOption(next); await page.waitForTimeout(2000); await signedIn(page, ctx, `${path} change select`); await sel.selectOption(cur).catch(() => {}); await page.waitForTimeout(1500); }
    }
    // The note box opens from a toggle; open the first one if it is closed.
    const toggle = page.locator("main summary, main button", { hasText: /โน้ต|บันทึกภายใน|note/i }).first();
    if (await toggle.count()) await toggle.click().catch(() => {});
    await page.waitForTimeout(300);
    const note = page.locator("main textarea:visible").first();
    if (await note.count()) {
      await note.fill(`scan note ${Date.now()}`);
      const btn = note.locator("xpath=ancestor::form[1]").locator("button[type=submit]").first();
      if (await btn.count()) { await btn.click(); await page.waitForTimeout(2500); await signedIn(page, ctx, `${path} save note`); }
    }
    const search = page.locator("main input[type=search], main input[name=q]").first();
    if (await search.count()) {
      await search.fill("Sample");
      await search.press("Enter");
      await page.waitForTimeout(2000);
      await signedIn(page, ctx, `${path} search`);
    }
    const detail = page.locator("main a[href^='/admin/orders/']").first();
    if (await detail.count()) { await detail.click(); await page.waitForTimeout(1500); await signedIn(page, ctx, `${path} open detail`); await page.reload(); await page.waitForTimeout(1200); await signedIn(page, ctx, `${path} refresh detail`); }
  }
  await page.goto(base + "/admin/quote-requests");
  await page.waitForTimeout(36000);
  await signedIn(page, ctx, "after 36 s on quote requests (auto-refresh)");
  const r = await page.request.get(base + "/admin/quote-requests/export");
  if (r.status() !== 200) bad("export CSV", `status ${r.status()}`);

  // New tab (same browser), as when opening a link from another tab.
  const tab = await ctx.newPage();
  await tab.goto(base + "/admin/quote-requests");
  await tab.waitForTimeout(1500);
  await signedIn(tab, ctx, "new tab /admin/quote-requests");

  // Close and reopen the browser profile state: cookie must persist (not a session cookie).
  const state = await ctx.storageState();
  const ctx2 = await browser.newContext({ storageState: state });
  const p2 = await ctx2.newPage();
  await p2.goto(base + "/admin/quote-requests");
  await p2.waitForTimeout(1500);
  await signedIn(p2, ctx2, "reopened browser");

  console.log(`DONE steps=${steps} problems=${issues.length}`);
  await browser.close();
  process.exitCode = issues.length ? 1 : 0;
})().catch((e) => { console.error("CRASH", e); process.exitCode = 2; });
