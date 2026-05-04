$newImg = '<img src="mouse_t.png" class="nav-mouse" alt="">'

$oldPattern = '(?s)<svg width="26" height="30".*?</svg>'

$files = Get-ChildItem -Path "C:\Users\foxes\portfolio" -Filter "*.html"
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match $oldPattern) {
        $newContent = [regex]::Replace($content, $oldPattern, $newImg)
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.Name)"
        $count++
    }
}

Write-Host "Done - $count files updated"
