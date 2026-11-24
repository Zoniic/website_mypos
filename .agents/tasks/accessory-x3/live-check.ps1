Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\accessory-x3"
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
$env:OUT = "$d\shots"
Start-Sleep 4
node "$d\live-check.cjs" *> "$d\live-check.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\live-check.txt"
