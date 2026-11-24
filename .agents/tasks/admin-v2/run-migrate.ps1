Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$out = ".agents\tasks\admin-v2\migrate-log.txt"
$l = @("migrate started $(Get-Date -Format s)")
function Save { $script:l | Set-Content -Encoding utf8 $out }
function Run([string]$label, [string[]]$a, [int]$sec) {
  $so = ".agents\tasks\admin-v2\_so.txt"; $se = ".agents\tasks\admin-v2\_se.txt"
  $p = Start-Process -FilePath "node" -ArgumentList $a -NoNewWindow -PassThru -RedirectStandardOutput $so -RedirectStandardError $se
  if (-not $p.WaitForExit($sec * 1000)) { $p.Kill($true); $script:l += "$label TIMEOUT (killed)" }
  $script:l += "== $label exit=$($p.ExitCode) =="
  $script:l += @(Get-Content $so | Select-Object -Last 40)
  $script:l += @(Get-Content $se | Select-Object -Last 10)
  Save
  return $p.ExitCode
}
$s = ".agents\tasks\admin-v2\apply-schema.ts"
if ((Run "check before" @("node_modules\tsx\dist\cli.mjs", $s, "--check") 120) -ne 0) { exit 1 }
if ((Run "backup AdminUser" @("node_modules\tsx\dist\cli.mjs", $s, "--backup") 120) -ne 0) { $l += "STOP: backup failed"; Save; exit 1 }
if ((Run "apply" @("node_modules\tsx\dist\cli.mjs", $s, "--apply") 180) -ne 0) { $l += "STOP: apply failed"; Save; exit 1 }
Run "check after" @("node_modules\tsx\dist\cli.mjs", $s, "--check") 120 | Out-Null
Run "full backup with new schema" @("node_modules\tsx\dist\cli.mjs", "prisma\backup-db.ts", "--write") 300 | Out-Null
$f = Get-ChildItem prisma\backups -Filter "full-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$l += "full backup file: $($f.Name)"
$r = & node node_modules\tsx\dist\cli.mjs prisma\backup-db.ts --verify "$($f.FullName)" 2>&1
$l += "== verify exit=$LASTEXITCODE =="; $l += @($r | Select-Object -Last 4)
Run "lead queries on real data" @("node_modules\tsx\dist\cli.mjs", ".agents\tasks\admin-improve\check-lead-queries.ts") 120 | Out-Null
$l += "migrate finished $(Get-Date -Format s)"
Save
