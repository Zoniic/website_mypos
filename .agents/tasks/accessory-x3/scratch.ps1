# Scratch run of the X3 migration: fresh Postgres on 5433, OLD schema, copy of public content,
# apply-schema.ts --apply, then prove the DB matches prisma/schema.prisma. Never writes to the shared DB.
# Log: .agents\tasks\accessory-x3\scratch-log.txt (no secrets printed).
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\accessory-x3"
$log = "$d\scratch-log.txt"
"scratch started $(Get-Date -Format s)" | Set-Content $log
function Log($m) { $m | Add-Content $log }

$shared = $null
foreach ($l in Get-Content ".env") { if ($l -match '^DATABASE_URL=(.*)$') { $shared = $Matches[1].Trim('"') } }
if (-not $shared) { Log "STOP: no DATABASE_URL in .env"; exit 1 }
$scratch = "postgresql://scratch:scratch@localhost:5433/mypos_scratch?connection_limit=1"

$name = "mypos-scratch-pg"
docker rm -f $name *> $null
docker run -d --name $name -p 5433:5432 -e POSTGRES_USER=scratch -e POSTGRES_PASSWORD=scratch -e POSTGRES_DB=mypos_scratch postgres:16 *>> $log
$ready = $false
for ($i = 0; $i -lt 40; $i++) { docker exec $name pg_isready -U scratch *> $null; if ($LASTEXITCODE -eq 0) { $ready = $true; break }; Start-Sleep 2 }
Start-Sleep 3
Log "pg ready=$ready"
if (-not $ready) { exit 1 }

$p = "node_modules\prisma\build\index.js"
$env:DATABASE_URL = $scratch
node $p db push --schema "$d\old-schema.prisma" --skip-generate --accept-data-loss *>> $log
Log "== db push old schema exit=$LASTEXITCODE"

$env:SOURCE_URL = $shared
node node_modules\tsx\dist\cli.mjs "$d\copy-to-scratch.ts" *>> $log
Log "== copy exit=$LASTEXITCODE"
Remove-Item Env:\SOURCE_URL

node node_modules\tsx\dist\cli.mjs "$d\apply-schema.ts" --check *>> $log
node node_modules\tsx\dist\cli.mjs "$d\apply-schema.ts" --apply *>> $log
Log "== apply exit=$LASTEXITCODE"
node node_modules\tsx\dist\cli.mjs "$d\apply-schema.ts" --apply *>> $log
Log "== second apply (must refuse) exit=$LASTEXITCODE"

node $p migrate diff --from-url $scratch --to-schema-datamodel prisma/schema.prisma --exit-code *>> $log
Log "== migrate diff exit=$LASTEXITCODE (0 = scratch DB matches schema.prisma)"
"scratch finished $(Get-Date -Format s)" | Add-Content $log
