$files = Get-ChildItem -Path "C:\Users\foxes\portfolio" -Filter "*.html"
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Remove the nav thomsoN span
    $content = [regex]::Replace($content, '\s*<span class="glitch glitch-nav" data-text="thomsoN">thomsoN</span>', '')

    # Update page titles from thomsoN to thomson.cx
    $content = $content -replace '<title>thomsoN</title>', '<title>thomson.cx</title>'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.Name)"
        $count++
    }
}

Write-Host "Done - $count files updated"
