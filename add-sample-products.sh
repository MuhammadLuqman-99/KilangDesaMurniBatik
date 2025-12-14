#!/bin/bash

# ============================================================================
# Kilang Desa Murni Batik - Sample Product Creation Script
# ============================================================================

API_URL="http://72.62.67.167/api/v1"
ADMIN_EMAIL="admin@kilang.com"
ADMIN_PASSWORD="Admin1234"

echo "========================================"
echo "Kilang Batik - Product Creation Flow"
echo "========================================"
echo ""

# Step 1: Login
echo "Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "✗ Login failed!"
    exit 1
fi

echo "✓ Login successful!"
echo ""

# Step 2: Create Categories
echo "Step 2: Creating categories..."

# Category 1: Batik Pria
echo "  Creating 'Batik Pria' category..."
CAT1_RESPONSE=$(curl -s -X POST "$API_URL/admin/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Batik Pria", "description": "Koleksi batik untuk pria", "is_active": true}')

CAT_PRIA_ID=$(echo $CAT1_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "  ✓ Batik Pria created (ID: $CAT_PRIA_ID)"

# Category 2: Batik Wanita
echo "  Creating 'Batik Wanita' category..."
CAT2_RESPONSE=$(curl -s -X POST "$API_URL/admin/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Batik Wanita", "description": "Koleksi batik untuk wanita", "is_active": true}')

CAT_WANITA_ID=$(echo $CAT2_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "  ✓ Batik Wanita created (ID: $CAT_WANITA_ID)"

# Category 3: Batik Couple
echo "  Creating 'Batik Couple' category..."
CAT3_RESPONSE=$(curl -s -X POST "$API_URL/admin/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Batik Couple", "description": "Koleksi batik couple untuk pasangan", "is_active": true}')

CAT_COUPLE_ID=$(echo $CAT3_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "  ✓ Batik Couple created (ID: $CAT_COUPLE_ID)"

echo ""

# Step 3: Create Products
echo "Step 3: Creating products..."

# Product 1
echo "  Creating 'Kemeja Batik Mega Mendung'..."
curl -s -X POST "$API_URL/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Kemeja Batik Mega Mendung\", \"description\": \"Kemeja batik premium dengan motif mega mendung khas Cirebon. Terbuat dari katun premium yang nyaman dan breathable.\", \"short_desc\": \"Batik premium motif mega mendung\", \"category_id\": \"$CAT_PRIA_ID\", \"base_price\": 350000, \"sale_price\": 315000, \"is_active\": true, \"is_featured\": true, \"stock_quantity\": 50}" > /dev/null
echo "  ✓ Kemeja Batik Mega Mendung created"

# Product 2
echo "  Creating 'Kemeja Batik Parang Rusak'..."
curl -s -X POST "$API_URL/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Kemeja Batik Parang Rusak\", \"description\": \"Kemeja batik dengan motif parang rusak klasik. Cocok untuk acara formal dan semi formal.\", \"short_desc\": \"Batik klasik motif parang\", \"category_id\": \"$CAT_PRIA_ID\", \"base_price\": 325000, \"is_active\": true, \"is_featured\": true, \"stock_quantity\": 40}" > /dev/null
echo "  ✓ Kemeja Batik Parang Rusak created"

# Product 3
echo "  Creating 'Blouse Batik Kawung'..."
curl -s -X POST "$API_URL/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Blouse Batik Kawung\", \"description\": \"Blouse batik wanita dengan motif kawung elegan. Desain modern dengan potongan yang flattering.\", \"short_desc\": \"Blouse batik motif kawung\", \"category_id\": \"$CAT_WANITA_ID\", \"base_price\": 280000, \"sale_price\": 245000, \"is_active\": true, \"is_featured\": true, \"stock_quantity\": 60}" > /dev/null
echo "  ✓ Blouse Batik Kawung created"

# Product 4
echo "  Creating 'Dress Batik Truntum'..."
curl -s -X POST "$API_URL/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Dress Batik Truntum\", \"description\": \"Dress batik dengan motif truntum yang anggun. Cocok untuk berbagai acara resmi.\", \"short_desc\": \"Dress batik motif truntum\", \"category_id\": \"$CAT_WANITA_ID\", \"base_price\": 450000, \"is_active\": true, \"stock_quantity\": 30}" > /dev/null
echo "  ✓ Dress Batik Truntum created"

# Product 5
echo "  Creating 'Set Batik Couple Sekar Jagad'..."
curl -s -X POST "$API_URL/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Set Batik Couple Sekar Jagad\", \"description\": \"Set batik couple dengan motif sekar jagad yang serasi. Terdiri dari kemeja pria dan dress wanita.\", \"short_desc\": \"Set couple motif sekar jagad\", \"category_id\": \"$CAT_COUPLE_ID\", \"base_price\": 750000, \"sale_price\": 675000, \"is_active\": true, \"is_featured\": true, \"stock_quantity\": 20}" > /dev/null
echo "  ✓ Set Batik Couple Sekar Jagad created"

echo ""
echo "========================================"
echo "Summary"
echo "========================================"
echo "Categories created: 3"
echo "  - Batik Pria"
echo "  - Batik Wanita"
echo "  - Batik Couple"
echo ""
echo "Products created: 5"
echo "  - Kemeja Batik Mega Mendung (Rp 315,000)"
echo "  - Kemeja Batik Parang Rusak (Rp 325,000)"
echo "  - Blouse Batik Kawung (Rp 245,000)"
echo "  - Dress Batik Truntum (Rp 450,000)"
echo "  - Set Batik Couple Sekar Jagad (Rp 675,000)"
echo ""
echo "✓ Done! Check your storefront at http://72.62.67.167"
