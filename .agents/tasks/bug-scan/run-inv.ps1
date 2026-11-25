Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$d = ".agents\tasks\bug-scan"
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
$env:OUT = $d
node "$d\investigate.cjs" *> "$d\inv-log.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\inv-log.txt"
