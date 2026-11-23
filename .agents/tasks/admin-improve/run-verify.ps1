param([string]$Mode = "", [string]$Out = "")
# Loads the SCRATCH admin credentials from .env without printing them, then runs verify-leads.cjs.
$root = "d:/Folk/Own_Dir/FMT/DEV/mypos-website-wt/integ"
foreach ($l in Get-Content "$root/.env") {
  if ($l -match '^(ADMIN_EMAIL|ADMIN_PASSWORD)=(.*)$') { Set-Item -Path "env:$($Matches[1])" -Value $Matches[2].Trim('"') }
}
$env:PW_PATH = "C:\Users\P^chapol\AppData\Roaming\npm\node_modules\playwright"
if ($Out) { $env:OUT = $Out }
node "$root/.agents/tasks/admin-improve/verify-leads.cjs" $Mode
exit $LASTEXITCODE
