# PowerShell script to remove all localhost references and replace with VPS IP
# This ensures production code never accidentally uses localhost

$vpsUrl = "http://72.62.67.167"
$folders = @(
    "frontend-admin",
    "frontend-storefront",
    "frontend-warehouse",
    "frontend-agent"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removing localhost references" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalFiles = 0
$updatedFiles = 0

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "Processing $folder..." -ForegroundColor Yellow

        # Find all TypeScript, JavaScript, and env files
        $files = Get-ChildItem -Path $folder -Include "*.ts","*.tsx","*.js","*.jsx",".env*" -Recurse -File

        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw
            $originalContent = $content

            # Replace various localhost patterns
            $content = $content -replace 'http://localhost:8080/api/v1', "$vpsUrl/api/v1"
            $content = $content -replace 'http://localhost:8080', "$vpsUrl"
            $content = $content -replace 'http://localhost:8001/api/v1', "$vpsUrl/api/v1"
            $content = $content -replace 'http://localhost:8001', "$vpsUrl"
            $content = $content -replace 'http://localhost:8002', "$vpsUrl"
            $content = $content -replace 'http://localhost:8003', "$vpsUrl"
            $content = $content -replace 'http://localhost:8004', "$vpsUrl"
            $content = $content -replace 'http://localhost:8005', "$vpsUrl"
            $content = $content -replace 'http://localhost:8006', "$vpsUrl"
            $content = $content -replace 'http://localhost:8007', "$vpsUrl"
            $content = $content -replace 'http://localhost:8008', "$vpsUrl"
            $content = $content -replace 'http://localhost:9000', "$vpsUrl/storage"
            $content = $content -replace 'http://localhost:3000', "$vpsUrl"
            $content = $content -replace 'http://localhost:3001', "$vpsUrl/admin"
            $content = $content -replace 'http://localhost:3002', "$vpsUrl/warehouse"

            $totalFiles++

            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                Write-Host "  ✓ Updated: $($file.Name)" -ForegroundColor Green
                $updatedFiles++
            }
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Total files checked: $totalFiles" -ForegroundColor White
Write-Host "  Files updated: $updatedFiles" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan