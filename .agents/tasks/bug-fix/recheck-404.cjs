// What a visitor sees on missing pages, in headless Chromium.
// Usage: node .agents/tasks/bug-fix/recheck-404.cjs   (needs PW_PATH = global playwright folder)
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PW_PATH);

const base = "http://localhost:3000";
const urls = ["/th/this-page-does-not-exist", "/en/products/no-such-product", "/zh/blog/no-such-post", "/th/knowledge-base/article/change-paper-k1"];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const out = [];
  for (const u of urls) {
    const errs = [];
    const onErr = (e) => errs.push(String(e.message).slice(0, 200));
    page.on("pageerror", onErr);
    const resp = await page.goto(base + u, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(700);
    const h1 = await page.evaluate(() => { const h = document.querySelector("h1"); return h ? h.innerText.trim() : ""; });
    const text = await page.evaluate(() => document.body.innerText);
    out.push(`${u} status=${resp ? resp.status() : 0} h1=[${h1}] visible404=${/(^|\n)\s*404\s*(\n|$)/.test(text)} jsErrors=${errs.length}`);
    page.off("pageerror", onErr);
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, "recheck-404.txt"), out.join("\n") + "\n", "utf8");
})();
