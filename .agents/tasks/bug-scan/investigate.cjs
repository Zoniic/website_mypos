// Follow-up of the scan findings that may be scanner mistakes. Scratch stack only.
const { chromium } = require(process.env.PW_PATH);
const path = require("path");
const { execFileSync } = require("child_process");
const base = "http://localhost:3100";
const out = process.env.OUT;
const sql = (q) => execFileSync("docker", ["exec", "mypos-scratch-pg", "psql", "-U", "scratch", "-d", "mypos_scratch", "-At", "-c", q], { encoding: "utf8" }).trim();
const log = (...a) => console.log(...a);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route("**/*", (r) => (/googletagmanager|google-analytics|facebook|tiktok/.test(r.request().url()) ? r.abort() : r.continue()));
  const page = await ctx.newPage();
  const stamp = Date.now();

  // 1. Contact form.
  await page.goto(base + "/th/contact");
  await page.waitForTimeout(1500);
  await page.fill("#contact-name", `Inv ${stamp}`);
  await page.fill("#contact-phone", "0812345678");
  await page.fill("#contact-message", "investigate");
  await page.click("form:has(#contact-name) button[type=submit]");
  await page.waitForTimeout(4000);
  const statusBox = await page.locator("[role=status]").allInnerTexts();
  const alert = await page.locator("form [role=alert]").allInnerTexts();
  log("CONTACT status:", JSON.stringify(statusBox), "alert:", JSON.stringify(alert), "db rows:", sql(`SELECT count(*) FROM "ContactMessage" WHERE name = 'Inv ${stamp}'`));
  await page.screenshot({ path: path.join(out, "inv-contact.png"), fullPage: true });

  // 2. Warranty form.
  await page.goto(base + "/th/service");
  await page.waitForTimeout(1500);
  const wf = page.locator("form:has(textarea[name=issue])");
  log("WARRANTY forms on /th/service:", await wf.count());
  if (await wf.count()) {
    const inputs = await wf.locator("input:not([type=hidden]), select, textarea").evaluateAll((els) => els.map((e) => `${e.tagName}:${e.name}:${e.type}:${e.required}`));
    log("WARRANTY fields:", inputs.join(" "));
    for (const sel of ["input[name=name]", "input[name=phone]", "input[name=email]", "input[name=serialNumber]", "input[name=productSlug]"]) {
      const l = wf.locator(sel);
      if (await l.count()) await l.fill(sel.includes("email") ? `inv${stamp}@example.com` : sel.includes("phone") ? "0812345678" : `Inv ${stamp}`);
    }
    const s = wf.locator("select");
    if (await s.count()) { const v = await s.first().locator("option").nth(1).getAttribute("value").catch(() => null); if (v) await s.first().selectOption(v); }
    await wf.locator("textarea[name=issue]").fill("investigate");
    await wf.locator("button[type=submit]").click();
    await page.waitForTimeout(4000);
    log("WARRANTY status:", JSON.stringify(await page.locator("[role=status]").allInnerTexts()), "alert:", JSON.stringify(await page.locator("[role=alert]").allInnerTexts()), "db:", sql(`SELECT count(*) FROM "WarrantyClaim" WHERE name = 'Inv ${stamp}'`));
    await page.screenshot({ path: path.join(out, "inv-warranty.png"), fullPage: true });
  }

  // 3. Cookie settings button with the banner open.
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await c2.newPage();
  await p2.goto(base + "/th");
  await p2.waitForTimeout(1500);
  const cookieBtn = p2.locator("footer button", { hasText: "ตั้งค่าคุกกี้" });
  await cookieBtn.scrollIntoViewIfNeeded();
  const covered = await cookieBtn.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return top && !el.contains(top) ? (top.closest("[role=dialog], [aria-live], div")?.className || top.tagName).toString().slice(0, 120) : "not covered";
  });
  log("COOKIE footer button covered by:", covered);
  await p2.screenshot({ path: path.join(out, "inv-cookie.png") });
  // After accepting, the footer button reopens the banner.
  const accept = p2.locator("button", { hasText: "ยอมรับทั้งหมด" });
  if (await accept.count()) await accept.first().click();
  await p2.waitForTimeout(500);
  await cookieBtn.click({ timeout: 5000 }).then(() => log("COOKIE click after accept: ok")).catch((e) => log("COOKIE click after accept failed", e.message.split("\n")[0]));
  await p2.waitForTimeout(500);
  log("COOKIE banner visible again:", await p2.locator("button", { hasText: "ยอมรับทั้งหมด" }).isVisible().catch(() => false));
  await c2.close();

  // 4. Admin.
  await page.goto(base + "/admin/login");
  await page.fill("#email", "owner@scratch.test");
  await page.fill("#password", "scratch-only-Passw0rd");
  await page.click("button[type=submit]");
  await page.waitForTimeout(3000);

  await page.goto(base + "/admin/navigation");
  await page.waitForTimeout(2000);
  for (const label of ["เลื่อน จอเรียกคิว ลง", "เลื่อน ตู้ขายตั๋ว ขึ้น", "เลื่อน คำนวณความคุ้มค่า ลง"]) {
    const all = page.locator(`button[aria-label="${label}"]`);
    const states = await all.evaluateAll((els) => els.map((e) => (e.disabled ? "disabled" : "enabled")));
    log(`NAV "${label}": ${states.join(",")}`);
    const enabled = page.locator(`button[aria-label="${label}"]:not([disabled])`).first();
    if (await enabled.count()) {
      const before = await enabled.evaluate((el) => el.closest("li, div")?.parentElement?.innerText.slice(0, 200));
      await enabled.click({ timeout: 5000 }).then(() => log("  click ok")).catch((e) => log("  click FAILED", e.message.split("\n")[0]));
      await page.waitForTimeout(400);
      const after = await page.locator(`button[aria-label="${label}"]`).first().evaluate((el) => el.closest("li, div")?.parentElement?.innerText.slice(0, 200)).catch(() => "");
      log("  order changed:", before !== after);
    }
  }

  await page.goto(base + "/admin/catalog");
  await page.waitForTimeout(2000);
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => !(b.innerText || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title"))
      .map((b) => `${b.outerHTML.slice(0, 200)} disabled=${b.disabled} visible=${b.getBoundingClientRect().width > 0}`),
  );
  log("CATALOG unnamed buttons:", unnamed.length, JSON.stringify(unnamed));

  // Save unchanged: does the URL leave the edit page, and is any form error shown?
  for (const url of ["/admin/accessories/3/edit", "/admin/kb-categories/2/edit", "/admin/trust-logos/1/edit", "/admin/official-partners/1/edit", "/admin/admin-users/1/edit", "/admin/products/16/edit", "/admin/blog/1/edit", "/admin/references/1/edit", "/admin/kb-articles/1/edit"]) {
    await page.goto(base + url);
    await page.waitForTimeout(1500);
    const submit = page.locator("main form button[type=submit]").filter({ hasNotText: /ลบ|delete/i }).first();
    const label = await submit.innerText().catch(() => "?");
    await submit.click().catch(() => {});
    await page.waitForTimeout(4000);
    const formErr = await page.locator("main form [role=alert], main [data-form-error]").allInnerTexts().catch(() => []);
    log(`SAVE ${url} [${label}] -> ${page.url().replace(base, "")} formError=${JSON.stringify(formErr)}`);
  }

  sql(`DELETE FROM "ContactMessage" WHERE name LIKE 'Inv %'; DELETE FROM "WarrantyClaim" WHERE name LIKE 'Inv %'`);
  await browser.close();
})().catch((e) => { console.error("CRASH", e); process.exitCode = 2; });
