# MYPOS website: handoff for the next AI or developer

Written 2026-11-23, updated 2026-11-24 against commit `1709138` on `main` (`origin/main` is identical, CI green). Read this file first, then `AGENTS.md`, `PRODUCT.md` and `DESIGN.md`. Where this file and `README.md` disagree, this file is correct (see "Stale documents").

The owner communicates in Thai. Reply to the owner in Thai, keep answers short, and offer short answer codes ("1a 2b") for decisions.

## 0. Start here: open decisions and next steps (2026-11-24)

A full bug scan finished on 2026-11-24 (section 11.2). The owner has **not answered yet**. Ask these again before doing anything else:

| Code | Finding | Proposed fix |
|---|---|---|
| B1 | **Security, critical.** `next@16.3.6` has published advisories (RCE in image optimization with SVG, RCE in `use cache` with typed arrays, SSRF, cache poisoning). Fixed in 16.4.5+; latest 16.x is 16.4.6. | B1-a: upgrade `next` and `eslint-config-next` to 16.4.6, then tsc, lint, test, build, rescan. B1-b: not now. Prisma CLI advisories (deepmerge-ts, effect, via `@prisma/config`) are dev-tool only and need Prisma 7 (major): recommended to leave. |
| B2 | Product `tongluay` has `datasheetUrl = "500"`, so its page loads `/th/products/500` (404 in the console). Product `test` (hidden) has `TEST` in datasheet and video. The product form accepts any text in Datasheet URL and Video URL (`src/app/admin/(dashboard)/products/actions.ts`, `readProductFields`). | B2-a: accept only `https://` or a site path starting with `/` (as the accessory form already does), and clear the `500` value in the shared DB with a backup first. B2-b: form only. |
| B3 | `src/components/seo/JsonLd.tsx` uses plain `JSON.stringify`. Admin text containing `</script>` breaks out of the JSON-LD tag (stored XSS by any admin, including the new editor role). | Replace `<` with `\u003c` in the output. One line, no visible change. |
| B4 | `/admin/catalog` uses the text glyph "+" as an icon twice (`CatalogEditor.tsx` `<summary>` lines 174 and 313). Breaks the Lucide-only rule. | B4-a: Lucide `Plus` icon. B4-b: Figma mockup first. |
| B5 | Product `tongluay` is public and in the sitemap. | B5-a: it is a test product, add it to the hidden list (`hiddenProductSlugs` setting). B5-b: it is real, leave it. |

After the owner answers: fix, run `npx tsc --noEmit`, `npm run lint`, `npm test`, build, rerun the scan (section 9, "Whole-site scan"), commit, and ask before pushing.

Other things waiting on the owner (not code):

- **L1:** the owner will upload the real MYPOS logo in `/admin/photos`. Today the logo slot `site/logo-1795417904617.png` shows a "ซื้อแล้วไม่รับเปลี่ยน" sign instead of the logo. Do not replace it yourself.
- **Secrets were pasted in chat** on 2026-11-24 (the shared `DATABASE_URL` with password, and `SUPABASE_SERVICE_ROLE_KEY`). The owner was told to rotate both; not yet confirmed. After rotating, `.env` and `.env.local` on this machine and on the test server must be updated.
- Hosting: a container host is proposed (Railway, Singapore; Supabase is `ap-southeast-1`). Plan (Hobby or Pro) not chosen.
- Two-step login: not used yet; `TWO_FACTOR_ENCRYPTION_KEY` is not set.
- Accessory data: the new accessory fields (price, stock, gallery, specs, PDF, works-with machines) are all empty in the shared DB. The owner fills them in `/admin/accessories`.
- Leftover folders that could not be deleted (locked): `.worktrees\admin-v2` and `D:\Folk\Own_Dir\FMT\DEV\mypos-website-wt`. The owner deletes them by hand. `git stash@{0}` holds an old `uploads.ts` lint edit; the 3 modified files under `.agents/tasks/design-10/review-v2/` are not ours, do not touch them.

**Rule: every visible UI change needs a Figma mockup approved by the owner before coding.** Figma file `RfzIGGGsN5zgLssxmgHouj`. Recent approved pages: "ACCESSORY v1" (node 194:2), "HEADER v1" (185:2), admin v2 (163:2), icon kit "ADMIN-IMPROVE v1 - Kit (icons)". In Figma plugin code use `String.fromCharCode(10)` for newlines, and re-read node text instead of trusting a screenshot taken right after an edit.

**Test server:** the owner runs this repo on a Debian test server under PM2, opened over plain `http://<IP>:3000`. It must run the production build (`npm ci`, `npm run build`, `pm2` running `next start`), not `next dev`; dev mode caused buttons to fail there (blocked cross-origin dev requests). Update steps after a push: `git pull`, `npm ci`, `npm run build`, `pm2 restart <app>`.

## 1. What this project is

The marketing and lead-generation website of MYPOS (FMT Corporation), a Thai maker of POS terminals and self-order kiosks. Success is measured in contact and quote requests, not online checkout (`PRODUCT.md`). The site is Thai-first with English and Chinese (`/th`, `/en`, `/zh`). A password-protected admin at `/admin` edits almost everything.

