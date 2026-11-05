# Shrink photos on Windows: long side <= MaxSide px, JPEG quality 80, same file names, EXIF rotation applied.
# ASCII only on purpose: Windows PowerShell 5.1 misreads UTF-8 files without a BOM.
# Usage:
#   powershell -ExecutionPolicy Bypass -File ResizePhotos.ps1 -Src "C:\path\originals" -Dst "C:\path\PhotoSmall"
# Originals are never changed. Files other than jpg/jpeg/png (e.g. heic) are skipped.
param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Dst,
  [int]$MaxSide = 1600,
  [int]$Quality = 80
)
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $Dst | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

$files = Get-ChildItem -Path $Src -File -Recurse | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' }
$done = 0; $skipped = 0; $before = 0L; $after = 0L
foreach ($f in $files) {
  $out = Join-Path $Dst $f.Name
  if (Test-Path $out) { $skipped++; continue }
  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    # Apply EXIF Orientation (0x0112): System.Drawing does not rotate by itself
    if ($img.PropertyIdList -contains 0x0112) {
      switch ([int]$img.GetPropertyItem(0x0112).Value[0]) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    }
    $scale = [Math]::Min(1.0, $MaxSide / [Math]::Max($img.Width, $img.Height))
    $w = [int][Math]::Round($img.Width * $scale); $h = [int][Math]::Round($img.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $w, $h)
    $bmp.Save($out, $codec, $params)
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    $before += $f.Length; $after += (Get-Item $out).Length; $done++
  }
  catch {
    Write-Warning "Skipped $($f.Name): $_"
    $skipped++
  }
}
"Resized {0}, skipped {1}, total {2:N0} MB -> {3:N0} MB" -f $done, $skipped, ($before / 1MB), ($after / 1MB)

# Memento's file() only sees files directly in its default folder (/Workload), not subfolders,
# so PhotoSwap.js reads this list (copy it to the phone's Workload) to know which small photos exist.
$list = Join-Path (Split-Path -Parent (Resolve-Path $Dst)) "photosmall_list.txt"
[System.IO.File]::WriteAllLines($list, [string[]](Get-ChildItem -Path $Dst -File | ForEach-Object { $_.Name }))
"List of {0} files written to {1}" -f (Get-ChildItem -Path $Dst -File).Count, $list
