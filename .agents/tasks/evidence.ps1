# Prints the bug-fix evidence against a running server. Usage: pwsh -NoProfile -File .agents/tasks/evidence.ps1 [-Base http://localhost:3100]
param([string]$Base = 'http://localhost:3100')
function Get-Html($path) { (curl.exe -s --max-time 90 "$Base$path") -join "`n" }
function Get-Code($path) { curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" --max-time 90 "$Base$path" }
$paths = @(
  '/th/nope', '/en/products/zzz', '/zh/blog/zzz', '/th/references/zzz', '/th/careers/zzz', '/th/order/MP0-1?t=x',
  '/th/knowledge-base/article/zzz', '/th/knowledge-base/foo', '/th/solutions/zzz',
  '/th/products/TEST', '/th/products/test', '/th/products/mypos-K1', '/th/products/mypos-k1',
  '/th/knowledge-base/article/Change%20paper%20K1', '/th/knowledge-base/article/change-paper-k1', '/th', '/th/contact'
)
foreach ($p in $paths) { "{0} -> {1}" -f $p, (Get-Code $p) }
foreach ($l in 'th', 'en', 'zh') {
  $h = Get-Html "/$l/contact"
  "$l contact: iframe=$($h -match '<iframe') missingMessage=$($h -match 'contact\.mapOpen') mapsLink=" + [regex]::Match($h, 'href="(https://www\.google\.com/maps/[^"]+)"').Groups[1].Value
}
foreach ($p in '/th', '/en', '/zh', '/th/about') { "$p contains fm1896p: " + ((Get-Html $p) -match 'fm1896p') }
$k = Get-Html '/th/knowledge-base/article/change-paper-k1'
"kb article h1: " + [regex]::Match($k, '<h1[^>]*>(.*?)</h1>').Groups[1].Value + " | shows 404 text: " + ($k -match 'ไม่พบหน้าที่คุณค้นหา')
"sitemap lists /products/test: " + ((Get-Html '/sitemap.xml') -match '/products/test<')
"products list links /products/test: " + ((Get-Html '/th/products') -match '/products/test["\x27?#]')
