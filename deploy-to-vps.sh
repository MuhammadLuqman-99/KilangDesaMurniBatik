#!/bin/bash
# ==============================================================================
# KILANG DESA MURNI BATIK - VPS Deployment Script
# ==============================================================================
# This script deploys all services to the production VPS at 72.62.67.167
#
# Usage: ./deploy-to-vps.sh [service]
# Examples:
#   ./deploy-to-vps.sh          # Deploy all services
#   ./deploy-to-vps.sh admin    # Deploy only admin frontend
#   ./deploy-to-vps.sh auth     # Deploy only auth service
# ==============================================================================

set -e

# Configuration
VPS_HOST="root@72.62.67.167"
VPS_URL="http://72.62.67.167"
DOCKER_NETWORK="infra-platform_kilang-network"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to deploy a service
deploy_service() {
    local service=$1
    local image_name=$2
    local container_name=$3
    local port_mapping=$4
    local env_vars=$5

    print_info "Deploying $service..."

    # Build the image locally
    if [ -d "$service" ]; then
        print_info "Building $service image..."
        cd $service
        docker build -t $image_name .
        cd ..
    else
        print_error "Directory $service not found!"
        return 1
    fi

    # Save and transfer the image
    print_info "Saving and transferring image to VPS..."
    docker save $image_name | gzip | ssh $VPS_HOST "gunzip | docker load"

    # Stop and remove old container if exists
    print_info "Stopping old container if exists..."
    ssh $VPS_HOST "docker stop $container_name 2>/dev/null || true && docker rm $container_name 2>/dev/null || true"

    # Run new container
    print_info "Starting new container..."
    ssh $VPS_HOST "docker run -d \
        --name $container_name \
        --network $DOCKER_NETWORK \
        --restart unless-stopped \
        $port_mapping \
        $env_vars \
        $image_name"

    print_success "$service deployed successfully!"
}

# Function to deploy frontend with proper env vars
deploy_frontend() {
    local service=$1
    local container_name=$2
    local base_path=$3

    print_info "Deploying $service frontend..."

    # Build with production env vars
    if [ -d "$service" ]; then
        cd $service

        # Create production .env
        cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=$VPS_URL/api/v1
NEXT_PUBLIC_MINIO_URL=$VPS_URL/storage
NEXT_PUBLIC_USE_MOCK=false
NODE_ENV=production
EOF

        # Build the image
        print_info "Building $service with production config..."
        docker build \
            --build-arg NEXT_PUBLIC_API_URL=$VPS_URL/api/v1 \
            --build-arg NEXT_PUBLIC_MINIO_URL=$VPS_URL/storage \
            --build-arg NODE_ENV=production \
            -t infra-platform-$service .

        cd ..
    else
        print_error "Directory $service not found!"
        return 1
    fi

    # Save and transfer
    print_info "Transferring to VPS..."
    docker save infra-platform-$service | gzip | ssh $VPS_HOST "gunzip | docker load"

    # Deploy on VPS
    ssh $VPS_HOST "docker stop $container_name 2>/dev/null || true && docker rm $container_name 2>/dev/null || true"

    ssh $VPS_HOST "docker run -d \
        --name $container_name \
        --network $DOCKER_NETWORK \
        --restart unless-stopped \
        -e NEXT_PUBLIC_API_URL=$VPS_URL/api/v1 \
        -e NEXT_PUBLIC_MINIO_URL=$VPS_URL/storage \
        -e NODE_ENV=production \
        infra-platform-$service"

    print_success "$service deployed!"
}

# Main deployment logic
main() {
    echo "========================================"
    echo "  KILANG DESA MURNI BATIK - VPS Deploy"
    echo "========================================"
    echo ""

    # Check SSH connection
    print_info "Testing VPS connection..."
    if ssh $VPS_HOST "echo 'Connected'" > /dev/null 2>&1; then
        print_success "VPS connection successful"
    else
        print_error "Cannot connect to VPS. Check your SSH access."
        exit 1
    fi

    # Deploy based on argument
    case "${1:-all}" in
        all)
            print_info "Deploying all services..."

            # Deploy frontends
            deploy_frontend "frontend-admin" "kilang-admin" "/admin"
            deploy_frontend "frontend-storefront" "kilang-storefront" "/"
            deploy_frontend "frontend-warehouse" "kilang-warehouse" "/warehouse"

            # Deploy backend services (add as needed)
            # deploy_service "service-auth" "infra-platform-service-auth" "kilang-auth" "-p 8001:8001" ""
            # deploy_service "service-catalog" "infra-platform-service-catalog" "kilang-catalog" "-p 8002:8002" ""

            print_success "All services deployed!"
            ;;

        admin)
            deploy_frontend "frontend-admin" "kilang-admin" "/admin"
            ;;

        storefront)
            deploy_frontend "frontend-storefront" "kilang-storefront" "/"
            ;;

        warehouse)
            deploy_frontend "frontend-warehouse" "kilang-warehouse" "/warehouse"
            ;;

        *)
            print_error "Unknown service: $1"
            echo "Usage: $0 [all|admin|storefront|warehouse]"
            exit 1
            ;;
    esac

    # Restart nginx to ensure connections are fresh
    print_info "Restarting nginx..."
    ssh $VPS_HOST "docker restart kilang-nginx"

    echo ""
    echo "========================================"
    print_success "Deployment complete!"
    echo "========================================"
    echo ""
    echo "Access your services at:"
    echo "  - Admin:      $VPS_URL/admin"
    echo "  - Storefront: $VPS_URL"
    echo "  - Warehouse:  $VPS_URL/warehouse"
    echo ""
}

# Run main function
main "$@"