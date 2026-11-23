# Read-only crawl of the OLD live site (https://mypos.co.th), to list its URLs for redirects.
$out = "d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\fix-round2\old-site.txt"
$base = "https://mypos.co.th"
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
$l = @()
foreach ($p in "/robots.txt", "/sitemap.xml", "/sitemap_index.xml") {
  try {
    $r = Invoke-WebRequest -Uri ($base + $p) -UserAgent $ua -SkipHttpErrorCheck -TimeoutSec 30 -MaximumRedirection 3
    $l += "$p status=$($r.StatusCode) type=$($r.Headers['Content-Type']) bytes=$($r.Content.Length)"
    if ($r.StatusCode -eq 200) { $l += ($r.Content.Substring(0, [Math]::Min(1500, $r.Content.Length))) }
  } catch { $l += "$p ERROR $($_.Exception.Message)" }
}
# BFS over same-host links, max 150 pages
$seen = @{}; $queue = [System.Collections.Generic.Queue[string]]::new(); $queue.Enqueue("/index.php")
$pages = @()
while ($queue.Count -gt 0 -and $pages.Count -lt 150) {
  $path = $queue.Dequeue()
  if ($seen.ContainsKey($path)) { continue }
  $seen[$path] = $true
  try {
    $r = Invoke-WebRequest -Uri ($base + $path) -UserAgent $ua -SkipHttpErrorCheck -TimeoutSec 30 -MaximumRedirection 0 -ErrorAction Stop
    $status = [int]$r.StatusCode
    $loc = $r.Headers["Location"]
    $title = ([regex]::Match([string]$r.Content, "<title>(.*?)</title>", "Singleline")).Groups[1].Value.Trim() -replace "\s+", " "
    $pages += "$status`t$path`t$loc`t$title"
    if ($status -eq 200 -and ([string]$r.Headers["Content-Type"]) -match "html") {
      foreach ($m in [regex]::Matches([string]$r.Content, 'href\s*=\s*["'']([^"''#]+)["'']')) {
        $h = $m.Groups[1].Value.Trim()
        if ($h -match '^https?://(www\.)?mypos\.co\.th(/.*)?$') { $h = $Matches[2]; if (-not $h) { $h = "/" } }
        elseif ($h -match '^(https?:|mailto:|tel:|javascript:|//)') { continue }
        elseif (-not $h.StartsWith("/")) { $h = "/" + ($h -replace '^\./', '') }
        $h = $h -replace '&amp;', '&'
        if ($h -match '\.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|pdf|mp4|zip)(\?|$)') { continue }
        if (-not $seen.ContainsKey($h)) { $queue.Enqueue($h) }
      }
    }
  } catch { $pages += "ERR`t$path`t`t$($_.Exception.Message)" }
}
$l += "== pages ($($pages.Count)) status / path / redirect / title =="
$l += $pages
$l | Set-Content -Encoding utf8 $out
