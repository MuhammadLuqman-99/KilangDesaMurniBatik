# Fix all import paths from KilangDesaMurniBatik to niaga-platform

Write-Host "Fixing import paths in all Go files..." -ForegroundColor Yellow

# Get all Go files
$files = Get-ChildItem -Path . -Filter "*.go" -Recurse -Exclude "vendor","node_modules"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # Replace KilangDesaMurniBatik with niaga-platform
    $content = $content -replace 'github\.com/KilangDesaMurniBatik/', 'github.com/niaga-platform/'

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "✅ Import paths fixed!" -ForegroundColor Green