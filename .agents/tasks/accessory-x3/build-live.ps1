# Rebuilds against the REAL database from .env (the previous build used the scratch DB).
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\accessory-x3"
foreach ($l in Get-Content ".env") { if ($l -match '^DATABASE_URL=(.*)$') { $env:DATABASE_URL = $Matches[1].Trim('"') } }
if ($env:DATABASE_URL -match 'localhost') { "STOP" | Set-Content "$d\build-live.txt"; exit 1 }
node -e "require('fs').rmSync('.next/dev/types',{recursive:true,force:true})"
node node_modules\next\dist\bin\next build *> "$d\build-live.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\build-live.txt"
