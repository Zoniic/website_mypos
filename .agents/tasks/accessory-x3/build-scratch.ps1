# Seeds a scratch admin + the new copy keys on the SCRATCH DB, then builds the app against it.
# Log: .agents\tasks\accessory-x3\build-scratch-log.txt
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\accessory-x3"
$log = "$d\build-scratch-log.txt"
"started $(Get-Date -Format s)" | Set-Content $log
$env:DATABASE_URL = "postgresql://scratch:scratch@localhost:5433/mypos_scratch"
$env:SCRATCH_ADMIN_EMAIL = "owner@scratch.test"
$env:SCRATCH_ADMIN_PASSWORD = "scratch-only-Passw0rd"
node node_modules\tsx\dist\cli.mjs "$d\seed-scratch-admin.ts" *>> $log
"== seed exit=$LASTEXITCODE" | Add-Content $log
node node_modules\tsx\dist\cli.mjs prisma\add-accessory-detail-keys.ts *>> $log
node node_modules\tsx\dist\cli.mjs prisma\add-accessory-detail-keys.ts --write *>> $log
"== copy keys exit=$LASTEXITCODE" | Add-Content $log
node node_modules\tsx\dist\cli.mjs "$d\apply-schema.ts" --backup *>> $log
"== backup (scratch) exit=$LASTEXITCODE" | Add-Content $log
node -e "require('fs').rmSync('.next/dev/types',{recursive:true,force:true})"
node node_modules\next\dist\bin\next build *> "$d\build-out.txt"
"== build exit=$LASTEXITCODE" | Add-Content $log
Get-Content "$d\build-out.txt" -Tail 15 | Add-Content $log
"finished $(Get-Date -Format s)" | Add-Content $log
