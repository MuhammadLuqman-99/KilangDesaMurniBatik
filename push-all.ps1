# =============================================================================
# Commit and Push All Repositories for VPS Deployment
# =============================================================================
# Run this script from the KilangDesaMurniBatik root directory
# =============================================================================

$ErrorActionPreference = "Continue"
$commitMessage = "Pre-production preparation for VPS deployment"

# List of repositories to commit and push
$repos = @(
    "database",
    "frontend-admin",
    "frontend-storefront",
    "frontend-warehouse",
    "infra-platform",
    "kilang-docs",
    "lib-common",
    "service-auth",
    "service-catalog",
    "service-customer",
    "service-inventory",
    "service-notification",
    "service-order",
    "service-reporting",
    "service-agent"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Committing and Pushing All Repos" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($repo in $repos) {
    $repoPath = Join-Path $PSScriptRoot $repo
    
    if (Test-Path $repoPath) {
        Write-Host "`n[$repo]" -ForegroundColor Yellow
        
        Push-Location $repoPath
        
        # Check if there are changes
        $status = git status --porcelain 2>$null
        
        if ($status) {
            Write-Host "  Adding changes..." -ForegroundColor Gray
            git add -A
            
            Write-Host "  Committing..." -ForegroundColor Gray
            git commit -m $commitMessage 2>$null
            
            Write-Host "  Pushing to origin..." -ForegroundColor Gray
            $pushResult = git push origin main 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Pushed successfully!" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ Push failed or no remote: $pushResult" -ForegroundColor Red
            }
        } else {
            Write-Host "  - No changes to commit" -ForegroundColor Gray
        }
        
        Pop-Location
    } else {
        Write-Host "`n[$repo] - Directory not found" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
