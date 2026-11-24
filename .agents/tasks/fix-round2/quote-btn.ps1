Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$l = @()
$l += "== dry run =="; $l += @(node node_modules\tsx\dist\cli.mjs prisma\add-nav-compare-short.ts 2>&1)
$l += "== write =="; $l += @(node node_modules\tsx\dist\cli.mjs prisma\add-nav-compare-short.ts --write 2>&1)
$l += "== tsc =="; $l += @(node node_modules\typescript\bin\tsc --noEmit 2>&1 | Select-Object -First 20); $l += "tsc exit=$LASTEXITCODE"
$l += "== lint =="; $l += @(node node_modules\eslint\bin\eslint.js src\components\products\CompareCartLink.tsx src\components\layout\Header.tsx prisma\add-nav-compare-short.ts 2>&1 | Select-Object -First 20); $l += "lint exit=$LASTEXITCODE"
$l += "== test =="; $l += @(node --import tsx --test "tests/unit/**/*.test.ts" "tests/unit/**/*.test.tsx" 2>&1 | Select-String "^. (tests|pass|fail)" | ForEach-Object { $_.Line }); $l += "test exit=$LASTEXITCODE"
$l += "== build =="; $l += @(node node_modules\next\dist\bin\next build 2>&1 | Select-Object -Last 3); $l += "build exit=$LASTEXITCODE"
$l | Set-Content -Encoding utf8 ".agents\tasks\fix-round2\quote-btn.txt"
