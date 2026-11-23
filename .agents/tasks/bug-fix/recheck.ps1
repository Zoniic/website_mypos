# Re-check of every bug-scan fix and the LINE fix on the current code.
# Needs the dev server on :3000. Usage: pwsh -NoProfile -File .agents/tasks/bug-fix/recheck.ps1
# Output: recheck.txt next to this script. Read-only: GET requests only.
Add-Type -AssemblyName System.Net.Http
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$c = [System.Net.Http.HttpClient]::new($handler)
$c.Timeout = [TimeSpan]::FromSeconds(180)
$base = 'http://localhost:3000'
$out = [System.Collections.Generic.List[string]]::new()
$script:fail = 0

function Get-Page([string]$path) {
  $r = $c.GetAsync("$base$path").Result
  $status = [int]$r.StatusCode
  $body = $r.Content.ReadAsStringAsync().Result
  $loc = if ($r.Headers.Location) { $r.Headers.Location.ToString() } else { '' }
  $r.Dispose()
  [pscustomobject]@{ Status = $status; Body = $body; Location = $loc }
}

function Get-H1([string]$body) {
  ([regex]::Match($body, '<h1[^>]*>(.*?)</h1>', 'Singleline')).Groups[1].Value -replace '<[^>]+>', ''
}

function Check([string]$name, [bool]$ok, [string]$detail) {
  if (-not $ok) { $script:fail++ }
  $mark = if ($ok) { 'PASS' } else { 'FAIL' }
  $out.Add("$mark | $name | $detail")
}

$out.Add("Recheck started $(Get-Date -Format s)")

# Bug 1: KB article with spaces in its slug showed 404
foreach ($l in 'th', 'en', 'zh') {
  $p = Get-Page "/$l/knowledge-base/article/change-paper-k1"
  $h1 = Get-H1 $p.Body
  Check "bug1 KB article $l" ($p.Status -eq 200 -and $h1 -and -not ($p.Body -match '>404</p>')) "status=$($p.Status) h1=[$h1]"
}
$p = Get-Page '/th/knowledge-base/article/Change%20paper%20K1'
Check 'bug1 old KB URL with spaces' ($p.Status -eq 308 -and $p.Location -match 'change-paper-k1$') "status=$($p.Status) location=$($p.Location)"

# Bug 2: slugs not URL-safe / case-sensitive
$p = Get-Page '/th/products/mypos-K1'
Check 'bug2 old mixed-case product URL' ($p.Status -eq 308 -and $p.Location -match '/th/products/mypos-k1$') "status=$($p.Status) location=$($p.Location)"
$p = Get-Page '/th/products/mypos-k1'
Check 'bug2 lowercase product URL' ($p.Status -eq 200) "status=$($p.Status)"

# Sitemap: every URL is URL-safe and returns 200 (also guards bug 4 against false 404s)
$sm = Get-Page '/sitemap.xml'
$paths = @([regex]::Matches($sm.Body, '<loc>\s*(.*?)\s*</loc>') |
  ForEach-Object { ([uri][System.Net.WebUtility]::HtmlDecode($_.Groups[1].Value)).PathAndQuery } |
  Select-Object -Unique)
Check 'sitemap readable' ($sm.Status -eq 200 -and $paths.Count -gt 0) "status=$($sm.Status) urls=$($paths.Count)"
$unsafe = @($paths | Where-Object { $_ -cmatch '[A-Z]' -or $_ -match '%20| ' })
Check 'bug2 sitemap URLs URL-safe' ($unsafe.Count -eq 0) "unsafe=$($unsafe.Count) $(($unsafe | Select-Object -First 5) -join ', ')"
$bad = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $paths.Count; $i += 6) {
  $end = [Math]::Min($i + 5, $paths.Count - 1)
  $batch = @($paths[$i..$end])
  $tasks = @($batch | ForEach-Object { $c.GetAsync("$base$_") })
  try { [System.Threading.Tasks.Task]::WaitAll([System.Threading.Tasks.Task[]]$tasks) } catch { }
  for ($j = 0; $j -lt $batch.Count; $j++) {
    $t = $tasks[$j]
    if ($t.IsFaulted -or $t.IsCanceled) { $bad.Add("$($batch[$j])=ERR"); continue }
    $st = [int]$t.Result.StatusCode
    $t.Result.Dispose()
    if ($st -ne 200) { $bad.Add("$($batch[$j])=$st") }
  }
}
Check 'bug4 every sitemap URL returns 200' ($bad.Count -eq 0) "checked=$($paths.Count) not200=$($bad.Count) $(($bad | Select-Object -First 10) -join ', ')"

