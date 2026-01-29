# Day 95: Database Enhancement - Execution Guide

## 🎯 Overview

All migration files for **Day 95: Database Enhancement** have been created and are ready to execute. This guide walks through running the migration.

## 📁 Created Files

### Migration Files

- ✅ `migrations/20240115_batik_enhancement.sql` - Main migration (all schema changes)
- ✅ `seeds/batik_data.sql` - Sample data (designs, colors, services)

### Scripts

- ✅ `scripts/backup_database.bat` - Database backup (Windows)
- ✅ `scripts/backup_database.sh` - Database backup (Linux/Mac)
- ✅ `scripts/run_day95_enhancement.bat` - Master execution (Windows)
- ✅ `scripts/run_day95_enhancement.sh` - Master execution (Linux/Mac)

### Verification Scripts

- ✅ `scripts/verify_schema.sql` - Verify schema changes
- ✅ `scripts/verify_data.sql` - Verify sample data
- ✅ `scripts/test_decimal.sql` - Test decimal quantities
- ✅ `scripts/test_views.sql` - Test views functionality

---

## 🚀 Quick Start

### Prerequisites

1. **Start Docker Desktop**
2. **Start PostgreSQL container**:
   ```bash
   cd c:\Users\DesaMurniLuqman\Desktop\niaga-platform
   docker-compose up -d postgres
   ```

### Option 1: Automated Execution (Recommended)

**Windows:**

```bash
cd infra-database\scripts
run_day95_enhancement.bat
```

**Linux/Mac:**

```bash
cd infra-database/scripts
chmod +x run_day95_enhancement.sh
./run_day95_enhancement.sh
```

This single command will:

- ✅ Backup database
- ✅ Run migration (Tasks 2-12)
- ✅ Insert sample data (Task 13)
- ✅ Run all verification tests (Task 14)

### Option 2: Manual Step-by-Step

#### Step 1: Backup Database

```bash
cd infra-database\scripts
backup_database.bat
```

#### Step 2: Run Migration

```bash
cd infra-database
type migrations\20240115_batik_enhancement.sql | docker exec -i niaga-postgres psql -U niaga -d niaga
```

#### Step 3: Insert Sample Data

```bash
type seeds\batik_data.sql | docker exec -i niaga-postgres psql -U niaga -d niaga
```

#### Step 4: Verify Schema

```bash
cd scripts
type verify_schema.sql | docker exec -i niaga-postgres psql -U niaga -d niaga
```

#### Step 5: Verify Data

```bash
type verify_data.sql | docker exec -i niaga-postgres psql -U niaga -d niaga
```

#### Step 6: Test Decimal Quantities

```bash
type test_decimal.sql | docker exec -i niaga-postgres psql -U niaga -d niaga
```

#### Step 7: Test Views

```bash
type test_views.sql | docker exec -i niaga-postgres psql -U niaga -d niaga
```

---

## 📋 What Gets Changed

### New Tables (7 tables)

1. ✅ `catalog.fabric_designs` - Batik design catalog
2. ✅ `catalog.colors` - Color swatches
3. ✅ `catalog.product_colors` - Product-color relationships
4. ✅ `catalog.size_charts` - Size measurement charts
5. ✅ `catalog.tailoring_services` - Tailoring services
6. ✅ `catalog.tailoring_addons` - Service add-ons
7. ✅ `crm.customer_measurements` - Customer measurements

### Modified Tables (5 tables)

1. ✅ `catalog.products` - Added 9 new columns + 2 foreign keys
2. ✅ `catalog.product_variants` - Added 4 new columns
3. ✅ `inventory.stock_items` - Changed quantity to DECIMAL
4. ✅ `sales.cart_items` - Changed quantity to DECIMAL + 6 new columns
5. ✅ `sales.order_items` - Changed quantity to DECIMAL + 11 new columns

### New Views (2 views)

1. ✅ `catalog.v_products_full` - Complete product view
2. ✅ `inventory.v_fabric_availability` - Fabric stock view

### Sample Data

1. ✅ 5 fabric designs (Mega Mendung, Parang, Kawung, etc.)
2. ✅ 14 colors (Navy, Maroon, Green, Gold, etc.)
3. ✅ 2 size charts (Women's Baju Kurung, Men's Baju Melayu)
4. ✅ 6 tailoring services (RM60-120)
5. ✅ 5 tailoring add-ons (Lining, Embroidery, etc.)
6. ✅ 2 sample products (1 ready-made, 1 fabric)

---

## ✅ Day 95 Tasks Checklist

