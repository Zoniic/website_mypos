# Downloads Figma frame screenshots and lays them out as a labelled contact sheet.
param(
  [string]$Out,
  [string]$UrlList,
  [string]$LabelList,
  [int]$Columns = 5,
  [int]$ImageHeight = 1000
)
# pwsh -File passes each argument as one string, so lists are comma-separated.
$Urls = $UrlList -split ','
$Labels = $LabelList -split ','
if ($Urls.Count -ne $Labels.Count) { throw 'UrlList and LabelList must contain the same number of entries.' }
Add-Type -AssemblyName System.Drawing
$tmp = Join-Path $PSScriptRoot '_sheet-v3'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$imgs = @()
for ($i = 0; $i -lt $Urls.Count; $i++) {
  $f = Join-Path $tmp "s$i.png"
  Invoke-WebRequest -Uri $Urls[$i] -OutFile $f -UseBasicParsing
  $imgs += [System.Drawing.Image]::FromFile($f)
}
$gap = 24; $top = 50
$scaledWidths = @($imgs | ForEach-Object { [int][Math]::Round($_.Width * $ImageHeight / $_.Height) })
$cellWidth = ($scaledWidths | Measure-Object -Maximum).Maximum
$rows = [int][Math]::Ceiling($imgs.Count / $Columns)
$w = $Columns * $cellWidth + ($Columns - 1) * $gap
$h = $rows * ($ImageHeight + $top) + ($rows - 1) * $gap
$sheet = [System.Drawing.Bitmap]::new([int]$w, [int]$h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(226, 228, 232))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$font = New-Object System.Drawing.Font 'Tahoma', 18, ([System.Drawing.FontStyle]::Bold)
for ($i = 0; $i -lt $imgs.Count; $i++) {
  $row = [Math]::Floor($i / $Columns)
  $column = $i % $Columns
  $cellX = $column * ($cellWidth + $gap)
  $cellY = $row * ($ImageHeight + $top + $gap)
  $imageX = $cellX + [int][Math]::Floor(($cellWidth - $scaledWidths[$i]) / 2)
  $g.DrawString($Labels[$i], $font, [System.Drawing.Brushes]::Black, $cellX + 4, $cellY + 10)
  $g.DrawImage($imgs[$i], $imageX, $cellY + $top, $scaledWidths[$i], $ImageHeight)
  $imgs[$i].Dispose()
}
$font.Dispose()
$g.Dispose()
$sheet.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()
