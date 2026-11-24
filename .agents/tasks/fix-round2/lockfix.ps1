Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$l = @()
$l += "== npm install --package-lock-only =="
$l += @(npm install --package-lock-only --no-audit --no-fund 2>&1 | Select-Object -Last 10)
$l += "exit=$LASTEXITCODE"
$l += "== npm ci --dry-run (must succeed) =="
$l += @(npm ci --dry-run --no-audit --no-fund 2>&1 | Select-Object -Last 5)
$l += "ci-dry exit=$LASTEXITCODE"
$l += "== lock diff summary =="
$l += @(git diff --stat -- package-lock.json 2>&1)
$l += "top-level versions changed:"
$l += @(git diff -U0 -- package-lock.json 2>&1 | Select-String '^[+-]\s+"node_modules/[^/"]+":' | ForEach-Object { $_.Line } | Select-Object -First 30)
$l += "package.json changed: " + ((git diff --name-only -- package.json) -join ",")
$l | Set-Content -Encoding utf8 ".agents\tasks\fix-round2\lockfix.txt"
