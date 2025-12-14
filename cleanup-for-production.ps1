# PowerShell Script to Clean Up Development Configurations for Production
# Run this before deploying to production to ensure no localhost references remain

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " KILANG PRODUCTION CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$VPS_URL = "http://72.62.67.167"
$errors = @()
$warnings = @()
$fixed = @()

# Function to check and fix files
function Fix-LocalhostReferences {
    param($path, $pattern, $replacement, $description)

    if (Test-Path $path) {
        $content = Get-Content $path -Raw -ErrorAction SilentlyContinue
        if ($content -match $pattern) {
            try {
                $newContent = $content -replace $pattern, $replacement
                Set-Content -Path $path -Value $newContent -NoNewline
                $script:fixed += "Fixed: $description in $path"
                return $true
            } catch {
                $script:errors += "✗ Failed to fix: $path - $_"
                return $false
            }
        }
    }
    return $false
}

Write-Host "Step 1: Checking for localhost references..." -ForegroundColor Yellow

# Check all TypeScript/JavaScript files
$codeFiles = Get-ChildItem -Path . -Include "*.ts","*.tsx","*.js","*.jsx" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }

$localhostCount = 0
foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "localhost:\d+") {
        $localhostCount++
        $warnings += "⚠ Found localhost in: $($file.Name)"

        # Auto-fix the file
        $newContent = $content -replace 'http://localhost:8080/api/v1', "$VPS_URL/api/v1"
        $newContent = $newContent -replace 'http://localhost:\d+', $VPS_URL
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $fixed += "✓ Fixed: $($file.Name)"
    }
}

Write-Host "Step 2: Checking .env files..." -ForegroundColor Yellow

# Fix all .env files
$envFiles = @(
    "frontend-admin\.env",
    "frontend-admin\.env.local",
    "frontend-admin\.env.development",
    "frontend-storefront\.env",
    "frontend-storefront\.env.local",
    "frontend-storefront\.env.development",
    "frontend-warehouse\.env",
    "frontend-warehouse\.env.local",
    "frontend-warehouse\.env.development"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        if ($content -match "localhost") {
            $warnings += "⚠ Found localhost in: $envFile"

            # Create proper production env
            $prodEnv = @"
# Production Environment Variables
NEXT_PUBLIC_API_URL=$VPS_URL/api/v1
NEXT_PUBLIC_MINIO_URL=$VPS_URL/storage
NEXT_PUBLIC_USE_MOCK=false
NODE_ENV=production
"@
            Set-Content -Path $envFile -Value $prodEnv
            $fixed += "✓ Fixed: $envFile"
        }
    }
}

Write-Host "Step 3: Removing development-only files..." -ForegroundColor Yellow

# Remove dev-only files
$devFiles = @(
    ".env.local",
    ".env.development",
    ".env.development.local"
)

$frontendDirs = @("frontend-admin", "frontend-storefront", "frontend-warehouse", "frontend-agent")
foreach ($dir in $frontendDirs) {
    foreach ($devFile in $devFiles) {
        $fullPath = Join-Path $dir $devFile
        if (Test-Path $fullPath) {
            Remove-Item $fullPath -Force
            $fixed += "✓ Removed: $fullPath"
        }
    }
}

Write-Host "Step 4: Checking Docker configurations..." -ForegroundColor Yellow

# Check docker-compose files
$dockerFiles = Get-ChildItem -Path . -Filter "docker-compose*.yml" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $dockerFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "localhost:\d+") {
        $warnings += "⚠ Found localhost in Docker config: $($file.Name)"
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($fixed.Count -gt 0) {
    Write-Host "Fixed Issues:" -ForegroundColor Green
    foreach ($fix in $fixed) {
        Write-Host "  $fix" -ForegroundColor Green
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "Warnings Found:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
    Write-Host ""
}

# Final verification
Write-Host "Step 5: Final Verification..." -ForegroundColor Yellow

$remainingLocalhost = 0
$codeFiles = Get-ChildItem -Path . -Include "*.ts","*.tsx","*.js","*.jsx" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }

foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "localhost:\d+") {
        $remainingLocalhost++
    }
}

if ($remainingLocalhost -eq 0) {
    Write-Host ""
    Write-Host "✓ SUCCESS: No localhost references found!" -ForegroundColor Green
    Write-Host "✓ Your code is ready for production deployment." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ WARNING: Still found $remainingLocalhost files with localhost references!" -ForegroundColor Red
    Write-Host "  Please review and fix manually." -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Next Steps:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Commit these changes:" -ForegroundColor White
Write-Host "   git add -A" -ForegroundColor Gray
Write-Host "   git commit -m 'Remove all localhost references for production'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy to VPS:" -ForegroundColor White
Write-Host "   ./deploy-to-vps.sh all" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify deployment:" -ForegroundColor White
Write-Host "   curl http://72.62.67.167/nginx-health" -ForegroundColor Gray
Write-Host ""