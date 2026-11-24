param([string]$Name = "normal", [string]$ExpectLogout = "0")
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\admin-session"
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
$env:BASE = "http://100.85.228.83:3100"
$env:EXPECT_LOGOUT = $ExpectLogout
Start-Sleep 4
node "$d\verify-session.cjs" *> "$d\verify-$Name.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\verify-$Name.txt"
