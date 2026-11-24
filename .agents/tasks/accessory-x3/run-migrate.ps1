# Applies the X3 schema to the SHARED database (owner approved M-a on 2026-11-24).
# Order: check, backup accessories, apply, check, copy keys, full logical backup. Stops on the first failure.
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\accessory-x3"
$out = "$d\migrate-log.txt"
"migrate started $(Get-Date -Format s)" | Set-Content -Encoding utf8 $out
function Run([string]$label, [string[]]$a) {
  "== $label" | Add-Content $out
  & node node_modules\tsx\dist\cli.mjs @a *>> $out
  $code = $LASTEXITCODE
  "== $label exit=$code" | Add-Content $out
  return $code
}
$shared = $null
foreach ($l in Get-Content ".env") { if ($l -match '^DATABASE_URL=(.*)$') { $shared = $Matches[1].Trim('"') } }
if (-not $shared -or $shared -match 'localhost') { "STOP: no shared DATABASE_URL in .env" | Add-Content $out; exit 1 }
# A scratch URL left in the shell environment would otherwise win over .env.
$env:DATABASE_URL = $shared
"target host: $(([uri]($shared -replace '^postgres(ql)?://', 'http://')).Host)" | Add-Content $out
$s = "$d\apply-schema.ts"
if ((Run "check before" @($s, "--check")) -ne 0) { exit 1 }
if ((Run "backup accessories" @($s, "--backup")) -ne 0) { "STOP: backup failed" | Add-Content $out; exit 1 }
if ((Run "apply" @($s, "--apply")) -ne 0) { "STOP: apply failed" | Add-Content $out; exit 1 }
Run "check after" @($s, "--check") | Out-Null
Run "copy keys dry run" @("prisma\add-accessory-detail-keys.ts") | Out-Null
if ((Run "copy keys write" @("prisma\add-accessory-detail-keys.ts", "--write")) -ne 0) { exit 1 }
Run "full backup with new schema" @("prisma\backup-db.ts", "--write") | Out-Null
"migrate finished $(Get-Date -Format s)" | Add-Content $out
