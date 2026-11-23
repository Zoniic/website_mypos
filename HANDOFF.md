# MYPOS website: handoff for the next AI or developer

Written 2026-11-23 against commit `a9092b6` on `main` (`origin/main` is identical). Read this file first, then `AGENTS.md`, `PRODUCT.md` and `DESIGN.md`. Where this file and `README.md` disagree, this file is correct (see "Stale documents").

The owner communicates in Thai. Reply to the owner in Thai, keep answers short, and offer short answer codes ("1a 2b") for decisions.

## 1. What this project is

The marketing and lead-generation website of MYPOS (FMT Corporation), a Thai maker of POS terminals and self-order kiosks. Success is measured in contact and quote requests, not online checkout (`PRODUCT.md`). The site is Thai-first with English and Chinese (`/th`, `/en`, `/zh`). A password-protected admin at `/admin` edits almost everything.

Production state: **this app is not deployed.** `https://mypos.co.th/` still serves the old site (Apache, checked 2026-11-23). `src/config/site.ts`, canonical URLs, the sitemap and JSON-LD already point at `https://mypos.co.th`, so they are only correct after the domain is switched.

## 2. Stack (verified in the repo)

- Next.js 16.3.6 (App Router, Turbopack), React 19.2.4, TypeScript, Tailwind CSS v4.
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

## 4. Code map

