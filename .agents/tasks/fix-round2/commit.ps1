Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$l = @()
function C([string]$msg, [string[]]$files) {
  foreach ($f in $files) { git add -- $f 2>&1 | Out-Null }
  $script:l += @(git commit -m $msg 2>&1 | Select-Object -First 2)
}
C "fix(admin): Thai text on the login page, login errors and admin-users pages" @(
  "src/app/admin/login/page.tsx", "src/app/admin/(dashboard)/admin-users/page.tsx",
  "src/app/admin/(dashboard)/admin-users/UserForm.tsx", "src/app/admin/(dashboard)/admin-users/[id]/edit/page.tsx")
C "feat(admin): a changed password ends every other session (password fingerprint in the session token)" @(
  "src/lib/adminAuth.ts", "src/app/admin/login/actions.ts", "src/app/admin/(dashboard)/admin-users/actions.ts")
C "feat(forms): honeypot field on contact, quote, warranty and newsletter forms" @(
  "src/components/ui/HoneypotField.tsx", "src/lib/formInput.ts", "src/components/contact/ContactForm.tsx",
  "src/components/products/CompareClient.tsx", "src/components/service/WarrantyClaimForm.tsx",
  "src/components/layout/NewsletterForm.tsx", "src/components/layout/newsletterActions.ts",
  "src/app/[locale]/contact/actions.ts", "src/app/[locale]/compare/actions.ts", "src/app/[locale]/service/warrantyActions.ts")
C "feat(seo): redirect the 90 old .php pages to their new pages" @(
  "src/data/legacyRedirects.ts", ".agents/tasks/fix-round2/old-site.ps1", ".agents/tasks/fix-round2/old-site.txt",
  ".agents/tasks/fix-round2/new-slugs.ts", ".agents/tasks/fix-round2/new-slugs.txt")
C "chore(data): fix the Chinese title of the K1 paper guide (backed-up script)" @(
  "prisma/fix-zh-k1-title.ts", ".agents/tasks/fix-round2/b1-dry.txt", ".agents/tasks/fix-round2/b1-write.txt", ".agents/tasks/fix-round2/run.ps1")
C "test: unit tests (node:test via tsx) and GitHub Actions CI for tsc, lint and tests" @(
  "tests/unit", ".github/workflows/ci.yml", "package.json")
C "docs: rewrite README, remove emoji from PHOTO-CHECKLIST, update HANDOFF; round-2 check scripts and results" @(
  "README.md", "PHOTO-CHECKLIST.md", "HANDOFF.md", ".agents/tasks/fix-round2/checks.ps1", ".agents/tasks/fix-round2/checks.txt",
  ".agents/tasks/fix-round2/e2e.ps1", ".agents/tasks/fix-round2/e2e.txt", ".agents/tasks/bug-fix/recheck.ps1", ".agents/tasks/bug-fix/recheck.txt",
  ".agents/tasks/fix-round2/commit.ps1")
$l += "log:"; $l += @(git log --oneline -9 2>&1)
$l += "ahead=$(git rev-list --count origin/main..HEAD)"
$l += "uncommitted outside .agents:"; $l += @(git status --short -- . ":(exclude).agents" 2>&1)
$l | Set-Content -Encoding utf8 ".agents\tasks\fix-round2\commit-log.txt"
