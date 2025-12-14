# ============================================================================
# Kilang Desa Murni Batik - Sample Product Creation Script
# ============================================================================
# This script demonstrates the flow to add categories and products
# ============================================================================

$API_URL = "http://72.62.67.167/api/v1"
$ADMIN_EMAIL = "admin@kilang.com"
$ADMIN_PASSWORD = "Admin1234"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kilang Batik - Product Creation Flow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Yellow
$loginResponse = curl -s -X POST "$API_URL/auth/login" `
  -H "Content-Type: application/json" `
  -d "{`"email`": `"$ADMIN_EMAIL`", `"password`": `"$ADMIN_PASSWORD`"}" | ConvertFrom-Json

if ($loginResponse.success -eq $true) {
    $TOKEN = $loginResponse.data.tokens.access_token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($TOKEN.Substring(0,20))..." -ForegroundColor Gray
} else {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create Categories
Write-Host "Step 2: Creating categories..." -ForegroundColor Yellow

# Category 1: Batik Pria
Write-Host "  Creating 'Batik Pria' category..." -ForegroundColor Gray
$category1 = curl -s -X POST "$API_URL/admin/categories" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{"name": "Batik Pria", "description": "Koleksi batik untuk pria", "is_active": true}' | ConvertFrom-Json

if ($category1.success -eq $true) {
    $CAT_PRIA_ID = $category1.data.id
    Write-Host "  ✓ Batik Pria created (ID: $CAT_PRIA_ID)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create Batik Pria" -ForegroundColor Red
}

# Category 2: Batik Wanita
Write-Host "  Creating 'Batik Wanita' category..." -ForegroundColor Gray
$category2 = curl -s -X POST "$API_URL/admin/categories" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{"name": "Batik Wanita", "description": "Koleksi batik untuk wanita", "is_active": true}' | ConvertFrom-Json

if ($category2.success -eq $true) {
    $CAT_WANITA_ID = $category2.data.id
    Write-Host "  ✓ Batik Wanita created (ID: $CAT_WANITA_ID)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create Batik Wanita" -ForegroundColor Red
}

# Category 3: Batik Couple
Write-Host "  Creating 'Batik Couple' category..." -ForegroundColor Gray
$category3 = curl -s -X POST "$API_URL/admin/categories" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{"name": "Batik Couple", "description": "Koleksi batik couple untuk pasangan", "is_active": true}' | ConvertFrom-Json

if ($category3.success -eq $true) {
    $CAT_COUPLE_ID = $category3.data.id
    Write-Host "  ✓ Batik Couple created (ID: $CAT_COUPLE_ID)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create Batik Couple" -ForegroundColor Red
}

Write-Host ""

# Step 3: Create Products
Write-Host "Step 3: Creating products..." -ForegroundColor Yellow

# Product 1: Kemeja Batik Mega Mendung (Pria)
Write-Host "  Creating 'Kemeja Batik Mega Mendung'..." -ForegroundColor Gray
$product1 = curl -s -X POST "$API_URL/admin/products" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{`"name`": `"Kemeja Batik Mega Mendung`", `"description`": `"Kemeja batik premium dengan motif mega mendung khas Cirebon. Terbuat dari katun premium yang nyaman dan breathable.`", `"short_desc`": `"Batik premium motif mega mendung`", `"category_id`": `"$CAT_PRIA_ID`", `"base_price`": 350000, `"sale_price`": 315000, `"is_active`": true, `"is_featured`": true, `"stock_quantity`": 50}" | ConvertFrom-Json

if ($product1.success -eq $true) {
    Write-Host "  ✓ Product created: $($product1.data.name) (SKU: $($product1.data.sku))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create product" -ForegroundColor Red
}