Production state: **this app is not deployed.** `https://mypos.co.th/` still serves the old site (Apache, checked 2026-11-23). `src/config/site.ts`, canonical URLs, the sitemap and JSON-LD already point at `https://mypos.co.th`, so they are only correct after the domain is switched.

## 2. Stack (verified in the repo)

- Next.js 16.3.6 (App Router, Turbopack; has known advisories, see section 0 B1), React 19.2.4, TypeScript, Tailwind CSS v4. `next.config.ts` sets `output: "standalone"`: `next start` warns but works; the Docker image runs `node .next/standalone/server.js`.
- **Next.js 16 differs from older versions.** Read the matching guide in `node_modules/next/dist/docs/` before changing any Next API. Middleware is `src/proxy.ts`, not `middleware.ts`.
- next-intl 4 for routing. Page copy is **not** read from `messages/*.json` at runtime. It lives in the database (`PageContent`) and is edited in the admin. `messages/*.json` is only the seed source and the fallback.
- Prisma 6 with PostgreSQL (`prisma/schema.prisma`). Uploads go to Supabase Storage (`src/lib/uploads.ts`, `src/lib/supabase.ts`).
- Auth: bcryptjs password hashes, a signed JWT cookie (`jose`, 7 days). `lucide-react` for icons, `framer-motion` for motion.
- Tests: `npm test` runs the unit tests in `tests/unit` (node:test through tsx, no database). GitHub Actions (`.github/workflows/ci.yml`) runs `tsc`, lint and `npm test` on every push and pull request to `main`. Add a unit test next to any pure helper you change. Page-level checks need a running server: the scripts in section 9.

## 3. Rules that are enforced or easy to break

