# PowerShell script to pull updates from all Git repositories

$repos = @(
    "database",
    "frontend-admin",
    "frontend-agent",
    "frontend-storefront",
    "frontend-warehouse",
    "infra-database",
    "infra-platform",
    "kilang-docs",
    "lib-common",
    "lib-ui",
    "service-agent",
    "service-auth",
    "service-catalog",
    "service-customer",
    "service-inventory",
    "service-notification",
    "service-order",
    "service-reporting"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pulling updates from all repositories" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failedRepos = @()

foreach ($repo in $repos) {
    if (Test-Path -Path $repo) {
        Write-Host "[$repo] " -NoNewline -ForegroundColor Yellow

        # Check if it's a git repository
        $gitPath = Join-Path $repo ".git"
        if (Test-Path -Path $gitPath) {
            Push-Location $repo
            try {
                # Get current branch
                $branch = git rev-parse --abbrev-ref HEAD 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Pulling from branch '$branch'..." -ForegroundColor Green

                    # Pull updates
                    $output = git pull 2>&1

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  ✓ $output" -ForegroundColor Green
                        $successCount++
                    } else {
                        Write-Host "  ✗ Failed to pull: $output" -ForegroundColor Red
                        $failedRepos += $repo
                    }
                } else {
                    Write-Host "  ✗ Could not determine branch" -ForegroundColor Red
                    $failedRepos += $repo
                }
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "  → Not a Git repository, skipping" -ForegroundColor Gray
        }
    } else {
        Write-Host "[$repo] " -NoNewline -ForegroundColor Yellow
        Write-Host "  → Directory not found, skipping" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Successfully updated: $successCount repositories" -ForegroundColor Green

if ($failedRepos.Count -gt 0) {
    Write-Host "  Failed repositories:" -ForegroundColor Red
    foreach ($failed in $failedRepos) {
        Write-Host "    - $failed" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan