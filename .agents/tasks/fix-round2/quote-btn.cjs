// Rendered check of the header quote-list button (Figma HEADER v1 Q1-Q4) on a running server (:3000).
// Usage: node .agents/tasks/fix-round2/quote-btn.cjs   (needs PW_PATH = global playwright folder)
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PW_PATH);
const base = "http://localhost:3000";
const out = [];
let fail = 0;
const check = (name, ok, detail) => { if (!ok) fail++; out.push(`${ok ? "PASS" : "FAIL"} | ${name} | ${detail}`); };

(async () => {
  const browser = await chromium.launch();
  for (const [locale, word] of [["th", "ใบเสนอราคา"], ["en", "Quote"], ["zh", "报价"]]) {
    for (const [w, h, name] of [[1440, 900, "desktop 1440"], [1100, 800, "desktop 1100"], [390, 844, "mobile 390"]]) {
      for (const items of [0, 2]) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        if (items) {
          await ctx.addInitScript(() => {
            const k = Object.keys(localStorage).find((x) => /quote/i.test(x)) || "mypos-quote-cart";
            localStorage.setItem(k, JSON.stringify([
              { slug: "mypos-k1", name: "K1", priceFrom: 1, quantity: 1 },
              { slug: "mypos-t70", name: "T70", priceFrom: 1, quantity: 1 },
            ]));
          });
        }
        const page = await ctx.newPage();
        await page.goto(`${base}/${locale}`, { waitUntil: "networkidle", timeout: 120000 });
        await page.waitForTimeout(500);
        const links = page.locator('header a[href$="/compare"]');
        const visible = [];
        for (let i = 0; i < (await links.count()); i++) if (await links.nth(i).isVisible()) visible.push(links.nth(i));
        const label = visible[0] ? await visible[0].getAttribute("aria-label") : null;
        const text = visible[0] ? (await visible[0].innerText()).replace(/\s+/g, " ").trim() : "";
        const hasClipboard = visible[0] ? (await visible[0].locator("svg.lucide-clipboard-list").count()) > 0 : false;
        const tag = `${locale} ${name} items=${items}`;
        if (w >= 1280) {
          check(`${tag} text shown`, visible.length === 1 && text.includes(word) && hasClipboard, `text="${text}" icon=${hasClipboard}`);
        } else if (w >= 1024) {
          check(`${tag} icon only`, visible.length === 1 && !text.includes(word) && hasClipboard, `text="${text}"`);
        } else {
          check(`${tag} mobile button`, items ? visible.length === 1 && hasClipboard : visible.length === 0, `visible=${visible.length}`);
        }
        if (items && visible[0]) check(`${tag} count`, text.includes("2") && /\(2\)/.test(label || ""), `aria-label="${label}"`);
        if (items === 2 && locale === "th") await page.screenshot({ path: path.join(__dirname, `quote-btn-${w}.png`), clip: { x: 0, y: 0, width: w, height: 72 } });
        await ctx.close();
      }
    }
  }
  await browser.close();
  out.push(`failures=${fail}`);
  fs.writeFileSync(path.join(__dirname, "quote-btn-render.txt"), out.join("\n") + "\n", "utf8");
})();
