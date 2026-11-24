Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$l = @()
git add -- .agents/tasks/fix-round2/quote-commit.ps1 .agents/tasks/fix-round2/quote-commit.txt .agents/tasks/fix-round2/quote-push.ps1 2>&1 | Out-Null
$l += @(git commit -m "chore: log header button commit scripts" 2>&1 | Select-Object -First 1)
$l += "tracked env: " + ((git ls-files -- ".env" ".env.local") -join ",")
$l += @(git push origin main 2>&1)
$l += "push exit=$LASTEXITCODE"
Start-Sleep 20
for ($i = 0; $i -lt 30; $i++) {
  $run = gh run list --limit 1 --json status,conclusion,headSha 2>&1 | Out-String
  if ($run -match '"status":"completed"') { break }
  Start-Sleep 20
}
$l += $run
$l += "HEAD=$(git rev-parse --short HEAD) origin/main=$(git rev-parse --short origin/main)"
$l | Set-Content -Encoding utf8 ".agents\tasks\fix-round2\quote-push.txt"
