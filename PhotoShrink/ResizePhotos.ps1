# ย่อรูปบนคอม Windows: ด้านยาวไม่เกิน 1600px, JPEG คุณภาพ 80, ชื่อไฟล์เดิม, หมุนตาม EXIF
# ใช้: คลิกขวา > Run with PowerShell หรือ
#   powershell -ExecutionPolicy Bypass -File ResizePhotos.ps1 -Src "C:\path\รูปต้นฉบับ" -Dst "C:\path\PhotoSmall"
# ไม่แก้ไฟล์ต้นฉบับ ไฟล์ที่ไม่ใช่ jpg/jpeg/png จะถูกข้าม (เช่น heic)
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
    # หมุนตาม EXIF Orientation (0x0112) เพราะ System.Drawing ไม่หมุนให้เอง
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
    Write-Warning "ข้าม $($f.Name): $_"
    $skipped++
  }
}
"{0} รูป ย่อแล้ว, ข้าม {1}, ขนาดรวม {2:N0} MB -> {3:N0} MB" -f $done, $skipped, ($before / 1MB), ($after / 1MB)
