Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$out = ".agents\tasks\fix-round2\checks.txt"
$l = @()
function Save { $script:l | Set-Content -Encoding utf8 $out }
$l += "== tsc =="
$l += @(node node_modules\typescript\bin\tsc --noEmit 2>&1 | Select-Object -First 30)
$l += "tsc exit=$LASTEXITCODE"; Save
$l += "== lint =="
$l += @(node node_modules\eslint\bin\eslint.js 2>&1 | Select-Object -First 30)
$l += "lint exit=$LASTEXITCODE"; Save
$l += "== unit tests =="
$t = @(node --import tsx --test "tests/unit/**/*.test.ts" "tests/unit/**/*.test.tsx" 2>&1)
$l += @($t | Where-Object { $_ -match "^\S*\s*(not ok|# |ℹ|✖)" -or $_ -match "fail|pass|tests " } | Select-Object -Last 15)
$l += "test exit=$LASTEXITCODE"; Save
$l += "== build =="
$b = @(node node_modules\next\dist\bin\next build 2>&1)
$l += @($b | Select-Object -Last 25)
$l += "build exit=$LASTEXITCODE"; Save
