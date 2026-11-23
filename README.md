# MYPOS Website

Marketing and lead-generation site for MYPOS (FMT Corporation), a Thai maker of POS terminals and self-order kiosks. Thai-first, with English and Chinese (`/th`, `/en`, `/zh`), and an admin panel at `/admin` that edits almost all content.

**Read [`HANDOFF.md`](./HANDOFF.md) before changing anything.** It holds the project rules, the code map, the current state and the backlog. Owner-supplied values and where to enter them are in [`docs/owner-data-guide-th.md`](./docs/owner-data-guide-th.md); deployment steps are in [`docs/deploy-checklist-th.md`](./docs/deploy-checklist-th.md).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4. This Next.js version differs from older ones: read `node_modules/next/dist/docs/` before changing Next APIs. Middleware lives in `src/proxy.ts`.
- next-intl 4 for routing. Page copy is stored in the database (`PageContent`), not read from `messages/*.json` at runtime (those files are the seed and the fallback).
- Prisma 6 with PostgreSQL. Uploaded files go to Supabase Storage (`src/lib/uploads.ts`), are checked by file signature and converted to WebP.
- Icons: `lucide-react` only. No emoji, enforced by ESLint and by the admin forms (`DESIGN.md` §10).

## Running locally

```bash
npm install          # also runs prisma generate
npm run dev          # http://localhost:3000 (redirects to /th)
```

Admin: http://localhost:3000/admin/login. The first admin account is created with `node node_modules/tsx/dist/cli.mjs prisma/seed-admin-user.ts` (reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`).

Environment files are gitignored: `.env` (read by the Prisma CLI) and `.env.local` (read by the app). Variable names and what they do are listed in `HANDOFF.md` §6. Never commit their values.

## Checks

```bash
npx tsc --noEmit     # types
npm run lint         # ESLint, including the Lucide/no-emoji rule
npm test             # unit tests in tests/unit (no database needed)
npm run build        # production build (some pages read the database while prerendering)
```

GitHub Actions (`.github/workflows/ci.yml`) runs the type check, lint and unit tests on every push and pull request to `main`. Page-level checks that need a running server and database are scripts in `.agents/tasks/bug-fix/` (see `HANDOFF.md` §9).

## Project structure

```
src/app/[locale]/   public pages, one folder per route (add new ones to src/lib/routeMap.ts too)
src/app/admin/      admin panel (outside the locale tree)
src/components/     UI building blocks, layout, page sections, forms
src/lib/            data access and shared helpers
src/data/           static config, including legacyRedirects.ts (old .php URLs)
src/proxy.ts        admin gate, old-slug redirects, real 404s, then next-intl
prisma/             schema and data scripts (dry run by default; --write takes a backup first)
tests/unit/         unit tests (node:test, run with tsx)
docs/               Thai guides for the owner
.agents/tasks/      audit reports, verification scripts and work logs (not part of the site)
```

## Content and data

Products, accessories, case studies, blog posts, knowledge-base articles and job postings each have a base table plus one translation row per locale. Other copy is in `PageContent`; settings such as contact details, Pixel IDs and stats are in `SiteSetting`; photo slots are in `SiteImage`. Leads (`ContactMessage`, `QuoteRequest`, `WarrantyClaim`) have a status, an internal note and an assignee, with search, filters and CSV export in the admin. Admin saves refresh the public pages at once; direct database writes show within 5 minutes.

## Deployment

Not deployed yet: `https://mypos.co.th` still serves the old site. Before switching, follow `docs/deploy-checklist-th.md` (hosting, reverse proxy with `x-forwarded-for`, secrets, notification channels, database backups). Redirects from the old `.php` pages are in `src/data/legacyRedirects.ts`.