```
src/app/[locale]/        public pages (one folder per route), ISR with admin-driven revalidation
src/app/admin/           admin (outside the locale tree): login, logout, live (edit-on-site), goto, (dashboard)/*
src/app/api/line/webhook LINE webhook (404 until LINE_CHANNEL_SECRET and token are set)
src/app/feeds/           product feed
src/components/          ui, layout, sections, products, commerce, contact, edit (edit-on-site overlay), seo
src/lib/                 all data access and helpers (products.ts, kb.ts, blog.ts, orders.ts, siteSettings.ts, ...)
src/proxy.ts             admin gate, legacy-slug 308s, real 404s, then next-intl
src/data/                static config: solutions, categories, legacyRedirects.ts (empty, see backlog)
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

## 5. Data model in one paragraph

Products, accessories, reference cases, blog posts, job postings, KB articles and KB categories each have a base table plus a `*Translation` table per locale. `PageContent(namespace, key, locale, value)` stores all other copy (arrays and objects as JSON strings). `SiteSetting(key, value)` stores company info, links, Pixel IDs, stats, shop switches, the hidden-product list and catalog JSON. `SiteImage(key, url)` names the photo slots. Leads and transactions: `ContactMessage`, `QuoteRequest(+Item)`, `WarrantyClaim`, `Order(+Item)`, `NewsletterSubscriber`. Orders snapshot names and prices at order time.

## 6. Environment variables (names only, values are secrets)

Local files `.env` (Prisma CLI) and `.env.local` (the app) are gitignored. AI tools in this workspace are denied read access to them, so do not try.

| Variable | Used for |
|---|---|
| `DATABASE_URL` | PostgreSQL (both files) |
| `SESSION_SECRET` | signs admin sessions (required) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | only `prisma/seed-admin-user.ts` creates the first admin |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | uploads (bucket defaults to `uploads`) |
| `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LINE_NOTIFY_TO` | LINE alerts and webhook |
| `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO` | email alerts |
| `NEXT_PUBLIC_GA_ID` | optional GA4 fallback (the admin setting wins) |

Notifications are skipped silently when not configured. `/admin/launch` shows whether they are on. If neither channel is set, nobody is told about new leads except by the admin badges.

## 7. Admin map (`/admin`)

Sidebar groups are defined in `src/app/admin/(dashboard)/adminNav.ts`:

- Overview: dashboard, launch checklist, content playbook.
- Customers and sales: orders, quote requests, contact messages, warranty claims, newsletter.
- Products: products, accessories, catalog (lines and business types).
- Website: edit-on-site (click text or photos on the live page), page content, photos and logos, section order, navigation.
- Extra content: reference cases, blog, KB articles, KB categories, trust logos, official partners, careers.
- Settings: site settings, admin users.

Every admin Server Action must call `requireAdmin()` itself (`src/lib/adminAuth.ts`). The `/admin` check in `proxy.ts` is only the first line, because actions are reachable as public endpoints.

## 8. Data scripts (`prisma/`)

All of these default to a dry run. `--write` first saves a JSON backup to `prisma/backups/` (gitignored). Follow this convention for any new script.

- `strip-emoji.ts` (`--self-test`), `migrate-slugs.ts`, `hide-test-product.ts` (`--restore`), `split-phone-numbers.ts`, `update-hub-seo-copy.ts` (`--restore`). All were applied to the shared database on 2026-11-21.
- New (admin-improve): `backup-db.ts` (`--write`, `--verify <file>`, `--self-test`; JSON export, not a host backup) and `find-orphan-uploads.ts` (`--write`, `--restore <manifest>`, `--self-test`; moves unreferenced files to `_trash/`, never deletes).
- Older `add-*.ts` and `seed*.ts` files are one-time idempotent copy seeders. `update-software-features.ts` overwrites `software.features.items`, so do not run it blindly.
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

`recheck.ps1` covers the five scan bugs and the LINE link in 40 checks. `.agents/tasks/fix-round2/e2e.ps1` covers the old-site redirects, the zh K1 title, the Thai login page and the honeypot fields in 18 checks. Last result (2026-11-23, production build on :3000): 40/40 and 18/18 pass. Browser scripts need Playwright: `PW_PATH=C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright`.

## 10. Environment quirks (Windows, user name contains `^`)

- `cmd` and `npx` strip the `^` in the user name. Run global tools as `node <full path>`.
- The terminal sometimes prefixes the first token with a stray character. Start commands with `$null;`.
- Long multi-line terminal output is sometimes lost. Write results to a file and read the file.
- `Remove-Item` can be denied. Use the editor's delete tool instead.
- Dev server: `npm run dev` on port 3000. Do not leave long-running servers behind.
- The machine is set to stay awake (lid action on AC: do nothing). A Windows Update restart was pending on 2026-11-20.

## 11. Current state and history

Done and pushed:

- Lucide-only and no-emoji rule with lint enforcement and content cleanup.
- Bug scan fixes: KB article 404 (slug decoding), lowercase slugs plus 308 redirects, real HTTP 404s, contact map fallback (iframe only for a real embed URL), stats band filtering, `TEST` product hidden.
- SEO week 1: `companyInfo()` as the single source of company data, LINE fallback link, hub page titles and descriptions, Blog JSON-LD fix, owner guide.
- Office and sales phone numbers shown separately.

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
- Datasheet PDFs per product (`datasheetUrl`, unset according to the README, not re-verified).
- Deployment: no production deploy exists. Decide hosting, the `x-forwarded-for` setup (section 12.3), `SESSION_SECRET`, notification credentials, and the domain switch.

### 12.2 Code and content fixes

1. Done 2026-11-23: zh title, summary and category of the K1 paper guide now read "K1 更换打印纸" / "更换打印纸" (`prisma/fix-zh-k1-title.ts`, backup `prisma/backups/fix-zh-k1-title-2026-11-23T08-12-28-034Z.json`, `--restore` available).
2. Done 2026-11-23: `README.md` rewritten.
3. Done 2026-11-23: `PHOTO-CHECKLIST.md` priority markers are text, not emoji.
4. Done 2026-11-23: login page, login errors and the admin-users pages are Thai. Slug errors from `slugFormError` and the public quote form errors are still English.
5. Hidden products are matched by exact slug with a 30 second proxy cache and a 300 second page cache. Document or move to a real `published` flag on `Product`.

### 12.3 Admin improvements, in suggested order

Found by reading the code on 2026-11-23. Status of the work on branch `admin-improve` (2026-11-23, not pushed, not deployed) is in the table below. The list after it is the original finding text.

| Item | Status | What is code | What still needs the owner or the host |
|---|---|---|---|
| 1 Lead handling | Done in code, verified on a scratch DB | Filter (status, assignee, topic, date range), search, 25-row pages, internal note, assignee, CSV export (BOM, quoting, formula guard) on contact messages, quote requests, warranty claims; newsletter uses the same CSV route (`src/lib/leadList.ts`, `src/lib/csv.ts`) | Applied to the shared database on 2026-11-23 with the owner's approval (`.agents/tasks/admin-improve/apply-sql-log.txt`; backup `prisma/backups/lead-tables-2026-11-23T07-14-50-131Z.json`). The lead list queries were run against the real data; the pages were not opened in a browser. |
| 5 Rate limiting and public form input | Partly done (2026-11-23) | Login: with no client IP the limit is kept per account, so five wrong passwords no longer lock every admin out. Public forms (contact, quote, warranty, newsletter): every field is length-capped, quote and warranty emails are validated, the quote cart is validated server-side (`src/lib/formInput.ts`, checked by `.agents/tasks/admin-improve/formInput-selftest.ts`). With no client IP the public form limiter is skipped instead of sharing one bucket. | `src/lib/rateLimit.ts` is still in memory. Host: the reverse proxy must append the real client IP to `x-forwarded-for` (`docs/deploy-checklist-th.md` row 6); without it the public form limiter does nothing and a directly exposed app can have the header forged. Honeypot: done 2026-11-23 on contact, quote, warranty and newsletter (`HoneypotField`, `isBotSubmission`; a filled field gets a normal success reply and nothing is stored). Moving the limiter to a shared store is still open (needs a new table, so the owner's approval). |
| 6 Upload hygiene | Done in code, self-tested with a stub storage client | Signature check, resize to WebP (max 2000 px), old file moved to `_trash/<yyyymm>/` on replace and delete (never deleted), Thai upload errors, `prisma/find-orphan-uploads.ts` (dry run) | 2026-11-23, owner approved: 24 orphans (about 9 MB) moved to `_trash/` with the real bucket; a second dry run found 0 orphans and all 77 referenced upload URLs return 200. Undo: `--restore prisma/backups/orphan-uploads-manifest-2026-11-23T07-53-21-337Z.json`. Emptying `_trash` still needs the owner. The replace/delete path in the admin is not yet tested against the real bucket. |
| 8 Security headers | Done, report-only | `next.config.ts` sends nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and `Content-Security-Policy-Report-Only` | Enforcing CSP needs the owner's approval and a clean run with real pixel IDs. HSTS goes on the proxy. |
| 9 Notifications | Done | Amber banner on every admin page when neither LINE nor email is set | Set the credentials (`NOTIFY_*`, `RESEND_API_KEY`, LINE). |
| 10 Backups | Partly | `prisma/backup-db.ts` (JSON export, dry run by default, `--write`, `--verify`) | Host backup schedule and restore test (checklist rows 10, 11, 13). The script is not a host backup. |

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
