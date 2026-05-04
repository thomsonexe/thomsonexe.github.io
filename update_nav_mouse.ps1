$newSvg = @'
<svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="11" r="5.5" fill="#b8ccd8"/>
                    <circle cx="6" cy="11.5" r="3" fill="#f09aaa" opacity="0.8"/>
                    <circle cx="20" cy="11" r="5.5" fill="#b8ccd8"/>
                    <circle cx="20" cy="11.5" r="3" fill="#f09aaa" opacity="0.8"/>
                    <circle cx="13" cy="22" r="9.5" fill="#b8ccd8"/>
                    <rect x="9.5" y="2" width="7" height="10" rx="3" fill="#1a1d32"/>
                    <rect x="9.5" y="9.5" width="7" height="2.5" fill="#00cc66"/>
                    <ellipse cx="13" cy="12.5" rx="10" ry="2" fill="#111320"/>
                    <circle cx="10" cy="21" r="2.5" fill="white" opacity="0.9"/>
                    <circle cx="16" cy="21" r="2.5" fill="white" opacity="0.9"/>
                    <circle cx="10" cy="21" r="1.7" fill="#00ff88"/>
                    <circle cx="16" cy="21" r="1.7" fill="#00ff88"/>
                    <circle cx="10" cy="21" r="0.8" fill="#001a0a"/>
                    <circle cx="16" cy="21" r="0.8" fill="#001a0a"/>
                    <ellipse cx="13" cy="24" rx="1.3" ry="1.1" fill="#f09aaa"/>
                    <line x1="11.5" y1="23.5" x2="4" y2="22" stroke="#8aabb8" stroke-width="0.7" stroke-linecap="round" opacity="0.55"/>
                    <line x1="11.5" y1="24.5" x2="4" y2="25.5" stroke="#8aabb8" stroke-width="0.7" stroke-linecap="round" opacity="0.55"/>
                    <line x1="14.5" y1="23.5" x2="22" y2="22" stroke="#8aabb8" stroke-width="0.7" stroke-linecap="round" opacity="0.55"/>
                    <line x1="14.5" y1="24.5" x2="22" y2="25.5" stroke="#8aabb8" stroke-width="0.7" stroke-linecap="round" opacity="0.55"/>
                </svg>
'@

$oldPattern = '(?s)<svg width="26" height="30".*?</svg>'

$files = Get-ChildItem -Path "C:\Users\foxes\portfolio" -Filter "*.html"
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match $oldPattern) {
        $newContent = [regex]::Replace($content, $oldPattern, $newSvg)
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.Name)"
        $count++
    }
}

Write-Host "Done - $count files updated"
