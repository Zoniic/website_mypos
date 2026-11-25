// Whole-site bug scan against the SCRATCH stack (server on :3100, scratch DB). Never touches the shared DB.
// Phases: P pages (all locales) · L internal links · B every button clicked · F public forms · M mobile · A admin.
// Output: findings.json (every issue) and a PASS/FAIL style log on stdout.
const { chromium } = require(process.env.PW_PATH);
const fs = require("fs");
const path = require("path");

const base = process.env.BASE || "http://localhost:3100";
const out = process.env.OUT;
fs.mkdirSync(out, { recursive: true });
const only = (process.env.PHASES || "PLBFMA").split("");
const findings = [];
const add = (phase, kind, where, detail) => {
  findings.push({ phase, kind, where, detail: String(detail ?? "").slice(0, 500) });
  console.log(`ISSUE ${phase} ${kind} ${where} :: ${String(detail ?? "").slice(0, 200).replace(/\s+/g, " ")}`);
};
const save = () => fs.writeFileSync(path.join(out, "findings.json"), JSON.stringify(findings, null, 1));
const IGNORE_CONSOLE = /Download the React DevTools|\[Fast Refresh\]|youtube|googletagmanager|google-analytics|facebook|doubleclick/i;
const IGNORE_URL = /youtube|ytimg|google|facebook|doubleclick|gstatic|supabase\.co\/storage.*\.(webp|png|jpg)$/i;

function watch(page, where) {
  const issues = [];
  page.on("pageerror", (e) => issues.push(["js-error", e.message]));
  page.on("console", (m) => { if (m.type() === "error" && !IGNORE_CONSOLE.test(m.text())) issues.push(["console-error", m.text()]); });
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 400 && !IGNORE_URL.test(u) && !/\/not-found|favicon/.test(u)) issues.push([`http-${r.status()}`, u.replace(base, "")]);
  });
  return issues;
}

async function settle(page, ms = 1200) {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(ms);
}

async function pageFacts(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const brokenImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith("data:")).map((i) => i.src);
    const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    const emptyLinks = [...document.querySelectorAll("a")].filter((a) => vis(a) && (!a.getAttribute("href") || a.getAttribute("href") === "#")).map((a) => (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 60));
    const unnamedButtons = [...document.querySelectorAll("button, [role=button]")].filter((b) => vis(b) && !(b.innerText || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")).length;
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const text = document.body ? document.body.innerText : "";
    const rawKey = (text.match(/\b[a-z][a-zA-Z]+\.[a-z][a-zA-Z]+(\.[a-zA-Z]+)+\b/g) || []).filter((k) => !/\.(com|co|th|net|org|php|png|jpg|webp|pdf|js|html)$/i.test(k) && !/^(www|mypos|e\.g|i\.e)\./.test(k)).slice(0, 5);
    const h1 = [...document.querySelectorAll("h1")].map((h) => h.innerText.trim());
    return { brokenImgs, links, emptyLinks, unnamedButtons, overflow, h1, rawKey, errorText: /Application error|Something went wrong|Internal Server Error/.test(text) };
  });
}

async function sitemapPaths(page) {
  const xml = await (await page.request.get(base + "/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

// ---------- Buttons ----------
const DESTRUCTIVE = /ลบ|delete|remove all|ออกจากระบบ|logout|log out|sign out|ล้าง|reset|รีเซ็ต|ปิดรหัส|disable/i;
async function listButtons(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !el.closest("[aria-hidden=true]");
    };
    const els = [...document.querySelectorAll("button, [role=button], summary, input[type=button], input[type=submit]")].filter(vis);
    return els.map((el, i) => {
      el.setAttribute("data-scan", String(i));
      const form = el.closest("form");
      const type = (el.getAttribute("type") || (el.tagName === "BUTTON" ? "submit" : "")).toLowerCase();
      const zone = el.closest("header") ? "header" : el.closest("footer") ? "footer" : "main";
      const label = ((el.innerText || el.value || "").trim() || el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\s+/g, " ").slice(0, 60);
      return { i, label, zone, isSubmit: !!form && type === "submit", disabled: el.disabled === true, sig: `${zone}|${el.tagName}|${label}|${el.getAttribute("aria-label") || ""}` };
    });
  });
}

async function clickOne(page, url, btn, where) {
  const issues = watch(page, where);
  await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(page);
  const list = await listButtons(page);
  const target = list.find((b) => b.sig === btn.sig);
  if (!target) return { skipped: "not found after reload" };
  await page.evaluate(() => {
    window.__mut = 0;
    new MutationObserver((m) => { window.__mut += m.length; }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
  });
  let requests = 0;
  const onReq = () => requests++;
  page.on("request", onReq);
  const before = page.url();
  let popup = false;
  page.context().once("page", () => { popup = true; });
  try {
    await page.locator(`[data-scan="${target.i}"]`).click({ timeout: 5000 });
  } catch (e) {
    page.off("request", onReq);
    return { error: `click failed: ${e.message.split("\n")[0]}` };
  }
  await page.waitForTimeout(1200);
  page.off("request", onReq);
  const mut = await page.evaluate(() => window.__mut).catch(() => -1); // -1: navigated away
  const changed = page.url() !== before || mut !== 0 || requests > 0 || popup;
  return { changed, issues, mut, requests, navigated: page.url() !== before };
}

async function testButtons(ctx, urls, phase, tested) {
  for (const url of urls) {
    const page = await ctx.newPage();
    try {
      await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await settle(page);
      const list = await listButtons(page);
      for (const btn of list) {
        if (tested.has(btn.sig) || btn.disabled) continue;
        tested.add(btn.sig);
        if (btn.isSubmit) continue; // forms are tested on their own
        if (phase === "A" && DESTRUCTIVE.test(btn.label)) continue;
        const p = await ctx.newPage();
        const r = await clickOne(p, url, btn, url);
        if (r.error) add(phase, "button-click-failed", `${url} [${btn.label}]`, r.error);
        else if (r.skipped) {}
        else {
          if (!r.changed) add(phase, "button-no-effect", `${url} [${btn.label}]`, `zone=${btn.zone}`);
          for (const [k, d] of r.issues) add(phase, `button-${k}`, `${url} [${btn.label}]`, d);
        }
        await p.close();
      }
    } catch (e) {
      add(phase, "button-scan-crash", url, e.message);
    }
    await page.close();
    save();
  }
}

// ---------- Main ----------
// Analytics and ad pixels are blocked so the scan does not count as real visits.
const TRACKERS = /googletagmanager|google-analytics|analytics\.google|doubleclick|facebook\.(com|net)|connect\.facebook|tiktok|clarity\.ms|hotjar|line-scdn|tr\.line\.me/i;
async function blockTrackers(c) {
  await c.route("**/*", (route) => (TRACKERS.test(route.request().url()) ? route.abort() : route.continue()));
  return c;
}

(async () => {
  const browser = await chromium.launch();
  const realNewContext = browser.newContext.bind(browser);
  browser.newContext = async (opts) => blockTrackers(await realNewContext(opts));
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page0 = await ctx.newPage();
  const sm = await sitemapPaths(page0);
  const extra = ["/th/compare", "/th/search?q=k1", "/th/knowledge-base/search?q=printer", "/th/checkout", "/en/compare", "/zh/compare", "/th/accessories?category=pos"];
  const all = [...new Set([...sm, ...extra])];
  console.log(`pages: ${all.length}`);
  const linkSet = new Set();

  if (only.includes("P")) {
    for (const url of all) {
      const page = await ctx.newPage();
      const issues = watch(page, url);
      let status = 0;
      try {
        const r = await page.goto(base + url, { waitUntil: "networkidle", timeout: 60000 });
        status = r ? r.status() : 0;
        await page.waitForTimeout(500);
        const f = await pageFacts(page);
        if (status >= 400) add("P", `status-${status}`, url, "");
        if (f.errorText) add("P", "error-page", url, "");
        if (f.h1.length !== 1) add("P", "h1-count", url, `h1=${f.h1.length} ${f.h1.join(" / ")}`);
        if (f.overflow > 1) add("P", "overflow-desktop", url, `${f.overflow}px`);
        for (const s of f.brokenImgs) add("P", "broken-image", url, s);
        for (const s of f.emptyLinks) add("P", "empty-link", url, s);
        if (f.unnamedButtons) add("P", "unnamed-button", url, `${f.unnamedButtons} buttons without text or aria-label`);
        for (const k of f.rawKey) add("P", "raw-message-key", url, k);
        for (const h of f.links) linkSet.add(h);
      } catch (e) {
        add("P", "load-failed", url, e.message);
      }
      for (const [k, d] of issues) add("P", k, url, d);
      await page.close();
      console.log(`P ${status} ${url}`);
    }
    save();
  }

  if (only.includes("L")) {
    const internal = [...linkSet]
      .filter((h) => h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/admin"))
      .map((h) => h.split("#")[0])
      .filter(Boolean);
    const unique = [...new Set(internal)];
    console.log(`links: ${unique.length}`);
    for (const h of unique) {
      try {
        const r = await page0.request.get(base + h, { maxRedirects: 5, timeout: 60000 });
        if (r.status() >= 400) add("L", `link-${r.status()}`, h, "linked from a public page");
      } catch (e) {
        add("L", "link-failed", h, e.message);
      }
    }
    const mailtoTel = [...linkSet].filter((h) => h && /^(tel|mailto):/.test(h));
    for (const h of mailtoTel) if (/^tel:/.test(h) && !/^tel:\+?[0-9-]{6,}$/.test(h)) add("L", "bad-tel-link", h, "");
    save();
  }

  if (only.includes("B")) {
    const thPages = all.filter((u) => u.startsWith("/th"));
    await testButtons(ctx, thPages, "B", new Set());
    // Mobile header (menu button, language switcher) once.
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await testButtons(mctx, ["/th", "/th/products", "/th/accessories/mypos-c300h", "/th/compare"], "B", new Set());
    await mctx.close();
    save();
  }

  if (only.includes("F")) {
    const page = await ctx.newPage();
    const issues = watch(page, "forms");
    const stamp = Date.now();
    // Contact
    await page.goto(base + "/th/contact", { waitUntil: "domcontentloaded" });
    await settle(page);
    try {
      const form = page.locator("form").filter({ has: page.locator("input[name=phone]") }).first();
      await form.locator("input[name=name]").fill(`Scan ${stamp}`);
      await form.locator("input[name=phone]").fill("0812345678");
      const msg = form.locator("textarea[name=message]");
      if (await msg.count()) await msg.fill("bug scan test");
      await form.locator("button[type=submit]").click();
      await page.waitForTimeout(3500);
      const txt = await page.locator("main").innerText();
      if (!/ขอบคุณ|ได้รับ|สำเร็จ|ส่งแล้ว/.test(txt)) add("F", "contact-no-success", "/th/contact", txt.slice(0, 300));
    } catch (e) { add("F", "contact-failed", "/th/contact", e.message); }
    // Newsletter (footer)
    await page.goto(base + "/th", { waitUntil: "domcontentloaded" });
    await settle(page);
    try {
      const nf = page.locator("footer form").first();
      await nf.locator("input[type=email]").fill(`scan${stamp}@example.com`);
      await nf.locator("button[type=submit]").click();
      await page.waitForTimeout(3000);
      const t = await page.locator("footer").innerText();
      if (!/ขอบคุณ|สำเร็จ|สมัครแล้ว|เรียบร้อย/.test(t)) add("F", "newsletter-no-success", "/th footer", t.slice(0, 200));
    } catch (e) { add("F", "newsletter-failed", "/th footer", e.message); }
    // Warranty (service page)
    await page.goto(base + "/th/service", { waitUntil: "domcontentloaded" });
    await settle(page);
    try {
      const wf = page.locator("form").filter({ has: page.locator("textarea[name=issue]") }).first();
      if (await wf.count()) {
        await wf.locator("input[name=name]").fill(`Scan ${stamp}`);
        await wf.locator("input[name=phone]").fill("0812345678");
        const em = wf.locator("input[name=email]");
        if (await em.count()) await em.fill(`scan${stamp}@example.com`);
        await wf.locator("textarea[name=issue]").fill("bug scan test");
        await wf.locator("button[type=submit]").click();
        await page.waitForTimeout(3500);
        const t = await page.locator("main").innerText();
        if (!/ขอบคุณ|ได้รับ|สำเร็จ|ส่งแล้ว/.test(t)) add("F", "warranty-no-success", "/th/service", t.slice(0, 300));
      } else add("F", "warranty-form-missing", "/th/service", "no form with textarea[name=issue]");
    } catch (e) { add("F", "warranty-failed", "/th/service", e.message); }
    // Search box
    await page.goto(base + "/th/search?q=K1", { waitUntil: "domcontentloaded" });
    await settle(page);
    const st = await page.locator("main").innerText();
    if (!/K1/i.test(st)) add("F", "search-no-results", "/th/search?q=K1", st.slice(0, 200));
    // Quote cart
    await page.goto(base + "/th/products", { waitUntil: "domcontentloaded" });
    await settle(page, 2000);
    try {
      await page.locator("main button[aria-pressed]").first().click();
      await page.goto(base + "/th/compare", { waitUntil: "domcontentloaded" });
      await settle(page);
      await page.fill("#quote-name", `Scan ${stamp}`);
      await page.fill("#quote-phone", "0812345678");
      await page.fill("#quote-email", `scan${stamp}@example.com`);
      await page.click("form button[type=submit]");
      await page.waitForTimeout(3500);
      if (!(await page.locator("[role=status]").count())) add("F", "quote-no-success", "/th/compare", (await page.locator("main").innerText()).slice(0, 200));
    } catch (e) { add("F", "quote-failed", "/th/compare", e.message); }
    for (const [k, d] of issues) add("F", k, "forms", d);
    await page.close();
    save();
  }

  if (only.includes("M")) {
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    for (const url of all.filter((u) => u.startsWith("/th"))) {
      const page = await mctx.newPage();
      try {
        await page.goto(base + url, { waitUntil: "networkidle", timeout: 60000 });
        await page.waitForTimeout(400);
        const f = await pageFacts(page);
        if (f.overflow > 1) add("M", "overflow-mobile", url, `${f.overflow}px wider than the screen`);
      } catch (e) { add("M", "load-failed", url, e.message); }
      await page.close();
    }
    await mctx.close();
    save();
  }

  if (only.includes("A")) {
    const actx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await actx.newPage();
    await page.goto(base + "/admin/login");
    await page.fill("#email", process.env.SCAN_EMAIL);
    await page.fill("#password", process.env.SCAN_PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForTimeout(3000);
    if (page.url().includes("/admin/login")) { add("A", "login-failed", "/admin/login", ""); }
    const navPages = JSON.parse(process.env.ADMIN_PAGES);
    const discovered = new Set(navPages);
    for (const url of navPages) {
      const issues = watch(page, url);
      try {
        const r = await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await settle(page, 1500);
        if (r && r.status() >= 400) add("A", `status-${r.status()}`, url, "");
        const f = await pageFacts(page);
        if (f.errorText) add("A", "error-page", url, "");
        for (const s of f.brokenImgs) add("A", "broken-image", url, s);
        for (const h of f.links) if (h && /^\/admin\/[^?]+\/(new|\d+\/edit|\d+)$/.test(h)) discovered.add(h);
      } catch (e) { add("A", "load-failed", url, e.message); }
      for (const [k, d] of issues) add("A", k, url, d);
      page.removeAllListeners("pageerror"); page.removeAllListeners("console"); page.removeAllListeners("response");
    }
    // One edit page of each kind.
    const kinds = new Map();
    for (const h of discovered) { const k = h.replace(/\/\d+(\/edit)?$/, "/:id$1"); if (!kinds.has(k)) kinds.set(k, h); }
    const formPages = [...kinds.values()].filter((h) => !navPages.includes(h));
    console.log(`admin form pages: ${formPages.join(", ")}`);
    for (const url of formPages) {
      const issues = watch(page, url);
      try {
        const r = await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await settle(page, 1500);
        if (r && r.status() >= 400) add("A", `status-${r.status()}`, url, "");
        const f = await pageFacts(page);
        if (f.errorText) add("A", "error-page", url, "");
      } catch (e) { add("A", "load-failed", url, e.message); }
      for (const [k, d] of issues) add("A", k, url, d);
      page.removeAllListeners("pageerror"); page.removeAllListeners("console"); page.removeAllListeners("response");
    }
    await testButtons(actx, [...navPages, ...formPages], "A", new Set());
    // Save every edit form without changes: must not show an error.
    for (const url of formPages.filter((u) => /\/edit$/.test(u))) {
      const p = await actx.newPage();
      const issues = watch(p, url);
      try {
        await p.goto(base + url, { waitUntil: "domcontentloaded" });
        await settle(p, 1500);
        const submit = p.locator("main form button[type=submit]").filter({ hasNotText: /ลบ|delete/i }).first();
        if (await submit.count()) {
          await submit.click();
          await p.waitForTimeout(4000);
          const err = await p.locator("[role=alert], .text-error").allInnerTexts().catch(() => []);
          const shown = err.map((x) => x.trim()).filter(Boolean);
          if (shown.length) add("A", "save-unchanged-error", url, shown.join(" | "));
        }
      } catch (e) { add("A", "save-failed", url, e.message); }
      for (const [k, d] of issues) add("A", `save-${k}`, url, d);
      await p.close();
    }
    await actx.close();
    save();
  }

  await browser.close();
  save();
  console.log(`DONE findings=${findings.length}`);
})().catch((e) => { console.error("CRASH", e); save(); process.exitCode = 2; });
