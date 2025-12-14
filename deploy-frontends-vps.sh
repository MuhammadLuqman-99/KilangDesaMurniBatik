#!/bin/bash

# Script to update frontends on VPS by pulling from GitHub and rebuilding

ssh root@72.62.67.167 << 'EOF'
echo "=== Updating Frontend Applications on VPS ==="

# Create temp directory
mkdir -p /tmp/frontend-update
cd /tmp/frontend-update

# Clone/Update Admin Panel
echo "Cloning Admin Panel from GitHub..."
git clone https://github.com/KilangDesaMurniBatik/frontend-admin.git
cd frontend-admin
echo "Building Admin Panel Docker image..."
docker build -t kilang-admin:latest .
cd ..

# Clone/Update Storefront
echo "Cloning Storefront from GitHub..."
git clone https://github.com/KilangDesaMurniBatik/frontend-storefront.git
cd frontend-storefront
echo "Building Storefront Docker image..."
docker build -t kilang-storefront:latest .
cd ..

# Stop existing containers
echo "Stopping existing containers..."
docker stop kilang-admin kilang-storefront 2>/dev/null
docker rm kilang-admin kilang-storefront 2>/dev/null

# Run new Admin Panel
echo "Starting new Admin Panel..."
docker run -d \
  --name kilang-admin \
  --network infra-platform_kilang-network \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_BASE_URL="http://72.62.67.167/api/v1" \
  -p 3001:3000 \
  kilang-admin:latest

# Run new Storefront
echo "Starting new Storefront..."
docker run -d \
  --name kilang-storefront \
  --network infra-platform_kilang-network \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_URL="http://72.62.67.167/api/v1" \
  -p 3002:3000 \
  kilang-storefront:latest

# Check status
echo "Checking container status..."
docker ps | grep -E "kilang-admin|kilang-storefront"

# Cleanup
cd /
rm -rf /tmp/frontend-update

echo "=== Update Complete! ==="
echo "Admin Panel: http://72.62.67.167:3001"
echo "Storefront: http://72.62.67.167:3002"
EOF