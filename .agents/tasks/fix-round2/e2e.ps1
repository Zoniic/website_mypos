# Round-2 page checks against a running server on :3000 (read-only GET requests).
Add-Type -AssemblyName System.Net.Http
$handler = [System.Net.Http.HttpClientHandler]::new(); $handler.AllowAutoRedirect = $false
$c = [System.Net.Http.HttpClient]::new($handler); $c.Timeout = [TimeSpan]::FromSeconds(120)
$base = "http://localhost:3000"
$out = [System.Collections.Generic.List[string]]::new(); $script:fail = 0
function Get-Page([string]$path) {
  $r = $c.GetAsync("$base$path").Result
  $status = [int]$r.StatusCode
  $body = $r.Content.ReadAsStringAsync().Result
  $loc = if ($r.Headers.Location) { $r.Headers.Location.ToString() } else { "" }
  $r.Dispose()
  [pscustomobject]@{ Status = $status; Body = $body; Location = $loc }
}
function Check([string]$name, [bool]$ok, [string]$detail) {
  if (-not $ok) { $script:fail++ }
  $out.Add("$(if ($ok) { 'PASS' } else { 'FAIL' }) | $name | $detail")
}

# A2: old .php URLs redirect permanently to the right new page
$cases = @{
  "/index.php" = "/"; "/Contact-MYPOS.php" = "/contact"; "/products/F58.php" = "/products/mypos-f58";
  "/products/K156W.php" = "/products/mypos-k156"; "/products/F82.php" = "/solutions/pos";
  "/products/K215A.php" = "/solutions/self-order"; "/products/FM2200.php" = "/accessories";
  "/Dreamworld-Project.php" = "/references/dreamworld"; "/Mypos-Application.php" = "/software"
}
foreach ($src in $cases.Keys) {
  $p = Get-Page $src
  $want = $cases[$src]
  Check "A2 redirect $src" (($p.Status -eq 308 -or $p.Status -eq 301) -and $p.Location -eq $want) "status=$($p.Status) location=$($p.Location) want=$want"
}
# follow one redirect all the way to a 200 page
$p = Get-Page "/products/F58.php"; $hop = Get-Page $p.Location
$final = if ($hop.Status -in 307, 308) { (Get-Page $hop.Location).Status } else { $hop.Status }
Check "A2 /products/F58.php ends on a live page" ($final -eq 200) "hop1=$($p.Location) hop2=$($hop.Location) final=$final"
$p = Get-Page "/no-such-old-page.php"
Check "A2 unknown .php is not redirected" ($p.Status -eq 404) "status=$($p.Status)"

# B1: zh title of the K1 guide
$p = Get-Page "/zh/knowledge-base/article/change-paper-k1"
$h1 = ([regex]::Match($p.Body, '<h1[^>]*>(.*?)</h1>', 'Singleline')).Groups[1].Value -replace '<[^>]+>', ''
$want = [regex]::Unescape('K1 \u66f4\u6362\u6253\u5370\u7eb8')
Check "B1 zh KB title" ($p.Status -eq 200 -and $h1 -eq $want) "h1=[$h1]"
$wrong = [regex]::Unescape('\u4fee\u6539\u6587\u4ef6')
$p = Get-Page "/zh/knowledge-base/hardware"
Check "B1 zh KB section has no wrong wording" ($p.Status -eq 200 -and -not $p.Body.Contains($wrong)) "status=$($p.Status)"

# B2: admin login page is Thai
$p = Get-Page "/admin/login"
Check "B2 login page Thai" ($p.Status -eq 200 -and $p.Body.Contains([regex]::Unescape('\u0e40\u0e02\u0e49\u0e32\u0e2a\u0e39\u0e48\u0e23\u0e30\u0e1a\u0e1a')) -and -not $p.Body.Contains("Sign In")) "status=$($p.Status)"

# C4: honeypot field rendered in the public forms
foreach ($path in "/th/contact", "/th/service", "/th/compare", "/th") {
  $p = Get-Page $path
  $has = [bool]($p.Body -match '<input[^>]*name="website"')
  Check "C4 honeypot on $path" ($p.Status -eq 200 -and $has) "status=$($p.Status) field=$has"
}

$out.Add("failures=$script:fail")
$out | Set-Content -Encoding utf8 "d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\fix-round2\e2e.txt"
