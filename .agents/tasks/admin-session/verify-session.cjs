// Scratch check of the admin login over plain http on a non-localhost address, and of the lead auto-refresh.
// BASE = http://<LAN IP>:3100 (server started against the scratch DB). EXPECT_LOGOUT=1 = control run with
// ADMIN_COOKIE_SECURE=true, where a refresh must go back to the login page (the old behaviour).
const { chromium } = require(process.env.PW_PATH);
const { execFileSync } = require("child_process");
const base = process.env.BASE;
const expectLogout = process.env.EXPECT_LOGOUT === "1";
const results = [];
const check = (id, name, ok, detail) => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail !== undefined ? "  [" + String(detail).slice(0, 200) + "]" : ""}`);
};
const sql = (q) => execFileSync("docker", ["exec", "mypos-scratch-pg", "psql", "-U", "scratch", "-d", "mypos_scratch", "-At", "-c", q], { encoding: "utf8" }).trim();

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(base + "/admin/login");
  await page.fill("#email", "owner@scratch.test");
  await page.fill("#password", "scratch-only-Passw0rd");
  await page.click("button[type=submit]");
  await page.waitForTimeout(3000);
  const cookie = (await ctx.cookies()).find((c) => c.name === "mypos_admin_session");
  check("S1", `session cookie stored over http (secure=${cookie?.secure})`, expectLogout ? !cookie : !!cookie && !cookie.secure);

  await page.goto(base + "/admin/quote-requests");
  await page.reload();
  await page.waitForTimeout(1500);
  const onLogin = page.url().includes("/admin/login");
  check("S2", expectLogout ? "control: refresh goes back to login (old bug)" : "refresh keeps the admin signed in", expectLogout ? onLogin : !onLogin, page.url());
  if (expectLogout) {
    await browser.close();
    process.exitCode = results.every(Boolean) ? 0 : 1;
    return;
  }

  await page.goto(base + "/admin/contact-messages");
  await page.waitForTimeout(1500);
  const marker = `AutoRefresh ${Date.now()}`;
  sql(`INSERT INTO "ContactMessage" (name, phone, topic, status, "createdAt") VALUES ('${marker}', '0800000000', 'general', 'new', now())`);
  let seen = false;
  for (let i = 0; i < 45 && !seen; i++) {
    await page.waitForTimeout(1000);
    seen = (await page.locator(`text=${marker}`).count()) > 0;
  }
  check("R1", "new message appears without a manual refresh (within 45 s)", seen);
  check("R2", "still signed in after the background refresh", !page.url().includes("/admin/login"), page.url());

  // Typing in a field blocks the refresh.
  await page.goto(base + "/admin/contact-messages");
  await page.waitForTimeout(1500);
  const marker2 = `WhileTyping ${Date.now()}`;
  const field = page.locator("textarea, input[type=text], input[type=search]").first();
  await field.click();
  await field.type("note in progress");
  sql(`INSERT INTO "ContactMessage" (name, phone, topic, status, "createdAt") VALUES ('${marker2}', '0800000000', 'general', 'new', now())`);
  await page.waitForTimeout(36000);
  const appeared = (await page.locator(`text=${marker2}`).count()) > 0;
  check("R3", "no refresh while the admin is typing", !appeared && (await field.inputValue()).includes("note in progress"));

  sql(`DELETE FROM "ContactMessage" WHERE name LIKE 'AutoRefresh %' OR name LIKE 'WhileTyping %'`);
  await browser.close();
  console.log(`DONE pass=${results.filter(Boolean).length} fail=${results.filter((x) => !x).length}`);
  process.exitCode = results.every(Boolean) ? 0 : 1;
})().catch((e) => { console.error("CRASH", e); process.exitCode = 2; });