1. **Icons are Lucide only. No emoji, no text glyph icons, no hand-drawn inline `<svg>`** (`DESIGN.md` §10). ESLint enforces it (`lucide/no-icon-glyphs`, `lucide/no-raw-svg`). Allowed exceptions: `MachineArt.tsx`, `BrandIcons.tsx`, `ogImage.tsx`, `notify.ts`. Stored content is checked too: admin forms reject emoji (`src/lib/emoji.ts`) and `prisma/strip-emoji.ts` cleans existing rows.
2. **Slugs are lowercase, URL-safe** (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Admin actions validate this on the server (`src/lib/slug.ts`). Old-style URLs are redirected with a 308 in `src/proxy.ts`.
3. **Real 404 status.** A streamed page cannot change its status code, so `src/proxy.ts` decides 404 before rendering. When you add a public page under `src/app/[locale]`, also add it to `src/lib/routeMap.ts`, or the page returns 404.
4. **Photos must be real.** Never present a rendered image as a real installation. Owner-confirmed renders: the home hero background video, and the reference-case photo `a-beachside-resort-hotel` (also the `solution-self-order` slot). `software-hero` is unconfirmed: ask the owner before using it as evidence.
5. **Do not invent facts**: no made-up statistics, customers, testimonials, prices, SLAs or addresses. Empty settings hide their section on purpose.
6. **Contact numbers**: office `02 521 7155-59` (label สำนักงาน), sales `086 688 9050` (label ฝ่ายขาย), email `Sales@fmtcorp.co.th`. Both numbers are shown separately. The mobile bar Call button dials sales. JSON-LD uses the office number.
7. **Ask the owner before `git push`.** Never run destructive git commands. Data scripts must take a backup first (section 8).
8. **Caching.** Public pages are cached. Admin saves call `revalidatePublicSite()` (`src/lib/siteCache.ts`). A direct database write is visible after up to 300 seconds. The proxy caches slug lists and the catalog for 30 seconds.
9. **Visible UI changes need an owner-approved Figma mockup first** (section 0).
10. **Schema changes are additive only and need the owner's approval before they touch the shared database.** Pattern used for admin v2 and accessory X3: generate SQL with `prisma migrate diff --from-schema-datamodel <old schema from git show> --to-schema-datamodel prisma/schema.prisma --script`, write an undo SQL, write a guarded apply script (`--check`, `--backup`, `--apply` in one transaction, refuses non-additive statements and refuses to run twice), prove it on the scratch DB (apply, second apply refuses, `migrate diff --from-url <scratch> --exit-code` reports no difference), then run on the shared DB and take `prisma/backup-db.ts --write` afterwards. Examples: `.agents/tasks/accessory-x3/apply-schema.ts`, `run-migrate.ps1`, `migrate-log.txt`.
11. **New copy keys:** page copy comes from `PageContent` only. Add keys with a create-only script that also updates `messages/*.json` (examples `prisma/add-nav-compare-short.ts`, `prisma/add-accessory-detail-keys.ts`), and give the code a fallback until the script has run (`src/data/accessoryCopy.ts`, `accessoryCopy()`).

## 4. Code map

```
src/app/[locale]/        public pages (one folder per route), ISR with admin-driven revalidation
src/app/admin/           admin (outside the locale tree): login, logout, live (edit-on-site), goto, (dashboard)/*
src/app/api/line/webhook LINE webhook (404 until LINE_CHANNEL_SECRET and token are set)
src/app/feeds/           product feed
src/components/          ui, layout, sections, products, commerce, contact, edit (edit-on-site overlay), seo
src/lib/                 all data access and helpers (products.ts, kb.ts, blog.ts, orders.ts, siteSettings.ts, ...)
src/proxy.ts             admin gate, legacy-slug 308s, real 404s, then next-intl
src/data/                static config: solutions, categories, legacyRedirects.ts (90 old .php URLs), accessoryCopy.ts
prisma/                  schema, seed, and one-off data scripts (section 8)
docs/owner-data-guide-th.md   what the owner must supply and where to enter it (Thai)
.agents/tasks/           audit reports, scan scripts and design-run logs (not part of the site; ESLint ignores it)
```

Important files:

- `src/lib/siteSettings.ts`: `getSiteSettings()`, `companyInfo()` (the single source of company name, address, phones, email), `telDigits()`, `isOnlineOrderingOn()`.
- `src/lib/siteDisplay.ts`: phone labels, stat filtering (`isShowableStat`), Google Maps embed check (`isGoogleMapsEmbedUrl`).
- `src/lib/catalog.ts`: solution lines and business types, editable in `/admin/catalog`.
- `src/lib/hiddenProducts.ts`: products hidden from the public site by slug (currently `test`). Matches the exact slug, so renaming a product un-hides it.
- `src/lib/notify.ts`: LINE and email alerts for new orders and leads.
- `src/lib/pageLayout.ts`, `src/app/admin/(dashboard)/layout-editor`: section order and visibility per page.
- `src/lib/permissions.ts` (owner/editor matrix), `src/lib/adminUsers.ts` (last-owner rule, acting-password check), `src/lib/adminAuth.ts` (`requireAdmin`, `requireOwner`, `getAdminContext`), `src/app/admin/(dashboard)/OwnerOnly.tsx` (page shown to editors).
- `src/lib/audit.ts` (diff, redaction, retention), `auditLog.ts`, `auditRegistry.ts` (entity labels, restorable fields), `auditRestore.ts`; screens in `src/app/admin/(dashboard)/history/`. A new admin write path must call `recordAudit`; `tests/unit/admin-guard.test.ts` checks this.
- `src/lib/twoFactor.ts`, `twoFactorPure.ts`, `totp.ts`, `secretBox.ts`, `backupCodes.ts`: two-step login (details in section 7).
- `Dockerfile`, `.dockerignore`, `src/app/api/health/route.ts` (liveness only, no database), `docs/deploy-checklist-th.md`: container packaging.
- Accessories work like products (X3, 2026-11-24): `src/lib/accessories.ts` (`getAccessoryBySlug`, `getRelatedAccessories` by shared category, `getAccessoriesForProduct`, `getAllAccessorySlugs`), `src/lib/specLines.ts` (specs typed as one `Label: value` per line), `src/lib/accessoryPrice.ts`, `src/components/accessories/AccessoryCard.tsx`, detail page `src/app/[locale]/accessories/[slug]/`, admin form `src/app/admin/(dashboard)/accessories/` (`productOptions.ts` for the works-with checkboxes). Product pages show "accessories for this machine". Route kind `accessory` in `routeMap.ts` and `proxy.ts`; accessories are in the sitemap.
- Quote list: `src/lib/quoteCart.tsx` (localStorage `mypos-quote-cart`, items carry `kind: "product" | "accessory"`, `priceFrom: number | null`; lists saved before have no kind and load as machines), `src/components/products/CompareClient.tsx` (type column, "ask for a price"). The server (`compare/actions.ts`, `parseQuoteLines`) stores slug, name and quantity only.
- Header quote button: `src/components/products/CompareCartLink.tsx`, `src/components/layout/Header.tsx` (`ClipboardList` icon, label from `nav.compareShort` with a fallback).
- Admin cookies: `src/lib/cookieSecurity.ts` decides the Secure flag from the real protocol (see `ADMIN_COOKIE_SECURE` in section 6). `src/app/admin/(dashboard)/LeadAutoRefresh.tsx` refreshes the dashboard and lead lists every 30 seconds and when the tab becomes visible, never while a field has focus.

## 5. Data model in one paragraph

Products, accessories, reference cases, blog posts, job postings, KB articles and KB categories each have a base table plus a `*Translation` table per locale. `PageContent(namespace, key, locale, value)` stores all other copy (arrays and objects as JSON strings). `SiteSetting(key, value)` stores company info, links, Pixel IDs, stats, shop switches, the hidden-product list and catalog JSON. `SiteImage(key, url)` names the photo slots. Leads and transactions: `ContactMessage`, `QuoteRequest(+Item)`, `WarrantyClaim`, `Order(+Item)`, `NewsletterSubscriber`. Orders snapshot names and prices at order time.

## 6. Environment variables (names only, values are secrets)

Local files `.env` (Prisma CLI) and `.env.local` (the app) are gitignored. AI tools in this workspace are denied read access to them, so do not try.

| Variable | Used for |
|---|---|
| `DATABASE_URL` | PostgreSQL (both files) |
| `SESSION_SECRET` | signs admin sessions (required) |
| `TWO_FACTOR_ENCRYPTION_KEY` | base64, 32 bytes (`openssl rand -base64 32`). Encrypts two-step login secrets and keys the backup-code hashes. Never reuse `SESSION_SECRET`. Without it, accounts without two-step login work as before, and turning it on or signing in with a code fails closed with a Thai message. If it is lost or changed, every enrolled secret is unreadable: use the reset script for each account. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | only `prisma/seed-admin-user.ts` creates the first admin |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | uploads (bucket defaults to `uploads`) |
| `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LINE_NOTIFY_TO` | LINE alerts and webhook |
| `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO` | email alerts |
| `NEXT_PUBLIC_GA_ID` | optional GA4 fallback (the admin setting wins) |
| `ADMIN_BASE_URL` | optional. Origin of the "open in admin" link in LINE and email alerts (`src/lib/alertLink.ts`), e.g. `http://192.168.0.109:3000` on the test server. Empty = `https://mypos.co.th`, which still serves the old site. LINE links get `openExternalBrowser=1` so they open in the phone's browser, where the admin is signed in, not in LINE's in-app browser. |
| `ADMIN_COOKIE_SECURE` | optional `true` / `false`. Unset: admin cookies are Secure only when the request arrived over HTTPS (`x-forwarded-proto`, else the `Origin` of the login post). Before 2026-11-24 they were always Secure in production, so over plain http (the test server) the browser dropped them and every refresh went back to the login page. |

Trap seen on 2026-11-24: a `DATABASE_URL` left in the shell environment (for example a scratch URL) wins over `.env`. Scripts that must hit the shared DB load it from `.env` explicitly and print the target host (`.agents/tasks/accessory-x3/run-migrate.ps1`).

Notifications are skipped silently when not configured. `/admin/launch` shows whether they are on. If neither channel is set, nobody is told about new leads except by the admin badges.

## 7. Admin map (`/admin`)

Sidebar groups are defined in `src/app/admin/(dashboard)/adminNav.ts`:

- Overview: dashboard, launch checklist, content playbook.
- Customers and sales: orders, quote requests, contact messages, warranty claims, newsletter.
- Products: products, accessories, catalog (lines and business types).
- Website: edit-on-site (click text or photos on the live page), page content, photos and logos, section order, navigation.
- Extra content: reference cases, blog, KB articles, KB categories, trust logos, official partners, careers.
- Settings: site settings, admin users, change history. These three are owner-only (role `owner`); editors get the P3 notice page. Everything else is open to both roles.
- Account (every admin, `/admin/account`, linked as "บัญชีของฉัน" under the user name in the sidebar): turn two-step login on or off for your own account (authenticator app, QR plus manual key, 10 one-time backup codes shown once), change your own password. Two-step login is optional for everyone (decision R2c). Login step 2 is `/admin/login/2fa` (5-minute signed cookie `mypos_admin_2fa`, no session until the code is right). Wrong codes use the same 5-in-15-minutes limiter key as wrong passwords, plus a per-account key `2fa:user:<id>`. Code: `src/lib/twoFactor.ts`, `twoFactorPure.ts`, `totp.ts`, `secretBox.ts`, `backupCodes.ts`; checks: `tests/unit/twoFactor.test.ts`, `.agents/tasks/admin-v2/verify/twofa-db.ts` (scratch DB on port 5433 only).

Every admin Server Action must call `requireAdmin()` itself (`src/lib/adminAuth.ts`). The `/admin` check in `proxy.ts` is only the first line, because actions are reachable as public endpoints.

## 8. Data scripts (`prisma/`)

All of these default to a dry run. `--write` first saves a JSON backup to `prisma/backups/` (gitignored). Follow this convention for any new script.

- `strip-emoji.ts` (`--self-test`), `migrate-slugs.ts`, `hide-test-product.ts` (`--restore`), `split-phone-numbers.ts`, `update-hub-seo-copy.ts` (`--restore`). All were applied to the shared database on 2026-11-21.
- New (admin-improve): `backup-db.ts` (`--write`, `--verify <file>`, `--self-test`; JSON export, not a host backup) and `find-orphan-uploads.ts` (`--write`, `--restore <manifest>`, `--self-test`; moves unreferenced files to `_trash/`, never deletes).
- Older `add-*.ts` and `seed*.ts` files are one-time idempotent copy seeders. `update-software-features.ts` overwrites `software.features.items`, so do not run it blindly.
- `reset-2fa.ts --email <address> [--write] | --self-test` (R4a): turns off two-step login for one account (clears the encrypted secret, enabled date and last step, deletes its backup codes) and writes a `2fa_reset` history row (source `script`, OS user and host in the detail). Dry run by default. `--write` saves the encrypted blob in `prisma/backups/` first. Needs a shell with `DATABASE_URL` on the server.
- Run TypeScript scripts with `node node_modules/tsx/dist/cli.mjs <file>` on this Windows machine.

## 9. Verification commands and scripts

```
npx tsc --noEmit
npm run lint
npm run build
node node_modules/tsx/dist/cli.mjs prisma/strip-emoji.ts --self-test
node node_modules/tsx/dist/cli.mjs .agents/tasks/check-slugs.ts            # read-only, expects 0 unsafe slugs
pwsh -NoProfile -File .agents/tasks/bug-fix/recheck.ps1                    # needs dev server on :3000, writes recheck.txt
node .agents/tasks/bug-fix/recheck-404.cjs                                 # needs PW_PATH, see below
node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/csv-selftest.ts
node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/leadlist-selftest.ts
node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/upload-selftest.ts
node node_modules/tsx/dist/cli.mjs prisma/find-orphan-uploads.ts --self-test
node node_modules/tsx/dist/cli.mjs prisma/backup-db.ts --self-test
```

Admin rendered checks use a scratch Postgres (Docker, port 5433) and never the shared database: `prisma db push`, `prisma/seed-admin-user.ts`, `.agents/tasks/admin-improve/seed-leads-scratch.ts` (refuses any other DATABASE_URL), `npm run build`, `next start -p 3100`, then `.agents/tasks/admin-improve/run-verify.ps1` (lists, search, pages, CSV; add `-Mode empty` after `seed-leads-scratch.ts --empty`), `verify-upload.cjs`, `headers-http.cjs`, `headers-check.cjs`.

Admin v2 (roles, history, two-step login): unit tests run with `npm test` (176 tests at `1709138`; `tests/unit/twoFactor.test.ts` expects `TWO_FACTOR_ENCRYPTION_KEY` to be unset in the shell). Rendered checks need a scratch Postgres with `.agents/tasks/admin-v2/admin-v2-schema.sql` applied (`.agents/tasks/admin-v2/scratch-pg.ps1`, port 5433, never the shared DB), then `.agents/tasks/admin-v2/verify/run-v2.ps1` (seeds with `seed-v2-verify.ts`, builds, starts `next start -p 3100`, runs `v2-ui.cjs` for roles and history and `v2-2fa.cjs` for two-step login; needs `PW_PATH`). DB-level checks: `roles-db.ts`, `history-db.ts`, `twofa-db.ts` in the same folder, run with `node node_modules/tsx/dist/cli.mjs`. The report is `.agents/tasks/admin-v2/verify.md` (53/53 and 29/29 at `1ea4a18`). That folder is not tracked by this branch.

Scratch database for rendered checks (2026-11-24): Docker container `mypos-scratch-pg` on port 5433 (user/password/db `scratch`/`scratch`/`mypos_scratch`, kept, stopped). `.agents/tasks/accessory-x3/scratch.ps1` recreates it from the old schema and copies public content from the shared DB with read-only SELECTs (`copy-to-scratch.ts`; no leads, admins or history leave the shared DB), then applies the X3 SQL. `seed-scratch-admin.ts` creates `owner@scratch.test` / `scratch-only-Passw0rd` (scratch only). Start the app against it with `$env:DATABASE_URL='postgresql://scratch:scratch@localhost:5433/mypos_scratch'; node node_modules\next\dist\bin\next start -p 3100`.

- Accessory X3: `.agents/tasks/accessory-x3/verify-x3.ps1` (39 browser checks on scratch, last 39/39), `live-check.ps1` (21 read-only checks against the shared DB, last 21/21).
- Admin session and auto-refresh: `.agents/tasks/admin-session/run-verify.ps1 control 1` (old behaviour with `ADMIN_COOKIE_SECURE=true`, refresh goes to login) and `run-verify.ps1 normal 0` (5/5). Uses `http://<LAN IP>:3100`, the server must listen on `-H 0.0.0.0`.
- **Whole-site scan:** `.agents/tasks/bug-scan/prep.ps1` (starts scratch, seeds sample leads) then `run-scan.ps1` with the scratch server on :3100. `scan.cjs` opens every sitemap page in th/en/zh plus compare/search/checkout, checks status, JS and console errors, broken images, h1 count, raw message keys, overflow at 1440 and 390 px, every internal link, clicks every button (reloading the page per button, skipping form submits and destructive labels in the admin), submits the public forms, opens every admin page and one new/edit form of each kind, clicks admin buttons and saves each edit form unchanged. Analytics and pixels are blocked during the scan. Results: `findings.json`, `scan-log.txt`. Known false positives, checked by `investigate.cjs` (`inv-log.txt`): `button-click-failed` for buttons with a disabled twin of the same label (navigation editor) or inside a closed `<details>` (catalog), `button-no-effect` for buttons behind `window.confirm` (Playwright dismisses dialogs), contact and warranty "no success" (the success text did not match the scanner's regex), and `save-unchanged-error` (the selector matched the red Delete button). `ERR_FAILED` on `mypos-c300h` is the scratch-only test video.

`recheck.ps1` covers the five scan bugs and the LINE link in 40 checks. `.agents/tasks/fix-round2/e2e.ps1` covers the old-site redirects, the zh K1 title, the Thai login page and the honeypot fields in 18 checks. Last result (2026-11-23, production build on :3000): 40/40 and 18/18 pass. Browser scripts need Playwright: `PW_PATH=C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright`.

## 10. Environment quirks (Windows, user name contains `^`)

- `cmd` and `npx` strip the `^` in the user name. Run global tools as `node <full path>`.
- The terminal sometimes prefixes the first token with a stray character. Start commands with `$null;`.
- Long multi-line terminal output is sometimes lost. Write results to a file and read the file.
- `Remove-Item` can be denied. Use the editor's delete tool instead.
- Dev server: `npm run dev` on port 3000. Do not leave long-running servers behind.
- Inline `pwsh` commands with quotes, `$` or `++` are often mangled by the agent terminal. Put the commands in a `.ps1` file under `.agents/tasks/` and run `pwsh -NoProfile -File <file>`, writing output to a text file.
- Thai text printed by Node to the console comes out garbled; read the output file or write JSON instead.
- A local `next build` caches ISR pages from whatever `DATABASE_URL` it was built with. Rebuild against the shared DB after scratch runs (`.agents/tasks/accessory-x3/build-live.ps1`).
- `gh` is authenticated as `Zoniic` with the workflow scope. After a push, watch CI with `gh run watch <id> --exit-status` (`.agents/tasks/admin-session/push.ps1`).
- The machine is set to stay awake (lid action on AC: do nothing). A Windows Update restart was pending on 2026-11-20.

## 11. Current state and history

Done and pushed:

- Lucide-only and no-emoji rule with lint enforcement and content cleanup.
- Bug scan fixes: KB article 404 (slug decoding), lowercase slugs plus 308 redirects, real HTTP 404s, contact map fallback (iframe only for a real embed URL), stats band filtering, `TEST` product hidden.
- SEO week 1: `companyInfo()` as the single source of company data, LINE fallback link, hub page titles and descriptions, Blog JSON-LD fix, owner guide.
- Office and sales phone numbers shown separately.
- 2026-11-23: 90 old-site redirects, honeypot fields, unit tests and CI, README rewrite, zh K1 title fix.
- 2026-11-24, admin v2 (change history, owner/editor roles, optional two-step login, Docker packaging): merged, schema applied to the shared DB with backups (`.agents/tasks/admin-v2/migrate-log.txt`), pushed (`8b37136`). All 8 existing admins are owners.
- 2026-11-24, header quote button (`ClipboardList` icon, label "ใบเสนอราคา" at 1280 px and up, icon and count below, shown in the mobile bar only when the list has items): `9e92cbb`.
- 2026-11-24, accessories work like products (X3): clickable cards, "+" add to quote, detail pages, price/stock/gallery/specs/PDF/video, works-with machines shown on both sides, type column in the quote list, old `FM2200.php` and `F-330K-4B4C.php` redirect to the accessory pages. Code `1d60443`. Schema applied to the shared DB on 2026-11-24 (7 columns, table `_AccessoryCompatibleProducts`, 21 copy rows; backups `prisma/backups/accessory-x3-before-2026-11-24T09-03-37-393Z.json`, `full-2026-11-24T09-03-43-314Z.json`; log `.agents/tasks/accessory-x3/migrate-log.txt`), pushed `3210213`. Undo SQL: `.agents/tasks/accessory-x3/accessory-x3-undo.sql` (drops the new data).
- 2026-11-24, admin fixes (`1709138`, pushed, CI green): login no longer lost on refresh over plain http (Secure flag follows the protocol), lead lists refresh themselves every 30 seconds. The owner confirmed the test-server buttons work after switching to production mode.

### 11.2 Bug scan 2026-11-24

Scanned on the scratch DB with a build of `1709138`: 238 pages (th/en/zh), every internal link, every button, every public form, every admin page and form. Clean: no broken internal links, no mobile overflow, no dead public buttons, all public forms store their row, every admin edit form saves unchanged without an error, menu reorder buttons work. Real findings are B1 to B5 in section 0. `npm audit --omit=dev`: 1 critical and 5 high (next, and Prisma dev tooling).

Redesign: the owner reviewed three rounds of Figma mockups (file key `RfzIGGGsN5zgLssxmgHouj`) and **rejected them. The current site design stays.** Do not start a redesign unless the owner asks. The Figma pages are only reference material. The run logs are in `.agents/tasks/design-10/` (concepts, reviews, `homes-v3.png`).

Reports worth reading: `.agents/tasks/seo-ai-search-audit.md`, `.agents/tasks/feature-media-audit.md`, `.agents/tasks/bug-scan-2026-11-20.md`, `.agents/tasks/bug-fix/review.md`.

## 12. Backlog

### 12.1 Needs the owner (not code)

Details and where to find each value are in `docs/owner-data-guide-th.md`.

- Google Maps embed URL (`/admin/settings`). Until then the contact page shows the address and an "Open in Google Maps" button.
- Homepage stats values (businesses served, years, support). The band stays hidden until real values are entered.
- Legal name (Thai and English) and full address.
- LINE OA URL. The fallback `https://line.me/R/ti/p/@mypos` opens an "Add LINE friend" page. Ask the owner to confirm it is the company account.
- Facebook, YouTube, TikTok, Instagram URLs, and Pixel IDs (GA4, Meta, TikTok).
- Old `.php` URLs: done from a crawl of the old site on 2026-11-23 (90 redirects in `src/data/legacyRedirects.ts`, list in `.agents/tasks/fix-round2/old-site.txt`, checked by `tests/unit/legacyRedirects.test.ts`). Once the domain is in Search Console, compare its indexed URLs with that list and add any that are missing.
- Replace the confirmed renders on the live site with real photos: home hero video, `solution-self-order` slot, `a-beachside-resort-hotel` reference photo. Answer whether `software-hero` is real.
- Blog cover images (all 11 posts have none; the article JSON-LD omits `image` as a result).
- Datasheet PDFs per product (`datasheetUrl`; `tongluay` holds the invalid value `500`, see B2).
- Accessory prices, stock, specs, photos and works-with machines (all empty after X3).
- Deployment: no production deploy exists. Decide hosting, the `x-forwarded-for` setup (section 12.3), `SESSION_SECRET`, notification credentials, and the domain switch.

### 12.2 Code and content fixes

1. Done 2026-11-23: zh title, summary and category of the K1 paper guide now read "K1 更换打印纸" / "更换打印纸" (`prisma/fix-zh-k1-title.ts`, backup `prisma/backups/fix-zh-k1-title-2026-11-23T08-12-28-034Z.json`, `--restore` available).
2. Done 2026-11-23: `README.md` rewritten.
3. Done 2026-11-23: `PHOTO-CHECKLIST.md` priority markers are text, not emoji.
4. Done 2026-11-23: login page, login errors and the admin-users pages are Thai. Slug errors from `slugFormError` and the public quote form errors are still English.
5. Hidden products are matched by exact slug with a 30 second proxy cache and a 300 second page cache. Document or move to a real `published` flag on `Product`.

### 12.3 Admin improvements, in suggested order

Found by reading the code on 2026-11-23. The table below was written on 2026-11-23. **Since then items 2, 3 and 4 (branch `admin-v2`) were merged into `main`, their SQL was applied to the shared DB and pushed on 2026-11-24** (section 11); read "branch `admin-v2`, not pushed" and "owner must approve the SQL" in the table as done. The list after the table is the original finding text.

| Item | Status | What is code | What still needs the owner or the host |
|---|---|---|---|
| 1 Lead handling | Done in code, verified on a scratch DB | Filter (status, assignee, topic, date range), search, 25-row pages, internal note, assignee, CSV export (BOM, quoting, formula guard) on contact messages, quote requests, warranty claims; newsletter uses the same CSV route (`src/lib/leadList.ts`, `src/lib/csv.ts`) | Applied to the shared database on 2026-11-23 with the owner's approval (`.agents/tasks/admin-improve/apply-sql-log.txt`; backup `prisma/backups/lead-tables-2026-11-23T07-14-50-131Z.json`). The lead list queries were run against the real data; the pages were not opened in a browser. |
| 2 Audit trail (change history) | Done in code on branch `admin-v2` (not pushed, not deployed), verified on a scratch DB | `AuditLog` written by every admin action and by edit-on-site (`src/lib/audit.ts`, `auditLog.ts`, `auditRegistry.ts`, `auditRestore.ts`). Owner-only screens `/admin/history` (list, filters, CSV) and `/admin/history/[id]` (before and after, restore of text fields), and the "ประวัติ (n)" button on Page Content fields. Kept 1 year, lazy purge inside `recordAudit`. | Owner must approve and apply `.agents/tasks/admin-v2/admin-v2-schema.sql` to the shared database (back up first with `prisma/backup-db.ts --write`). The merged app fails against the shared database until then. History starts on the day it is applied. |
| 3 Roles | Done in code on `admin-v2`, verified on a scratch DB | `AdminUser.role` (`owner` or `editor`, default `owner`). Owner-only: admin users, site settings, history. Role is read from the database on every request (`requireAdmin()`, `requireOwner()`, `getAdminContext()` in `src/lib/adminAuth.ts`; matrix in `src/lib/permissions.ts`; last-owner rule in `src/lib/adminUsers.ts`). Editors see `OwnerOnly.tsx`. `tests/unit/admin-guard.test.ts` fails if an action or route lacks its check. | Same SQL as item 2. Existing admins become owners; the owner sets the editors in `/admin/admin-users`. Editor scope for pages beyond the three owner-only areas is the default in `.agents/tasks/admin-v2/plan.md` section 7 item 6 and needs the owner's confirmation. |
| 4 Sessions (two-step login, current-password check) | Done in code on `admin-v2`, verified on a scratch DB | Optional TOTP two-step login (R2c), 10 backup codes, `/admin/account`, `/admin/login/2fa`, `prisma/reset-2fa.ts` (R4a). Editing an admin's email, password or role needs the acting admin's current password. | Same SQL. Set `TWO_FACTOR_ENCRYPTION_KEY` (section 6). Every admin signs in again once. Decide who may run the reset script and how, once the host is chosen. |
| 5 Rate limiting and public form input | Partly done (2026-11-23) | Login: with no client IP the limit is kept per account, so five wrong passwords no longer lock every admin out. Public forms (contact, quote, warranty, newsletter): every field is length-capped, quote and warranty emails are validated, the quote cart is validated server-side (`src/lib/formInput.ts`, checked by `.agents/tasks/admin-improve/formInput-selftest.ts`). With no client IP the public form limiter is skipped instead of sharing one bucket. | `src/lib/rateLimit.ts` is still in memory. Host: the reverse proxy must append the real client IP to `x-forwarded-for` (`docs/deploy-checklist-th.md` row 6); without it the public form limiter does nothing and a directly exposed app can have the header forged. Honeypot: done 2026-11-23 on contact, quote, warranty and newsletter (`HoneypotField`, `isBotSubmission`; a filled field gets a normal success reply and nothing is stored). Moving the limiter to a shared store is still open (needs a new table, so the owner's approval). |
| 6 Upload hygiene | Done in code, self-tested with a stub storage client | Signature check, resize to WebP (max 2000 px), old file moved to `_trash/<yyyymm>/` on replace and delete (never deleted), Thai upload errors, `prisma/find-orphan-uploads.ts` (dry run) | 2026-11-23, owner approved: 24 orphans (about 9 MB) moved to `_trash/` with the real bucket; a second dry run found 0 orphans and all 77 referenced upload URLs return 200. Undo: `--restore prisma/backups/orphan-uploads-manifest-2026-11-23T07-53-21-337Z.json`. Emptying `_trash` still needs the owner. The replace/delete path in the admin is not yet tested against the real bucket. |
| 8 Security headers | Done, report-only | `next.config.ts` sends nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and `Content-Security-Policy-Report-Only` | Enforcing CSP needs the owner's approval and a clean run with real pixel IDs. HSTS goes on the proxy. |
| 9 Notifications | Done | Amber banner on every admin page when neither LINE nor email is set | Set the credentials (`NOTIFY_*`, `RESEND_API_KEY`, LINE). |
| 10 Backups | Partly | `prisma/backup-db.ts` (JSON export, dry run by default, `--write`, `--verify`) | Host backup schedule and restore test (checklist rows 10, 11, 13). The script is not a host backup. |

Still open after admin v2: item 7 (content history) is covered by the new history for edits made after the SQL is applied, nothing earlier exists. Not exercised in a browser: the password card on `/admin/account`, the retention purge, edit-on-site history rows, history rows for models other than AdminUser, PageContent, SiteSetting and ContactMessage, and enabling two-step login with the key missing. Open decisions: hosting and region, who runs `reset-2fa.ts`, editor scope (plan section 7). `next.config.ts` sets `output: "standalone"` unconditionally (the plan wanted a build variable); `/api/health?db=1` is not implemented. The rate limiter is still in memory, so run one replica.

Numbering note: the owner's request "1, 5, 6" was worked as lead handling, uploads and deploy-time values (headers, banner, backups, checklist). In the list below item 5 is rate limiting and item 6 is uploads, so item 5 is only covered on the host side. Confirm with the owner whether the shared rate-limit store is wanted.

1. **Lead handling.** `contact-messages`, `quote-requests` and `warranty-claims` list every row with no limit, no search, no status filter, no pagination. Orders are capped at 200 rows. Leads have a status but no internal note and no owner (orders have `adminNote`). Only the newsletter list exports CSV (a `data:` link). Add filter, search, pagination, a note and assignee field, and CSV export for all lead lists.
2. **Audit trail.** Nothing records who changed or deleted a product, a setting or a lead status. Add an `AuditLog` table written by the admin actions (user, action, entity, time).
3. **Roles.** Every admin can delete users, change payment settings and delete products. Add at least an owner role and an editor role.
4. **Sessions.** Partly done 2026-11-23: the session token carries a fingerprint of the password hash (`passwordVersion` in `src/lib/adminAuth.ts`) and `requireAdmin()` rejects it when the password has changed, so a new password ends all other sessions (the admin who changed their own password gets a fresh cookie). No schema change. Tokens issued before this change have no fingerprint, so every admin must sign in once again after this code is running. Still open (needs UI and a Figma mockup first): two-factor login, a current-password check when an admin edits an account.
5. **Rate limiting.** `src/lib/rateLimit.ts` is in memory: it resets on restart and is per instance. `clientIp()` trusts the rightmost `x-forwarded-for` value, which is correct only behind a proxy that appends the real client IP (nginx `proxy_add_x_forwarded_for`). Behind other setups it is wrong. Move to a shared store (database or Redis) before scaling out.
6. **Upload hygiene.** Uploads are checked by the browser-supplied MIME type only, not by file signature, and are not resized. Deleting a record or replacing an image does not delete the old file from Supabase Storage (no removal calls were found), so orphans accumulate. Add signature checks, automatic resizing to WebP, and cleanup.
7. **Content history.** `PageContent` keeps only `updatedAt`, so an overwritten text cannot be restored. Add a revisions table or at least a "previous value" column.
8. **Security headers.** `next.config.ts` sets no CSP, `X-Frame-Options`, HSTS or `Referrer-Policy`. Check whether the reverse proxy sets them; if not, add them in the app.
9. **Notifications.** Alerts depend on environment variables only. If both channels are unset, new leads are visible only as admin badges. Consider a visible warning on the dashboard, not only on `/admin/launch`.
10. **Backups.** Only the data scripts take backups. Confirm the database host has scheduled backups before launch.

## 13. How to work here

- Make the smallest change that satisfies the request. No unrequested refactors or new features.
- After code changes run `npx tsc --noEmit`, `npm run lint` and `npm run build`. For page behaviour, start the dev server and check the rendered result in th, en and zh. A passing build is not proof that a page works.
- Commit one concern per commit with a clear message. Do not push without the owner's approval.
- Put new audit reports and throwaway scripts in `.agents/tasks/`, not in `src/`.
- Keep `docs/owner-data-guide-th.md` in step when you add an owner-supplied setting.

## 14. Stale documents

`README.md` was rewritten on 2026-11-23 and matches the code. `/public/uploads` is a gitignored leftover from before Supabase Storage. If a document and the code disagree, trust the code and fix the document.
