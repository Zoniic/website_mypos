Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$l = @()
foreach ($f in "src/components/products/CompareCartLink.tsx", "src/components/layout/Header.tsx", "prisma/add-nav-compare-short.ts",
  "messages/th.json", "messages/en.json", "messages/zh.json",
  ".agents/tasks/fix-round2/quote-btn.ps1", ".agents/tasks/fix-round2/quote-btn.txt", ".agents/tasks/fix-round2/quote-btn.cjs",
  ".agents/tasks/fix-round2/quote-btn-render.txt", ".agents/tasks/fix-round2/quote-btn-1440.png", ".agents/tasks/fix-round2/quote-btn-1100.png",
  ".agents/tasks/fix-round2/quote-btn-390.png", ".agents/tasks/admin-v2/header-quote-mockup.png") { git add -- $f 2>&1 | Out-Null }
$l += @(git commit -m "feat(header): quote-list button uses a list icon with a visible 'ใบเสนอราคา' label (xl+), icon and count below xl, and appears in the mobile bar when the list has items" 2>&1 | Select-Object -First 2)
$l += "HEAD=$(git rev-parse --short HEAD) ahead=$(git rev-list --count origin/main..HEAD)"
$l += "uncommitted outside .agents:"; $l += @(git status --short -- . ":(exclude).agents" 2>&1)
$l | Set-Content -Encoding utf8 ".agents\tasks\fix-round2\quote-commit.txt"
