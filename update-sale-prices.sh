#!/bin/bash

# ============================================================================
# Update all products to have sale_price = base_price
# ============================================================================

API_URL="http://72.62.67.167/api/v1"

echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kilang.com", "password": "Admin1234"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed!"
    exit 1
fi

echo "Token obtained!"
echo ""

# Get all products
echo "Fetching all products..."
PRODUCTS=$(curl -s "$API_URL/catalog/products?limit=100")

# Extract products with null sale_price
echo "Updating products without sale_price..."

# Product IDs and their base prices
# Kemeja Batik Tulis Premium - 250000
echo "  Updating Kemeja Batik Tulis Premium..."
curl -s -X PUT "$API_URL/admin/products/c5efdba5-8da6-48ac-bfea-87dff96adb71" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sale_price": 250000}' > /dev/null
echo "  ✓ Updated"

# Kemeja Batik Parang Rusak - 325000
echo "  Updating Kemeja Batik Parang Rusak..."
curl -s -X PUT "$API_URL/admin/products/d4125b50-ebe2-4631-bc8c-ffdc538fee07" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sale_price": 325000}' > /dev/null
echo "  ✓ Updated"

# Dress Batik Truntum - 450000
echo "  Updating Dress Batik Truntum..."
curl -s -X PUT "$API_URL/admin/products/dc1f7800-60e1-4c12-97b2-60b42485b0a3" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sale_price": 450000}' > /dev/null
echo "  ✓ Updated"

echo ""
echo "========================================"
echo "All products now have sale prices!"
echo "========================================"
echo ""

# Verify
echo "Verifying..."
curl -s "$API_URL/catalog/products" | grep -o '"sale_price":[^,]*' | head -6
echo ""
echo "✓ Done!"
