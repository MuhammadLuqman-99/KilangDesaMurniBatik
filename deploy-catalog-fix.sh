#!/bin/bash

echo "Deploying catalog service fixes to VPS..."

# SSH into VPS and update the services
ssh root@72.62.67.167 << 'EOF'
cd /opt/kilang

echo "Pulling latest changes..."
# Pull latest infra-platform
cd infra-platform
git pull
cd ..

# Pull latest service-catalog
cd service-catalog
git pull
cd ..

# Go back to infra-platform
cd infra-platform

echo "Setting MINIO_PUBLIC_URL in environment..."
export DOMAIN="72.62.67.167"

echo "Rebuilding catalog service..."
docker compose -f docker-compose.vps.yml build service-catalog

echo "Restarting catalog service..."
docker compose -f docker-compose.vps.yml up -d service-catalog

echo "Waiting for service to be healthy..."
sleep 10

echo "Checking service status..."
docker ps | grep kilang-catalog

echo "Verifying environment variables..."
docker exec kilang-catalog env | grep MINIO

echo "Deployment complete!"
EOF

echo "Testing API..."
curl -s http://72.62.67.167/api/v1/products | head -100

echo "Done!"