Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Ayush\.gemini\antigravity\brain\c69caf70-c01e-497a-a727-89e524f71e6f\.user_uploaded\media_1793742804496_ef4dab46.png"
$destPath = "D:\ANtigravity\Resume website\public\brand\signature-transparent.png"
$destPathSilver = "D:\ANtigravity\Resume website\public\brand\signature-silver.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

Write-Host "Source image dimensions: $width x $height"

$outBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$outBmpSilver = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for high-speed processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstSilverData = $outBmpSilver.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$byteCount = [Math]::Abs($srcData.Stride) * $height
$pixels = New-Object byte[] $byteCount
$outPixels = New-Object byte[] $byteCount
$outSilverPixels = New-Object byte[] $byteCount

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $pixels, 0, $byteCount)

for ($i = 0; $i -lt $byteCount; $i += 4) {
    $b = $pixels[$i]
    $g = $pixels[$i + 1]
    $r = $pixels[$i + 2]
    
    # Calculate luminosity
    $lum = [Math]::Max($r, [Math]::Max($g, $b))
    
    if ($lum -le 8) {
        $alpha = 0
    } else {
        # Soft curve to preserve fine antialiased strokes
        $norm = ($lum - 8) / 247.0
        $alpha = [int][Math]::Min(255, [Math]::Max(0, [Math]::Round($norm * 255)))
    }
    
    # Output 1: Pure white preserved with alpha
    $outPixels[$i] = 255     # B
    $outPixels[$i + 1] = 255 # G
    $outPixels[$i + 2] = 255 # R
    $outPixels[$i + 3] = $alpha
    
    # Output 2: Elegant metallic silver (#F5F6F8 / #E2E6EC)
    $outSilverPixels[$i] = 248     # B
    $outSilverPixels[$i + 1] = 246 # G
    $outSilverPixels[$i + 2] = 245 # R
    $outSilverPixels[$i + 3] = $alpha
}

[System.Runtime.InteropServices.Marshal]::Copy($outPixels, 0, $dstData.Scan0, $byteCount)
[System.Runtime.InteropServices.Marshal]::Copy($outSilverPixels, 0, $dstSilverData.Scan0, $byteCount)

$bmp.UnlockBits($srcData)
$outBmp.UnlockBits($dstData)
$outBmpSilver.UnlockBits($dstSilverData)

$outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmpSilver.Save($destPathSilver, [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$outBmp.Dispose()
$outBmpSilver.Dispose()

Write-Host "Transparent signature saved to: $destPath"
Write-Host "Silver signature saved to: $destPathSilver"
