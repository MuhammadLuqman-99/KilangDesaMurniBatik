#!/bin/bash
# Script to remove all localhost references and replace with production VPS URL

VPS_URL="http://72.62.67.167"

echo "========================================"
echo "Fixing all localhost references..."
echo "========================================"

# Function to replace localhost in a directory
fix_directory() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "Processing $dir..."

        # Find and replace in all relevant files
        find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "localhost" {} \; | while read file; do
            # Create backup
            cp "$file" "$file.bak"

            # Replace all localhost references
            sed -i "s|http://localhost:8080/api/v1|${VPS_URL}/api/v1|g" "$file"
            sed -i "s|http://localhost:8080|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8001|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8002|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8003|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8004|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8005|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8006|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8007|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:8008|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:9000|${VPS_URL}/storage|g" "$file"
            sed -i "s|http://localhost:3000|${VPS_URL}|g" "$file"
            sed -i "s|http://localhost:3001|${VPS_URL}/admin|g" "$file"
            sed -i "s|http://localhost:3002|${VPS_URL}/warehouse|g" "$file"

            # Check if file was modified
            if ! cmp -s "$file" "$file.bak"; then
                echo "  ✓ Updated: $(basename $file)"
                rm "$file.bak"
            else
                rm "$file.bak"
            fi
        done
    fi
}

# Process all frontend directories
fix_directory "frontend-admin"
fix_directory "frontend-storefront"
fix_directory "frontend-warehouse"
fix_directory "frontend-agent"

echo ""
echo "========================================"
echo "Completed fixing localhost references"
echo "========================================"