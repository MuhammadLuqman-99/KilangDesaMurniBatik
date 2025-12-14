#!/bin/bash

# Fix Production Conflicts Script for Kilang Desa Murni Batik
# This script resolves duplicate files and compilation errors

echo "==================================================="
echo "Starting Production Conflict Resolution"
echo "==================================================="

# Navigate to the project directory
cd /opt/kilang

echo ""
echo "1. Fixing service-customer conflicts..."
echo "-----------------------------------"
# Remove the conflicting admin.go file (keep admin_customer_handler.go)
if [ -f "service-customer/internal/handlers/admin.go" ]; then
    echo "Removing duplicate admin.go in service-customer..."
    rm service-customer/internal/handlers/admin.go
    echo "✅ Removed service-customer/internal/handlers/admin.go"
fi

echo ""
echo "2. Fixing service-auth conflicts..."
echo "-----------------------------------"
# Remove the duplicate login_history.go file (keep activity_model.go)
if [ -f "service-auth/internal/models/login_history.go" ]; then
    echo "Removing duplicate login_history.go..."
    rm service-auth/internal/models/login_history.go
    echo "✅ Removed service-auth/internal/models/login_history.go"
fi

echo ""
echo "3. Fixing service-reporting GORM syntax errors..."
echo "-----------------------------------"
# Fix the GORM syntax error in dashboard.go
if [ -f "service-reporting/internal/handlers/dashboard.go" ]; then
    echo "Fixing GORM syntax in dashboard.go..."

    # Fix line 89 - Remove extra argument from Select
    sed -i 's/Select("DATE(created_at) as date, COUNT(\*) as count", startDate, endDate)/Select("DATE(created_at) as date, COUNT(*) as count")/g' service-reporting/internal/handlers/dashboard.go

    # Fix line 115 - Remove extra argument from Select
    sed -i 's/Select("DATE(created_at) as date, SUM(total_amount) as revenue", startDate, endDate)/Select("DATE(created_at) as date, SUM(total_amount) as revenue")/g' service-reporting/internal/handlers/dashboard.go

    # Fix line 142 - Remove extra argument from Select
    sed -i 's/Select("status, COUNT(\*) as count", startDate, endDate)/Select("status, COUNT(*) as count")/g' service-reporting/internal/handlers/dashboard.go

    echo "✅ Fixed GORM syntax errors in dashboard.go"
fi

echo ""
echo "4. Fixing service-inventory admin handler..."
echo "-----------------------------------"
# Check if admin.go exists in service-inventory and if it conflicts
if [ -f "service-inventory/internal/handlers/admin.go" ]; then
    # Check if there's already an admin_inventory_handler.go
    if [ -f "service-inventory/internal/handlers/admin_inventory_handler.go" ]; then
        echo "Found duplicate admin handlers in service-inventory..."
        echo "Keeping admin_inventory_handler.go, removing admin.go..."
        rm service-inventory/internal/handlers/admin.go
        echo "✅ Removed service-inventory/internal/handlers/admin.go"
    fi
fi

echo ""
echo "5. Fixing service-agent admin handler..."
echo "-----------------------------------"
# Check if there are conflicts in service-agent
if [ -f "service-agent/internal/handlers/admin.go" ]; then
    # Check if the handler is already defined elsewhere
    if grep -q "type AdminAgentHandler struct" service-agent/internal/handlers/*.go 2>/dev/null | grep -v "admin.go"; then
        echo "Found duplicate AdminAgentHandler definition..."
        echo "Removing admin.go to avoid conflicts..."
        rm service-agent/internal/handlers/admin.go
        echo "✅ Removed service-agent/internal/handlers/admin.go"
    fi
fi

echo ""
echo "6. Ensuring Customer model has required fields..."
echo "-----------------------------------"
# Add Name and Segment fields to Customer model if missing
if [ -f "service-customer/internal/models/customer.go" ]; then
    if ! grep -q "Name.*string" service-customer/internal/models/customer.go; then
        echo "Adding Name field to Customer model..."
        sed -i '/type Customer struct {/a\\tName        string    `json:"name" gorm:"type:varchar(100)"`' service-customer/internal/models/customer.go
    fi

    if ! grep -q "Segment.*string" service-customer/internal/models/customer.go; then
        echo "Adding Segment field to Customer model..."
        sed -i '/type Customer struct {/a\\tSegment     string    `json:"segment" gorm:"type:varchar(50);default:regular"`' service-customer/internal/models/customer.go
    fi
    echo "✅ Ensured Customer model has required fields"
fi

echo ""
echo "7. Cleaning up Go module cache..."
echo "-----------------------------------"
# Clean module cache to ensure fresh builds
for service in service-auth service-customer service-order service-inventory service-reporting service-agent service-catalog; do
    if [ -d "$service" ]; then
        echo "Cleaning $service..."
        cd /opt/kilang/$service
        go clean -modcache 2>/dev/null || true
        go mod tidy
        cd /opt/kilang
    fi
done
echo "✅ Module cache cleaned"

echo ""
echo "8. Rebuilding Docker images..."
echo "-----------------------------------"
cd /opt/kilang/infra-platform

# Stop the services
echo "Stopping services..."
docker-compose -f docker-compose.vps.yml down

# Rebuild with clean cache
echo "Rebuilding services..."
docker-compose -f docker-compose.vps.yml build --no-cache \
    service-auth \
    service-customer \
    service-order \
    service-inventory \
    service-reporting \
    service-agent \
    service-catalog

echo ""
echo "9. Starting services..."
echo "-----------------------------------"
docker-compose -f docker-compose.vps.yml up -d

echo ""
echo "10. Verifying services are running..."
echo "-----------------------------------"
sleep 10
docker ps | grep kilang

echo ""
echo "==================================================="
echo "✅ Conflict Resolution Complete!"
echo "==================================================="
echo ""
echo "Services should now be running without conflicts."
echo "You can check the logs with:"
echo "  docker logs kilang-auth -f"
echo "  docker logs kilang-customer -f"
echo "  docker logs kilang-order -f"
echo "  docker logs kilang-reporting -f"
echo ""
echo "Test the admin endpoints with:"
echo "  curl http://72.62.67.167/api/v1/admin/orders"
echo "  curl http://72.62.67.167/api/v1/reports/dashboard"