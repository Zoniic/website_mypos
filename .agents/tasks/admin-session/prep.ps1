# Starts the scratch Postgres (kept from the X3 run) and rebuilds the app. Log: prep-log.txt
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\admin-session"
$log = "$d\prep-log.txt"
docker start mypos-scratch-pg *> $log
for ($i = 0; $i -lt 30; $i++) { docker exec mypos-scratch-pg pg_isready -U scratch *> $null; if ($LASTEXITCODE -eq 0) { "pg ready" | Add-Content $log; break }; Start-Sleep 2 }
foreach ($l in Get-Content ".env") { if ($l -match '^DATABASE_URL=(.*)$') { $env:DATABASE_URL = $Matches[1].Trim('"') } }
node -e "require('fs').rmSync('.next/dev/types',{recursive:true,force:true})"
node node_modules\next\dist\bin\next build *> "$d\build.txt"
"build exit=$LASTEXITCODE" | Add-Content $log
