# MYPOS Website

Next.js (App Router) + TypeScript + Tailwind CSS + `next-intl` (th/en/zh) + MySQL (via Prisma) as the content backend, with a password-protected admin panel at `/admin`.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/th` (default locale). Switch languages with the buttons in the header, or visit `/en` / `/zh` directly.

Admin panel: http://localhost:3000/admin/login (password is `ADMIN_PASSWORD` in `.env.local`).

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # ESLint
```

### Environment variables

Two files, both gitignored:
- `.env` — `DATABASE_URL` only (Prisma CLI reads `.env`, not `.env.local`).
- `.env.local` — `DATABASE_URL` again (for the Next.js app at runtime), plus `ADMIN_PASSWORD` and `SESSION_SECRET`.

**Change `ADMIN_PASSWORD` and `SESSION_SECRET` before deploying** — the checked-in values are dev-only placeholders.

## Project structure

```
src/
  app/[locale]/          # every public page, one folder per route (App Router)
  app/admin/             # admin panel (outside the [locale] tree — no i18n prefix)
    (dashboard)/           # authenticated pages: products/accessories/references/content CRUD
    login/                 # login form + server action
  components/
    ui/                   # generic building blocks (Button, Breadcrumb, PlaceholderImage)
    layout/                # Header, Footer, StickyMobileBar, LanguageSwitcher
    sections/               # homepage/solution section blocks (Hero, FaqAccordion, ...)
    products/                 # products listing/detail specific pieces
    references/                # references page filter
    seo/                        # JsonLd helper
  data/                   # solutions config, legacy redirect map (static, not DB-backed)
  i18n/                   # next-intl routing/navigation/request config
  lib/
    prisma.ts               # Prisma client singleton
    products.ts              # DB-backed product queries (replaces the old static array)
    messages.ts               # reconstructs next-intl's `messages` object from MySQL
    adminAuth.ts                # session cookie sign/verify (jose)
  config/site.ts          # company name, URL, phone, email, LINE/Facebook links
prisma/
  schema.prisma           # Product, Accessory, ReferenceCase (+ translations), PageContent
  seed.ts                 # one-time migration from the old messages/*.json + data/products.ts
messages/
  th.json / en.json / zh.json   # NO LONGER read at runtime — kept only as the seed source
```

## Content is in MySQL, not static files

All page copy, products, accessories, and case studies live in the database and are edited through **`/admin`** — changes appear on the live site immediately (every `[locale]/*` page is force-dynamic; nothing is prerendered at build time). `messages/*.json` is no longer imported by the app; it's kept purely as the source the one-time `prisma/seed.ts` migration read from.

