// Scratch env: submits a text file named x.png through the real trust-logo form and prints the
// error shown. Env as for verify-leads.cjs (PW_PATH, ADMIN_EMAIL, ADMIN_PASSWORD, BASE, OUT).
const { chromium } = require(process.env.PW_PATH);
const fs = require("fs");
const path = require("path");
const base = process.env.BASE || "http://localhost:3100";
const out = process.env.OUT || ".";
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 1000 } })).newPage();
  await page.goto(base + "/admin/login");
  await page.fill("#email", process.env.ADMIN_EMAIL);
  await page.fill("#password", process.env.ADMIN_PASSWORD);
  await Promise.all([page.waitForURL(/\/admin\/?$/), page.click("button[type=submit]")]);
  await page.goto(base + "/admin/trust-logos/new", { waitUntil: "networkidle" });
  console.log("URL after goto:", page.url());
  const tmp = path.join(out, "x.png");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(tmp, "this is plain text, not a PNG");
  await page.setInputFiles("input[type=file]", tmp);
  const name = page.locator("input[name=name]").first();
  if (await name.count()) await name.fill("verify");
  await page.locator("form:has(input[type=file]) button[type=submit]").first().click();
  await page.waitForTimeout(4000);
  const alert = await page.locator("[role=alert], .text-red-700, .text-error").allInnerTexts();
  console.log("ERRORS SHOWN:", JSON.stringify(alert));
  await page.screenshot({ path: path.join(out, "upload-wrong-signature.png") });
  fs.unlinkSync(tmp);
  await browser.close();
})().catch((e) => { console.error("ERROR", e.message); process.exit(2); });
