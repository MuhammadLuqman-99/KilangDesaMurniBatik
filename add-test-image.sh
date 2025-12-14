#!/bin/bash

# Script to add test image to product via API

PRODUCT_ID="9a7bce16-107d-4a4c-ba6c-ba4f0ac39ad6"  # test 1 product
API_URL="http://72.62.67.167/api/v1"

# First login to get token
echo "Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kilang.com", "password": "Admin1234"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token obtained"

# Create a simple test image (1x1 pixel PNG)
echo -n -e '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90\x77\x53\xde\x00\x00\x00\x0c\x49\x44\x41\x54\x08\x99\x63\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x9e\x54\xe8\x19\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82' > test.png

# Upload image
echo "Uploading image to product $PRODUCT_ID..."
curl -X POST "$API_URL/admin/products/$PRODUCT_ID/images" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test.png" \
  -w "\nHTTP Status: %{http_code}\n"

rm test.png
echo "Done!"