Data model (see `prisma/schema.prisma`):
- **`Product`** + **`ProductTranslation`** (one row per locale: name, highlight) — specs/price/category are shared across locales.
- **`Accessory`** + **`AccessoryTranslation`**.
- **`ReferenceCase`** + **`ReferenceCaseTranslation`** (case studies on `/references` and each solution page).
- **`PageContent`** — generic `(namespace, key, locale) -> value` store for everything else (hero text, FAQ, about, contact labels, ...). Arrays/objects (like FAQ items) are stored as a JSON string in `value`, and are validated before saving — invalid JSON is rejected with an error instead of corrupting the field. Edit these under **Admin → Page Content**.
- **`SiteSetting`** — phone, email, LINE, Facebook, Google Maps embed URL, and homepage stats (businesses served / years / support). Edit under **Admin → Site Settings**.
- **`SiteImage`** — named photo slots (homepage hero, about page ×2, each solution's photo, software page hero) — a fixed set of 8 known image spots the site's layout expects. Edit under **Admin → Site Photos**.
- **`TrustLogo`** — the "Trusted by" logo strip on the homepage. Falls back to showing the name as text until a logo image is uploaded. Edit under **Admin → Trust Logos**.

### What's still not admin-editable

- **Header/footer menu structure** (which links appear, their order) is hardcoded in `Header.tsx` / `Footer.tsx` — the page set is fixed by the file-based routes anyway, so this would need a dedicated menu-builder feature to become dynamic. Menu *labels* are editable via `nav.*` in Page Content.
- **301 redirects** (`src/data/legacyRedirects.ts`) and **company name/domain** (`src/config/site.ts`) are still code, since they're deployment-level concerns rather than day-to-day content.

## Adding a product / accessory / case study

Use the admin panel: **Admin → Products/Accessories/Case Studies → New**. No code changes, no redeploy.

## Uploading photos

Product and accessory forms in the admin panel have a **Photos** section with file inputs. Each one shows the current photo (if any), the exact spec expected, and an instant preview of the file you just picked, before you save:

- **Product main photo**: square, ≥1000×1000px, plain/white background preferred.
- **Product gallery photos** (side/back/in-use): same spec, optional, up to 3.
- **Accessory photo**: square, ≥800×800px.
- All: JPG, PNG, or WebP, max 5MB.

Uploaded files are saved to `public/uploads/{products|accessories}/` on the server disk (not committed to git — see `.gitignore`) and served at `/uploads/...`. **This only works when self-hosting** (a VPS, or `npm run start` on a persistent machine) — it will **not** work on Vercel, whose serverless functions have no persistent filesystem. If you deploy to Vercel later, this needs to be swapped for a cloud storage provider (S3, Cloudinary, Vercel Blob, etc.) — ask for that when you're ready.

Pages fall back to a labeled gray placeholder tile automatically until a real photo is uploaded, so nothing breaks in the meantime.

## Editing marketing copy (hero, FAQ, about, etc.)

**Admin → Page Content**, pick the namespace (e.g. `home`, `about`, `solutions`), edit the field for each language, save.

## What's still placeholder — replace before launch

- **All body copy** — written as reasonable placeholder text, not the real DEV-SPEC/prototype wording.
- **Images** — every photo is a gray placeholder tile rendered via `next/image` at the correct aspect ratio (`src/components/ui/PlaceholderImage.tsx`). Swap the `src` for real photography; the layout won't need to change.
- **Product prices, specs, datasheets** — mostly real now (pulled from the MYPOS brochure), but `datasheetUrl` is still unset on every product (the page shows a "coming soon" state) until you have real PDFs to link.
- **Contact info** — phone is `02-XXX-XXXX` (area code confirmed, local digits still placeholder). Update `src/config/site.ts`.
- **Map** — `/contact` embeds a generic Google Maps query for "Bangkok, Thailand". Once you have a real address, update the `src` in `src/app/[locale]/contact/page.tsx`.
- **LINE OA** — `siteConfig.lineUrl` points at `https://line.me/R/ti/p/@mypos` (real LINE ID from the brochure). The QR code image is still a placeholder tile.
- **301 redirects** — `src/data/legacyRedirects.ts` has the mapping structure and commented examples, but no real entries yet. Fill it in from the old site's URL list / Search Console export.
- **Contact form** — `src/components/contact/ContactForm.tsx` is a UI-only placeholder; it doesn't send anywhere yet (see Phase 8 below).

## SEO

- `robots.txt` and `sitemap.xml` are auto-generated (`src/app/robots.ts`, `src/app/sitemap.ts`) and unblock all crawlers.
- Every page sets a unique title/description, canonical URL, and hreflang alternates for th/en/zh (`src/lib/seo.ts`).
- Every page gets its own dynamically generated OG image (`src/lib/ogImage.tsx` + `opengraph-image.tsx` in each route folder).
- Schema.org JSON-LD: `Organization`, `Product`, `FAQPage`, `BreadcrumbList`, `ItemList` where relevant.

## Deploying

Not yet deployed. To put this on Vercel:

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it at vercel.com — Vercel auto-detects Next.js, no config needed.
3. Add the same environment variables from `.env`/`.env.local` (`DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`) in the Vercel project settings, with a strong password and secret for production.
4. The MySQL server must be reachable from Vercel's servers — a local-network IP (like the current `192.168.0.222`) will **not** work once deployed. Either open that server to the internet with a firewall rule/VPN, or migrate to a hosted MySQL (PlanetScale, Railway, AWS RDS, etc.) before going live.
5. Add `mypos.co.th` as a custom domain in the Vercel project settings and point your DNS at Vercel per their instructions.
6. Once live, submit `https://mypos.co.th/sitemap.xml` to Google Search Console and request indexing.

This requires your Vercel account, DNS access, and a decision on MySQL hosting, so it wasn't done automatically.

## Lighthouse (last local run)

Home page: Performance 93-96, Accessibility 100, Best Practices 100, SEO 92 (the SEO "canonical" flag is a false positive from testing on `localhost` instead of the real domain — canonical URLs are correctly set to `https://mypos.co.th/...` in the code). Re-run after deploying to get real-world numbers — a CDN-hosted deploy with real (optimized) images will likely improve LCP further.
