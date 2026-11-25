param([string]$Name = "scan")
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\admin-session"
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
$env:BASE = "http://100.85.228.83:3100"
Start-Sleep 5
node "$d\session-scan.cjs" *> "$d\session-$Name.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\session-$Name.txt"