# Bug 3: contact map blank (non-embed Google Maps URL in an iframe)
foreach ($l in 'th', 'en', 'zh') {
  $p = Get-Page "/$l/contact"
  $embed = [bool]($p.Body -match '<iframe[^>]+google\.com/maps/embed')
  $nonEmbed = [bool]($p.Body -match '<iframe[^>]+google\.com/maps(?!/embed)')
  $link = [bool]($p.Body -match 'href="https://www\.google\.com/maps')
  Check "bug3 contact map $l" ($p.Status -eq 200 -and -not $nonEmbed -and ($embed -or $link)) "status=$($p.Status) embedIframe=$embed openInMapsLink=$link nonEmbedIframe=$nonEmbed"
}

# Bug 4: unknown URLs answered 200 (soft 404)
$missing = '/th/this-page-does-not-exist', '/en/no-such-page', '/zh/no-such-page',
  '/th/products/no-such-product', '/th/blog/no-such-post', '/th/references/no-such-case',
  '/th/careers/no-such-job', '/th/order/no-such-order', '/th/knowledge-base/article/no-such-article',
  '/th/knowledge-base/no-such-section', '/th/solutions/no-such-solution', '/th/industries/no-such-industry'
foreach ($m in $missing) {
  $p = Get-Page $m
  Check "bug4 missing page $m" ($p.Status -eq 404) "status=$($p.Status) shows404Page=$([bool]($p.Body -match '>404</p>'))"
}

# Bug 5: stats band showed a URL; TEST product was live
foreach ($path in '/th', '/en', '/zh', '/th/about') {
  $p = Get-Page $path
  Check "bug5 no URL in stats $path" ($p.Status -eq 200 -and -not ($p.Body -match 'fm1896p')) "status=$($p.Status)"
}
$p = Get-Page '/th/products/test'
Check 'bug5 /products/test hidden' ($p.Status -eq 404) "status=$($p.Status)"
$p = Get-Page '/th/products/TEST'
$final = $p.Status
if ($p.Status -eq 308) { $final = (Get-Page ([uri]::new([uri]$base, $p.Location)).PathAndQuery).Status }
Check 'bug5 /products/TEST hidden' ($final -eq 404) "status=$($p.Status) final=$final"
$p = Get-Page '/th/products'
Check 'bug5 TEST not in product list' ($p.Status -eq 200 -and -not ($p.Body -match 'href="/th/products/test"')) "status=$($p.Status)"
Check 'bug5 TEST not in sitemap' (-not ($paths -match '/products/test$')) ''
foreach ($s in 'self-order', 'pos', 'kds') {
  $p = Get-Page "/th/solutions/$s"
  $txt = ($p.Body -replace '(?s)<script.*?</script>', '') -replace '<[^>]+>', '|'
  Check "bug5 TEST not in solutions/$s" ($p.Status -eq 200 -and -not ($txt -match '\|\s*TEST\s*\|') -and -not ($p.Body -match 'href="/th/products/test"')) "status=$($p.Status)"
}
$p = Get-Page '/th/contact?product=test'
$txt = ($p.Body -replace '(?s)<script.*?</script>', '') -replace '<[^>]+>', '|'
Check 'bug5 TEST not offered on contact?product=test' ($p.Status -eq 200 -and -not ($txt -match '\|\s*TEST\s*\|')) "status=$($p.Status)"

# LINE button (feature audit 2.3 item 1): empty href while the lineUrl setting is empty
foreach ($path in '/th', '/en/products', '/zh/contact') {
  $p = Get-Page $path
  $line = @([regex]::Matches($p.Body, 'href="(https://(?:line\.me|lin\.ee)/[^"]*)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
  $empty = ([regex]::Matches($p.Body, 'href=""')).Count
  Check "LINE link $path" ($p.Status -eq 200 -and $line.Count -gt 0 -and $empty -eq 0) "lineHrefs=$($line -join ',') emptyHref=$empty"
}

# Content: zh title of the K1 paper article (stored translation reads "modify file K1")
$wrong = [regex]::Unescape('\u4fee\u6539\u6587\u4ef6')
$p = Get-Page '/zh/knowledge-base/article/change-paper-k1'
$h1 = Get-H1 $p.Body
Check 'content zh KB article title' (-not ($h1 -match $wrong)) "h1=[$h1]"

$out.Add("Recheck finished $(Get-Date -Format s), failures=$script:fail")
$out | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'recheck.txt')
