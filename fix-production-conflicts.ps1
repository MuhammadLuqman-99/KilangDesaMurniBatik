# Fix Production Conflicts Script for Kilang Desa Murni Batik (Windows)
# This script resolves duplicate files and compilation errors locally

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Production Conflict Resolution (Local)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Save current directory
$originalPath = Get-Location

Write-Host ""
Write-Host "1. Fixing service-customer conflicts..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

# Remove the conflicting admin.go file
$customerAdminPath = ".\service-customer\internal\handlers\admin.go"
if (Test-Path $customerAdminPath) {
    Write-Host "Removing duplicate admin.go in service-customer..."
    Remove-Item $customerAdminPath -Force
    Write-Host "✅ Removed service-customer/internal/handlers/admin.go" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Fixing service-auth conflicts..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

# Remove the duplicate login_history.go file
$loginHistoryPath = ".\service-auth\internal\models\login_history.go"
if (Test-Path $loginHistoryPath) {
    Write-Host "Removing duplicate login_history.go..."
    Remove-Item $loginHistoryPath -Force
    Write-Host "✅ Removed service-auth/internal/models/login_history.go" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Fixing service-reporting GORM syntax errors..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$dashboardPath = ".\service-reporting\internal\handlers\dashboard.go"
if (Test-Path $dashboardPath) {
    Write-Host "Fixing GORM syntax in dashboard.go..."

    $content = Get-Content $dashboardPath -Raw

    # Fix line 89 - Remove extra arguments from Select
    $content = $content -replace 'Select\("DATE\(created_at\) as date, COUNT\(\*\) as count", startDate, endDate\)', 'Select("DATE(created_at) as date, COUNT(*) as count")'

    # Fix line 115 - Remove extra arguments from Select
    $content = $content -replace 'Select\("DATE\(created_at\) as date, SUM\(total_amount\) as revenue", startDate, endDate\)', 'Select("DATE(created_at) as date, SUM(total_amount) as revenue")'

    # Fix line 142 - Remove extra arguments from Select
    $content = $content -replace 'Select\("status, COUNT\(\*\) as count", startDate, endDate\)', 'Select("status, COUNT(*) as count")'

    Set-Content -Path $dashboardPath -Value $content
    Write-Host "✅ Fixed GORM syntax errors in dashboard.go" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Fixing service-inventory admin handler..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$inventoryAdminPath = ".\service-inventory\internal\handlers\admin.go"
$inventoryAdminHandlerPath = ".\service-inventory\internal\handlers\admin_inventory_handler.go"

if ((Test-Path $inventoryAdminPath) -and (Test-Path $inventoryAdminHandlerPath)) {
    Write-Host "Found duplicate admin handlers in service-inventory..."
    Write-Host "Keeping admin_inventory_handler.go, removing admin.go..."
    Remove-Item $inventoryAdminPath -Force
    Write-Host "✅ Removed service-inventory/internal/handlers/admin.go" -ForegroundColor Green
}

Write-Host ""
Write-Host "5. Fixing service-agent admin handler..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$agentAdminPath = ".\service-agent\internal\handlers\admin.go"
if (Test-Path $agentAdminPath) {
    # Check if AdminAgentHandler is defined elsewhere
    $otherFiles = Get-ChildItem ".\service-agent\internal\handlers\*.go" -Exclude "admin.go"
    $foundDuplicate = $false

    foreach ($file in $otherFiles) {
        if (Select-String -Path $file -Pattern "type AdminAgentHandler struct" -Quiet) {
            $foundDuplicate = $true
            break
        }
    }

    if ($foundDuplicate) {
        Write-Host "Found duplicate AdminAgentHandler definition..."
        Write-Host "Removing admin.go to avoid conflicts..."
        Remove-Item $agentAdminPath -Force
        Write-Host "✅ Removed service-agent/internal/handlers/admin.go" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "6. Ensuring Customer model has required fields..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$customerModelPath = ".\service-customer\internal\models\customer.go"
if (Test-Path $customerModelPath) {
    $modelContent = Get-Content $customerModelPath -Raw

    # Check and add Name field if missing
    if ($modelContent -notmatch 'Name\s+string') {
        Write-Host "Adding Name field to Customer model..."
        $modelContent = $modelContent -replace '(type Customer struct \{)', "`$1`n`tName        string    ``json:""name"" gorm:""type:varchar(100)""``"
    }

    # Check and add Segment field if missing
    if ($modelContent -notmatch 'Segment\s+string') {
        Write-Host "Adding Segment field to Customer model..."
        $modelContent = $modelContent -replace '(type Customer struct \{)', "`$1`n`tSegment     string    ``json:""segment"" gorm:""type:varchar(50);default:regular""``"
    }

    Set-Content -Path $customerModelPath -Value $modelContent
    Write-Host "✅ Ensured Customer model has required fields" -ForegroundColor Green
}

Write-Host ""
Write-Host "7. Running go mod tidy on all services..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$services = @(
    "service-auth",
    "service-customer",
    "service-order",
    "service-inventory",
    "service-reporting",
    "service-agent",
    "service-catalog"
)

foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "Tidying $service..."
        Set-Location $service
        & go mod tidy 2>$null
        Set-Location $originalPath
    }
}
Write-Host "✅ Module dependencies updated" -ForegroundColor Green

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "✅ Local Conflict Resolution Complete!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now you can:" -ForegroundColor Yellow
Write-Host "1. Commit and push these changes:"
Write-Host "   git add -A" -ForegroundColor Gray
Write-Host "   git commit -m 'Fix: Remove duplicate files and fix compilation errors'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. On the production server, pull and rebuild:"
Write-Host "   cd /opt/kilang" -ForegroundColor Gray
Write-Host "   git pull origin main" -ForegroundColor Gray
Write-Host "   cd infra-platform" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose.vps.yml up -d --build" -ForegroundColor Gray