// Report-only CSP sweep: loads main public pages and /admin/login in headless
// Chromium, accepts the cookie banner when present (so pixels load), and lists
// every securitypolicyviolation event and console CSP message.
// Usage: node .agents/tasks/admin-improve/headers-check.cjs   (needs PW_PATH = global playwright folder,
// a production server on BASE or http://localhost:3000)
const { chromium } = require(process.env.PW_PATH);
const base = process.env.BASE || "http://localhost:3000";
const urls = ["/th", "/en", "/zh", "/th/products", "/th/knowledge-base", "/th/contact", "/admin/login"];
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.log(`CSPV ${e.effectiveDirective} ${e.blockedURI}`);
    });
  });
  const page = await context.newPage();
  const found = new Map();
  let current = "";
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.startsWith("CSPV ") || /Content Security Policy/i.test(text)) {
      const key = text.slice(0, 240);
      if (!found.has(key)) found.set(key, new Set());
      found.get(key).add(current);
    }
  });
  // Also visit the first product and KB article linked from the lists.
  const extra = [];
  for (const u of urls) {
    current = u;
    const resp = await page.goto(base + u, { waitUntil: "networkidle", timeout: 120000 });
    console.log(`${u} status=${resp ? resp.status() : 0}`);
    const accept = page.getByRole("button", { name: /accept|ยอมรับ|接受|同意/i }).first();
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
      await page.waitForTimeout(2500);
    }
    if (u === "/th/products" || u === "/th/knowledge-base") {
      const href = await page.evaluate((prefix) => {
        const a = [...document.querySelectorAll("a[href]")].find((el) => {
          const h = el.getAttribute("href") || "";
          return h.startsWith(prefix) && h.length > prefix.length;
        });
        return a ? a.getAttribute("href") : null;
      }, u === "/th/products" ? "/th/products/" : "/th/knowledge-base/");
      if (href) extra.push(href);
    }
  }
  for (const u of extra) {
    current = u;
    const resp = await page.goto(base + u, { waitUntil: "networkidle", timeout: 120000 });
    console.log(`${u} status=${resp ? resp.status() : 0}`);
    await page.waitForTimeout(1500);
  }
  await browser.close();
  console.log(`violations: ${found.size}`);
  for (const [k, pages] of found) console.log(`- ${k}  [${[...pages].join(", ")}]`);
})();
