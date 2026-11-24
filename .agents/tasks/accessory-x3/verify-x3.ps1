Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$d = ".agents\tasks\accessory-x3"
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
$env:OUT = "$d\shots"
node "$d\verify-x3.cjs" *> "$d\verify-log.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\verify-log.txt"
