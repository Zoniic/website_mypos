param([string]$Phases = "PLBFMA")
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\bug-scan"
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
$env:OUT = $d
$env:PHASES = $Phases
$env:SCAN_EMAIL = "owner@scratch.test"
$env:SCAN_PASSWORD = "scratch-only-Passw0rd"
$env:ADMIN_PAGES = '["/admin","/admin/launch","/admin/playbook","/admin/orders","/admin/quote-requests","/admin/contact-messages","/admin/warranty-claims","/admin/newsletter","/admin/products","/admin/accessories","/admin/catalog","/admin/content","/admin/photos","/admin/layout-editor","/admin/navigation","/admin/references","/admin/blog","/admin/kb-articles","/admin/kb-categories","/admin/trust-logos","/admin/official-partners","/admin/careers","/admin/settings","/admin/admin-users","/admin/history","/admin/account"]'
Start-Sleep 5
node "$d\scan.cjs" *> "$d\scan-log.txt"
"exit=$LASTEXITCODE" | Add-Content "$d\scan-log.txt"