# Product 2: Kemeja Batik Parang (Pria)
Write-Host "  Creating 'Kemeja Batik Parang'..." -ForegroundColor Gray
$product2 = curl -s -X POST "$API_URL/admin/products" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{`"name`": `"Kemeja Batik Parang Rusak`", `"description`": `"Kemeja batik dengan motif parang rusak klasik. Cocok untuk acara formal dan semi formal.`", `"short_desc`": `"Batik klasik motif parang`", `"category_id`": `"$CAT_PRIA_ID`", `"base_price`": 325000, `"is_active`": true, `"is_featured`": true, `"stock_quantity`": 40}" | ConvertFrom-Json

if ($product2.success -eq $true) {
    Write-Host "  ✓ Product created: $($product2.data.name) (SKU: $($product2.data.sku))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create product" -ForegroundColor Red
}

# Product 3: Blouse Batik Wanita
Write-Host "  Creating 'Blouse Batik Kawung'..." -ForegroundColor Gray
$product3 = curl -s -X POST "$API_URL/admin/products" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{`"name`": `"Blouse Batik Kawung`", `"description`": `"Blouse batik wanita dengan motif kawung elegan. Desain modern dengan potongan yang flattering.`", `"short_desc`": `"Blouse batik motif kawung`", `"category_id`": `"$CAT_WANITA_ID`", `"base_price`": 280000, `"sale_price`": 245000, `"is_active`": true, `"is_featured`": true, `"stock_quantity`": 60}" | ConvertFrom-Json

if ($product3.success -eq $true) {
    Write-Host "  ✓ Product created: $($product3.data.name) (SKU: $($product3.data.sku))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create product" -ForegroundColor Red
}

# Product 4: Dress Batik Wanita
Write-Host "  Creating 'Dress Batik Truntum'..." -ForegroundColor Gray
$product4 = curl -s -X POST "$API_URL/admin/products" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{`"name`": `"Dress Batik Truntum`", `"description`": `"Dress batik dengan motif truntum yang anggun. Cocok untuk berbagai acara resmi.`", `"short_desc`": `"Dress batik motif truntum`", `"category_id`": `"$CAT_WANITA_ID`", `"base_price`": 450000, `"is_active`": true, `"stock_quantity`": 30}" | ConvertFrom-Json

if ($product4.success -eq $true) {
    Write-Host "  ✓ Product created: $($product4.data.name) (SKU: $($product4.data.sku))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create product" -ForegroundColor Red
}

# Product 5: Set Couple Batik
Write-Host "  Creating 'Set Batik Couple Sekar Jagad'..." -ForegroundColor Gray
$product5 = curl -s -X POST "$API_URL/admin/products" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{`"name`": `"Set Batik Couple Sekar Jagad`", `"description`": `"Set batik couple dengan motif sekar jagad yang serasi. Terdiri dari kemeja pria dan dress wanita.`", `"short_desc`": `"Set couple motif sekar jagad`", `"category_id`": `"$CAT_COUPLE_ID`", `"base_price`": 750000, `"sale_price`": 675000, `"is_active`": true, `"is_featured`": true, `"stock_quantity`": 20}" | ConvertFrom-Json

if ($product5.success -eq $true) {
    Write-Host "  ✓ Product created: $($product5.data.name) (SKU: $($product5.data.sku))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create product" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Categories created: 3" -ForegroundColor Green
Write-Host "  - Batik Pria" -ForegroundColor Gray
Write-Host "  - Batik Wanita" -ForegroundColor Gray
Write-Host "  - Batik Couple" -ForegroundColor Gray
Write-Host ""
Write-Host "Products created: 5" -ForegroundColor Green
Write-Host "  - Kemeja Batik Mega Mendung (Rp 315,000)" -ForegroundColor Gray
Write-Host "  - Kemeja Batik Parang Rusak (Rp 325,000)" -ForegroundColor Gray
Write-Host "  - Blouse Batik Kawung (Rp 245,000)" -ForegroundColor Gray
Write-Host "  - Dress Batik Truntum (Rp 450,000)" -ForegroundColor Gray
Write-Host "  - Set Batik Couple Sekar Jagad (Rp 675,000)" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Done! Check your storefront at http://72.62.67.167" -ForegroundColor Green
Write-Host ""
