param([string]$Script, [string]$Out, [string]$ArgLine = "")
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$nodeArgs = @("node_modules\tsx\dist\cli.mjs", $Script)
if ($ArgLine) { $nodeArgs += $ArgLine.Split(" ") }
$res = & node @nodeArgs 2>&1
$code = $LASTEXITCODE
@($res) + "exit=$code" | Set-Content -Encoding utf8 $Out
