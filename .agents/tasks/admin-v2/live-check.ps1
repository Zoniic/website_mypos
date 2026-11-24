# Read-only page checks against the production build on :3000 using the real (migrated) database.
Add-Type -AssemblyName System.Net.Http
$h = [System.Net.Http.HttpClientHandler]::new(); $h.AllowAutoRedirect = $false
$c = [System.Net.Http.HttpClient]::new($h); $c.Timeout = [TimeSpan]::FromSeconds(120)
$l = @(); $fail = 0
foreach ($p in "/api/health", "/th", "/en", "/zh", "/th/products", "/th/contact", "/admin/login", "/admin", "/admin/history", "/admin/account") {
  $r = $c.GetAsync("http://localhost:3000$p").Result
  $st = [int]$r.StatusCode; $loc = if ($r.Headers.Location) { $r.Headers.Location.ToString() } else { "" }
  $want = if ($p -like "/admin*" -and $p -ne "/admin/login") { "307|308" } else { "200" }
  $ok = "$st" -match "^($want)$"
  if ($p -like "/admin*" -and $p -ne "/admin/login") { $ok = $ok -and $loc -match "/admin/login" }
  if (-not $ok) { $fail++ }
  $l += "$(if ($ok) {'PASS'} else {'FAIL'}) | $p | status=$st $loc"
  $r.Dispose()
}
$l += "failures=$fail"
$l | Set-Content -Encoding utf8 "d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\admin-v2\live-check.txt"
