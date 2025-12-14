#!/bin/bash

echo "Updating Frontend Applications..."

# Update Admin Panel
echo "Building Admin Panel..."
cd frontend-admin
docker build -t kilang-admin:latest .
cd ..

# Update Storefront
echo "Building Storefront..."
cd frontend-storefront
docker build -t kilang-storefront:latest .
cd ..

echo "Saving Docker images..."
docker save kilang-admin:latest kilang-storefront:latest | gzip > frontends.tar.gz

echo "Uploading to VPS..."
scp frontends.tar.gz root@72.62.67.167:/tmp/

echo "Deploying on VPS..."
ssh root@72.62.67.167 << 'EOF'
cd /tmp
echo "Loading Docker images..."
gunzip -c frontends.tar.gz | docker load

echo "Restarting containers..."
docker stop kilang-admin kilang-storefront
docker rm kilang-admin kilang-storefront

# Start Admin
docker run -d \
  --name kilang-admin \
  --network infra-platform_kilang-network \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_BASE_URL="http://72.62.67.167/api/v1" \
  -p 3001:3000 \
  kilang-admin:latest

# Start Storefront
docker run -d \
  --name kilang-storefront \
  --network infra-platform_kilang-network \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_URL="http://72.62.67.167/api/v1" \
  -p 3002:3000 \
  kilang-storefront:latest

echo "Checking status..."
docker ps | grep -E "kilang-admin|kilang-storefront"
rm frontends.tar.gz
EOF

rm frontends.tar.gz
echo "Update complete!"