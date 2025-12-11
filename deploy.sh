#!/bin/bash
set -e

echo "🚀 Kilang Desa Murni Batik - VPS Deployment"
echo "============================================"

cd /opt/kilang/infra-platform

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "✓ Environment file found"
echo ""

# Start infrastructure services
echo "📦 Starting infrastructure (Postgres, Redis, MinIO, NATS)..."
docker compose -f docker-compose.vps.yml up -d postgres redis minio nats

echo "⏳ Waiting for database to be ready..."
sleep 10

# Start backend services
echo ""
echo "⚙️  Building and starting backend services..."
docker compose -f docker-compose.vps.yml up -d --build \
    service-auth \
    service-catalog \
    service-inventory \
    service-order \
    service-customer \
    service-agent \
    service-notification \
    service-reporting

echo "⏳ Waiting for backend services to start..."
sleep 15

# Start frontend services
echo ""
echo "🎨 Building and starting frontend services..."
docker compose -f docker-compose.vps.yml up -d --build \
    frontend-storefront \
    frontend-admin \
    frontend-warehouse

echo "⏳ Waiting for frontend services to start..."
sleep 10

# Start nginx
echo ""
echo "🌐 Starting Nginx reverse proxy..."
docker compose -f docker-compose.vps.yml up -d nginx

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.vps.yml ps

echo ""
echo "🌍 Access your application at: http://72.62.67.167"
echo "   - Storefront: http://72.62.67.167"
echo "   - Admin: http://72.62.67.167/admin"
echo "   - Warehouse: http://72.62.67.167/warehouse"
