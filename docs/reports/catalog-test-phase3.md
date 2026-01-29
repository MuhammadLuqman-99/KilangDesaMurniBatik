# Phase 3 Catalog Service - API Testing Script

This script tests all Phase 3 catalog endpoints using PowerShell.

## Prerequisites

```powershell
# Start the catalog service (in one terminal)
cd c:\Users\DesaMurniLuqman\Desktop\niaga-platform\service-catalog
.\catalog-service.exe

# Or use the docker-compose setup
cd c:\Users\DesaMurniLuqman\Desktop\niaga-platform
docker-compose -f docker-compose.dev.yml up -d
```

## Test Script

```powershell
# Set base URL
$BASE_URL = "http://localhost:8002"

# Helper function
function Test-Endpoint {
    param($Method, $Url, $Body = $null, $Description)
    Write-Host "`n=== $Description ===" -ForegroundColor Cyan
    Write-Host "$Method $Url" -ForegroundColor Yellow

    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body ($Body | ConvertTo-Json) -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method
        }
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3
        return $response
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "🧪 Phase 3 Catalog Service Testing" -ForegroundColor Magenta

# 1. Health Check
Test-Endpoint -Method GET -Url "$BASE_URL/health" -Description "Health Check"

# 2. Create Category
$category = Test-Endpoint -Method POST -Url "$BASE_URL/api/v1/catalog/admin/categories" `
    -Body @{
        name = "Test Category $(Get-Date -Format 'HHmmss')"
        description = "Test category for Phase 3 verification"
        is_active = $true
    } -Description "Create Category"

$categoryId = $category.category.id

# 3. List Categories
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/categories" -Description "List Categories"

# 4. Get Category by Slug
if ($category) {
    $slug = $category.category.slug
    Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/categories/$slug" -Description "Get Category by Slug"
}

# 5. Update Category
if ($categoryId) {
    Test-Endpoint -Method PUT -Url "$BASE_URL/api/v1/catalog/admin/categories/$categoryId" `
        -Body @{
            description = "Updated description"
            is_active = $true
        } -Description "Update Category"
}

# 6. Create Product
$product = Test-Endpoint -Method POST -Url "$BASE_URL/api/v1/catalog/admin/products" `
    -Body @{
        name = "Test Product $(Get-Date -Format 'HHmmss')"
        description = "Test product for Phase 3 verification"
        short_desc = "Test product"
        category_id = $categoryId
        base_price = 99.99
        stock_quantity = 100
        is_active = $true
    } -Description "Create Product"

$productId = $product.product.id

# 7. List Products
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/products" -Description "List Products"

# 8. Get Product by Slug
if ($product) {
    $productSlug = $product.product.slug
    Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/products/$productSlug" -Description "Get Product by Slug"
}

# 9. Update Product
if ($productId) {
    Test-Endpoint -Method PUT -Url "$BASE_URL/api/v1/catalog/admin/products/$productId" `
        -Body @{
            base_price = 89.99
            sale_price = 79.99
            is_featured = $true
        } -Description "Update Product"
}

# 10. Create Product Variant
$variant = Test-Endpoint -Method POST -Url "$BASE_URL/api/v1/catalog/admin/products/$productId/variants" `
    -Body @{
        sku = "TEST-VAR-$(Get-Date -Format 'HHmmss')"
        name = "Size M / Color Red"
        price = 89.99
        stock_quantity = 50
        is_active = $true
        attributes = @{
            size = "M"
            color = "Red"
        }
    } -Description "Create Product Variant"

$variantId = $variant.variant.id

# 11. List Product Variants
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/products/$productSlug/variants" -Description "List Product Variants"

# 12. Update Product Variant
if ($variantId) {
    Test-Endpoint -Method PUT -Url "$BASE_URL/api/v1/catalog/admin/products/$productId/variants/$variantId" `
        -Body @{
            price = 79.99
            stock_quantity = 75
        } -Description "Update Product Variant"
}

# 13. Test Search
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/search?q=test" -Description "Search Products"

# 14. Test Search Suggestions
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/search/suggestions?q=test" -Description "Search Suggestions"

# 15. Test Filters
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/filters" -Description "Get General Filters"

# 16. Test Products with Filters
Test-Endpoint -Method GET -Url "$BASE_URL/api/v1/catalog/products?min_price=50&max_price=150&is_active=true" -Description "List Products with Filters"

# 17. Delete Product Variant
if ($variantId) {
    Test-Endpoint -Method DELETE -Url "$BASE_URL/api/v1/catalog/admin/products/$productId/variants/$variantId" -Description "Delete Product Variant"
}

# 18. Delete Product
if ($productId) {
    Test-Endpoint -Method DELETE -Url "$BASE_URL/api/v1/catalog/admin/products/$productId" -Description "Delete Product"
}

# 19. Delete Category
if ($categoryId) {
    Test-Endpoint -Method DELETE -Url "$BASE_URL/api/v1/catalog/admin/categories/$categoryId" -Description "Delete Category"
}

Write-Host "`n✅ Phase 3 Testing Complete!" -ForegroundColor Green
```

## Quick Test Commands

```powershell
# Test health
Invoke-RestMethod -Uri "http://localhost:8002/health"

# List categories
Invoke-RestMethod -Uri "http://localhost:8002/api/v1/catalog/categories"

# List products
Invoke-RestMethod -Uri "http://localhost:8002/api/v1/catalog/products"

# Test search
Invoke-RestMethod -Uri "http://localhost:8002/api/v1/search?q=test"
```

## Expected Results

- ✅ All endpoints should return proper JSON responses
- ✅ Create/Update/Delete operations should succeed
- ✅ Products should show in list after creation
- ✅ Variants should be associated with products
- ✅ Search should work without errors
- ✅ Filters should return proper structure