- [x] **Task 1:** Backup existing database
- [x] **Task 2:** Add new columns to `catalog.products`
  - [x] `product_type` (unit/fabric/bundle)
  - [x] `unit_type` (piece/meter)
  - [x] `min_order_qty`, `qty_increment`, `max_order_qty`
  - [x] `fabric_width`, `fabric_composition`
  - [x] `care_instructions`, `is_tailorable`
- [x] **Task 3:** Create `catalog.fabric_designs` table
- [x] **Task 4:** Create `catalog.colors` table
- [x] **Task 5:** Create `catalog.product_colors` table
- [x] **Task 6:** Create `catalog.size_charts` table
- [x] **Task 7:** Create `catalog.tailoring_services` table
- [x] **Task 8:** Create `catalog.tailoring_addons` table
- [x] **Task 9:** Create `crm.customer_measurements` table
- [x] **Task 10:** Modify `inventory.stock_items` quantity to DECIMAL
- [x] **Task 11:** Modify `sales.cart_items` for tailoring
- [x] **Task 12:** Modify `sales.order_items` for tailoring
- [x] **Task 13:** Insert sample data (colors, designs, services)
- [x] **Task 14:** Test database changes

**All 14 tasks are ready to execute!**

---

## 🔍 Verification Commands

After running the migration, verify everything is working:

### Check Table Counts

```sql
docker exec -i niaga-postgres psql -U niaga -d niaga -c "SELECT COUNT(*) FROM catalog.fabric_designs;"
docker exec -i niaga-postgres psql -U niaga -d niaga -c "SELECT COUNT(*) FROM catalog.colors;"
docker exec -i niaga-postgres psql -U niaga -d niaga -c "SELECT COUNT(*) FROM catalog.tailoring_services;"
```

### Check Column Types

```sql
docker exec -i niaga-postgres psql -U niaga -d niaga -c "\d inventory.stock_items"
docker exec -i niaga-postgres psql -U niaga -d niaga -c "\d sales.cart_items"
```

### Test Views

```sql
docker exec -i niaga-postgres psql -U niaga -d niaga -c "SELECT * FROM catalog.v_products_full LIMIT 1;"
docker exec -i niaga-postgres psql -U niaga -d niaga -c "SELECT * FROM inventory.v_fabric_availability LIMIT 1;"
```

---

## 🔄 Rollback (If Needed)

If something goes wrong, restore from backup:

```bash
# Find your backup file
dir infra-database\backups

# Restore (replace YYYYMMDD_HHMMSS with your backup timestamp)
docker exec -i niaga-postgres psql -U niaga -d niaga < infra-database\backups\niaga_backup_YYYYMMDD_HHMMSS.sql
```

---

## 📊 Expected Results

After successful execution:

| Item               | Expected Count |
| ------------------ | -------------- |
| Fabric Designs     | 5              |
| Colors             | 14             |
| Size Charts        | 2              |
| Tailoring Services | 6              |
| Tailoring Addons   | 5              |
| Sample Products    | 2              |

### data Type Changes

- `inventory.stock_items.quantity`: INT → DECIMAL(12,2)
- `sales.cart_items.quantity`: INT → DECIMAL(10,2)
- `sales.order_items.quantity`: INT → DECIMAL(10,2)

---

## 🎯 Next Steps (Day 96+)

After completing Day 95:

1. **Day 96:** Update backend services

   - Update Go models for new tables
   - Create API endpoints for colors, designs, tailoring
   - Update cart/order services for decimal quantities

2. **Day 97:** Create frontend components

   - MeterSelector, SizeSelector, ColorSelector
   - FabricSpecs, TailoringSteps components

3. **Day 98:** Build frontend pages

   - `/fabrics` - Fabric listing
   - `/products/[slug]` - Enhanced product pages
   - `/cart` - Support mixed items

4. **Day 99:** Tailoring flow

   - Measurement input
   - Service selection
   - Complete checkout

5. **Day 100:** Production deployment 🚀

---

## 📞 Support

If you encounter any issues:

1. Check Docker is running: `docker ps`
2. Check container logs: `docker logs niaga-postgres`
3. Verify backup exists: `dir infra-database\backups`
4. Review migration file: `migrations/20240115_batik_enhancement.sql`

---

## 🎉 Success Indicators

You'll know it worked when:

- ✅ All 7 new tables exist
- ✅ Products table has 11 new columns
- ✅ Quantity fields are DECIMAL
- ✅ 5+ fabric designs in database
- ✅ 14+ colors in database
- ✅ 6+ tailoring services available
- ✅ Views return data without errors
- ✅ Decimal quantities (1.5, 2.5) can be inserted

Good luck! 🚀
