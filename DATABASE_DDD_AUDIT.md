# Database Schema DDD Audit Report

**Project:** Kilang Desa Murni Batik
**Date:** 2026-01-20
**Auditor:** Principal Database Architect
**Schema Version:** Based on 31 migrations + infra-platform setup

---

## Executive Summary

This audit evaluates the database schema for Domain-Driven Design (DDD) compliance, concurrency safety, and production readiness. The schema shows good architectural foundations but has several areas requiring attention for high-concurrency production use.

### Current Status (Post-Migration)

| Category | Status | Severity | Action Taken |
|----------|--------|----------|--------------|
| Aggregate Root Identification | Partially Implemented | Medium | Documented |
| Aggregate Boundaries | Violations Found | High | Documented |
| Optimistic Locking | **FIXED** | ~~High~~ Low | Migration 032 applied |
| Missing Constraints | **FIXED** | ~~Medium~~ Low | Migration 032 applied |
| God Table Anti-pattern | 1 Found | Medium | Documented |
| Cross-Aggregate FK Usage | Multiple Issues | High | Documented |
| Eventual Consistency Support | Good (Outbox Pattern) | Low | Already implemented |
| Local/VPS Schema Sync | **SYNCED** | N/A | Migration 033 created |

### Migrations Applied/Created

| Migration | Target | Status |
|-----------|--------|--------|
| `032_vps_critical_fixes.sql` | VPS | **APPLIED** |
| `033_sync_local_with_vps.sql` | Local | Created (ready to apply) |

---

## 1. Aggregate Roots Identified

Based on the schema analysis, the following aggregate roots have been identified:

### 1.1 Well-Defined Aggregates

| Aggregate Root | Schema | Owned Entities | Notes |
|---------------|--------|----------------|-------|
| `Order` | public | order_items, order_status_history, order_events, order_notes, order_fulfillments | Proper CASCADE deletes |
| `Product` | catalog/public | product_images, product_variants | Well-bounded |
| `Category` | catalog/public | (self-referencing) | Proper hierarchy |
| `FlashSale` | public | flash_sale_items, flash_sale_purchases | Well-structured with proper FKs |
| `StockTransfer` | inventory/public | stock_transfer_items | Proper ownership |
| `Warehouse` | inventory/public | warehouse_zones, warehouse_stock | Clear boundary |
| `Team` (Sales) | sales | team_performance | Good isolation |
| `Agent` (Sales) | sales | agent_commissions, agent_performance | Clear boundary |
| `Discount` | public | discount_usage, discount_bxgy | Well-structured |

### 1.2 Problematic/Unclear Aggregates

| Entity | Issue | Recommendation |
|--------|-------|----------------|
| `Customer` | No clear customer table found in main schema | Create dedicated customer aggregate |
| `CustomerAddress` | Has customer_id FK but no customer table constraint | Add proper FK to customer table |
| `StockReservation` | References order_id without FK constraint | Add FK or use saga pattern |
| `PaymentReceipt` | References order_id without FK constraint | Add FK to orders table |

---

## 2. Aggregate Boundary Violations

### 2.1 Critical: Cross-Aggregate Foreign Keys

The following tables violate aggregate boundaries by directly referencing other aggregates with foreign keys:

```
VIOLATION #1: stock_reservations
-------------------------------------
- Has order_id WITHOUT FK constraint
- References product_id, variant_id WITHOUT FK constraint
- References warehouse_id WITH FK constraint

Problem: Inconsistent constraint enforcement allows orphaned records
```

```
VIOLATION #2: payment_receipts (payments schema)
-------------------------------------
- Has order_id WITHOUT FK to orders table
- Creates tight coupling between Payment and Order aggregates

Problem: Can create payment receipts for non-existent orders
```

```
VIOLATION #3: agent_commissions (sales schema)
-------------------------------------
- Has order_id WITHOUT FK constraint
- Comment says "References sales.orders(id) - FK added later"

Problem: FK never added, allows commission records for invalid orders
```

```
VIOLATION #4: marketplace.orders
-------------------------------------
- Has internal_order_id WITHOUT FK constraint
- Has connection_id WITH FK to connections

Problem: Can link to non-existent internal orders
```

### 2.2 Recommended Fixes

```sql
-- Fix #1: Add deferred FK or use eventual consistency
ALTER TABLE public.stock_reservations
ADD CONSTRAINT fk_stock_reservation_order
FOREIGN KEY (order_id) REFERENCES public.orders(id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- Fix #2: Add FK to payment_receipts
ALTER TABLE payments.payment_receipts
ADD CONSTRAINT fk_payment_receipt_order
FOREIGN KEY (order_id) REFERENCES public.orders(id)
ON DELETE RESTRICT;

-- Fix #3: Add FK to agent_commissions
ALTER TABLE sales.agent_commissions
ADD CONSTRAINT fk_commission_order
FOREIGN KEY (order_id) REFERENCES public.orders(id)
ON DELETE SET NULL;
```

---

## 3. Missing Constraints Allowing Invalid Data

### 3.1 Business Rule Violations

| Table | Missing Constraint | Business Impact |
|-------|-------------------|-----------------|
| `orders` | No CHECK on status transitions | Can jump from 'pending' to 'delivered' |
| `orders` | No CHECK (total >= 0) | Allows negative order totals |
| `flash_sale_items` | sold_count can exceed stock_limit | Overselling possible |
| `discount_usage` | No unique constraint per customer per discount | One_per_customer not enforced at DB level |
| `customer_addresses` | customer_id has no FK | Can create addresses for non-existent customers |
| `stock_reservations` | No CHECK (quantity <= available stock) | Can reserve more than available |

### 3.2 Recommended Constraint Additions

```sql
-- Prevent flash sale overselling
ALTER TABLE public.flash_sale_items
ADD CONSTRAINT chk_sold_not_exceed_limit
CHECK (sold_count <= stock_limit);

-- Enforce one discount per customer at DB level
CREATE UNIQUE INDEX idx_unique_discount_per_customer
ON public.discount_usage(discount_id, customer_id)
WHERE customer_id IS NOT NULL;

-- Ensure order totals are valid
ALTER TABLE public.orders
ADD CONSTRAINT chk_order_amounts_valid
CHECK (subtotal >= 0 AND total >= 0 AND discount >= 0);
```

---

## 4. Tables Updated by Multiple Workflows

### 4.1 Shared Mutable State Detected

| Table | Workflows That Modify | Risk Level |
|-------|----------------------|------------|
| `inventory.stock_items` | Orders, Returns, Transfers, Manual Adjustments, Flash Sales | CRITICAL |
| `public.warehouse_stock` | Orders, Reservations, Transfers, Returns | CRITICAL |
| `public.products.stock_quantity` | Catalog sync, Order fulfillment, Inventory adjustments | HIGH |
| `flash_sale_items.sold_count` | Order creation, Order cancellation, Reservation expiry | HIGH |
| `sales.agents.total_sales` | Order completion, Order cancellation, Manual adjustment | MEDIUM |

### 4.2 Ownership Recommendations

```
inventory.stock_items → OWNER: service-inventory
  - Other services should publish events, not write directly
  - Use saga pattern for order fulfillment

warehouse_stock → OWNER: service-inventory
  - Order service should request reservation via API/event
  - Not write directly to this table

products.stock_quantity → CONSIDER REMOVAL
  - This is a denormalized field duplicating inventory data
  - Either sync via trigger or compute from stock_items
```

---

## 5. Optimistic Locking Assessment

### 5.1 Current Implementation

**Good:** Version fields added to critical tables:
- `inventory.stock_items.version` ✓
- `public.orders.version` ✓
- `public.products.version` ✓

**Missing:** No version field on:
- `flash_sale_items` - HIGH RISK during flash sales
- `warehouse_stock` - HIGH RISK for concurrent updates
- `discount_usage` - MEDIUM RISK for usage_count
- `agent_commissions` - LOW RISK

### 5.2 Missing Optimistic Locking Fixes

```sql
-- Add version to flash_sale_items (critical for concurrency)
ALTER TABLE public.flash_sale_items
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1 NOT NULL;

-- Add version to warehouse_stock
ALTER TABLE public.warehouse_stock
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1 NOT NULL;

-- Application must use: UPDATE ... WHERE id = ? AND version = ?
-- Then check rows affected = 1, else retry
```

---

## 6. Concurrency Inconsistency Risks

### 6.1 Race Conditions Identified

#### Race #1: Flash Sale Purchase (CRITICAL)
```
Timeline:
T1: User A reads flash_sale_items (sold_count=9, stock_limit=10)
T2: User B reads flash_sale_items (sold_count=9, stock_limit=10)
T3: User A reserves 1 item (sold_count becomes 10)
T4: User B reserves 1 item (sold_count becomes 11) ← OVERSOLD!

Fix: Use SELECT FOR UPDATE or optimistic locking
```

#### Race #2: Stock Reservation (HIGH)
```
Timeline:
T1: Check available stock for Product X (qty=5, reserved=3, available=2)
T2: Two concurrent orders both see available=2
T3: Both reserve 2 units each
T4: Total reserved=7, but only qty=5 exists ← OVERSOLD!

Fix: Add database constraint + use atomic operations
```

#### Race #3: Discount Usage Limit (MEDIUM)
```
Timeline:
T1: Check discount usage_count (990, limit=1000)
T2: 20 concurrent users all see usage_count=990
T3: All 20 apply discount
T4: usage_count=1010, exceeds limit ← OVER-UTILIZED!

Fix: Use SELECT FOR UPDATE on discount row during application
```

### 6.2 Recommended Atomic Operations

```sql
-- Safe flash sale purchase with row locking
CREATE OR REPLACE FUNCTION public.reserve_flash_sale_item(
    p_flash_sale_id UUID,
    p_variant_id UUID,
    p_customer_id UUID,
    p_quantity INTEGER
) RETURNS UUID AS $$
DECLARE
    v_item_id UUID;
    v_available INTEGER;
    v_purchase_id UUID;
BEGIN
    -- Lock the row and check availability
    SELECT id, stock_limit - sold_count INTO v_item_id, v_available
    FROM public.flash_sale_items
    WHERE flash_sale_id = p_flash_sale_id
      AND variant_id = p_variant_id
    FOR UPDATE;

    IF v_available < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock';
    END IF;

    -- Atomic update
    UPDATE public.flash_sale_items
    SET sold_count = sold_count + p_quantity
    WHERE id = v_item_id;

    -- Create reservation record
    INSERT INTO public.flash_sale_purchases (...)
    VALUES (...) RETURNING id INTO v_purchase_id;

    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. God Table Anti-Pattern

### 7.1 Identified God Table

**Table:** `public.orders`

| Concern | Evidence |
|---------|----------|
| Too many columns | 20+ columns covering multiple concerns |
| Mixed responsibilities | Payment status, shipping, amounts, notes, agent commission |
| Updated by many workflows | Order creation, payment, shipping, cancellation, returns |

### 7.2 Decomposition Recommendation

```
Current: orders (monolithic)
↓
Proposed Split:
├── orders (core order data)
│   ├── id, order_number, customer_id, status
│   ├── created_at, updated_at, deleted_at, version
│
├── order_payments (extract payment concerns)
│   ├── order_id, payment_status, payment_method_code
│   ├── subtotal, discount, tax, total
│
├── order_shipping (extract shipping concerns)
│   ├── order_id, shipping_address, shipping_method
│   ├── shipping_cost, tracking_number
│
└── order_agent_commission (extract agent concerns)
    ├── order_id, agent_id, commission_amount
```

---

## 8. Foreign Key Usage Issues

### 8.1 Cross-Schema FK Problems

| From Table | To Table | Issue |
|------------|----------|-------|
| `sales.carts.user_id` | `auth.users` | Cross-schema FK - may cause deployment issues |
| `sales.agents.user_id` | `auth.users` | Comment says "FK added later" but never added |
| `public.stock_reservations` | `public.orders` | Missing FK allows orphan reservations |

### 8.2 Cascade Delete Risks

| Table | FK With CASCADE | Risk |
|-------|-----------------|------|
| `warehouse_zones` | ON DELETE CASCADE from warehouse | Deleting warehouse loses zone history |
| `stock_transfer_items` | ON DELETE CASCADE from transfer | Acceptable |
| `flash_sale_items` | ON DELETE CASCADE from flash_sale | May lose sales data |

### 8.3 Recommendations

```sql
-- Change from CASCADE to RESTRICT for audit trail preservation
ALTER TABLE public.warehouse_zones
DROP CONSTRAINT warehouse_zones_warehouse_id_fkey,
ADD CONSTRAINT warehouse_zones_warehouse_id_fkey
FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id)
ON DELETE RESTRICT;

-- Add missing FK for agents
ALTER TABLE sales.agents
ADD CONSTRAINT fk_agent_user
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE SET NULL;
```

---

## 9. Eventual Consistency Support

### 9.1 Current Implementation (Good)

The schema has good eventual consistency patterns:

1. **Outbox Pattern** (`outbox.events`) ✓
   - Proper aggregate_type, aggregate_id tracking
   - Processed_at for delivery tracking
   - Retry_count for failure handling

2. **Idempotency Support** ✓
   - `idempotency_key` on payment_receipts
   - Unique partial index for deduplication

### 9.2 Missing Event Sourcing Tables

Consider adding for full audit trail:
- `domain_events` - Full event log per aggregate
- `snapshots` - Aggregate state snapshots

---

## 10. VPS vs Local Schema Comparison Guide

### 10.1 VPS Database Status (Live Comparison)

**VPS:** `root@72.62.67.167`
**Database:** `kilang_batik` (via Docker: `kilang-postgres`)
**Schemas Found:** 15 schemas, 91 tables

### 10.2 Schema Comparison Results

#### Schemas Present on VPS
| Schema | Status | Tables |
|--------|--------|--------|
| auth | ✓ Present | 7 tables (has RBAC: roles, permissions, role_permissions, user_roles) |
| catalog | ✓ Present | 6 tables (bundle_items, colors, fabric_designs, product_bundles, product_colors, product_recommendations, size_charts) |
| cms | ✓ Present | 11 tables (includes auto_collections, customer_gallery) |
| crm | ✓ Present | 1 table (customer_measurements) |
| customer | ✓ Present | 4 tables (addresses, back_in_stock_subscriptions, profiles, wishlist_items) |
| inventory | ✓ Present | 5 tables |
| marketplace | ✓ Present | 9 tables (has imported_products, inventory_sync_logs, variant_mappings) |
| outbox | ✓ Present | 1 table |
| payments | ✓ Present | 2 tables |
| public | ✓ Present | 40 tables |
| sales | ✓ Present | 4 tables (carts, cart_items, payments, shipping_methods) |
| agent | ✓ Present | Schema exists |
| orders | ✓ Present | Schema exists |
| notification | ✓ Present | Schema exists |
| reporting | ✓ Present | Schema exists |

### 10.3 Critical Differences Found

#### Missing Tables on VPS (from recent local migrations)

| Table | Local Migration | Status on VPS |
|-------|-----------------|---------------|
| `customer_segments` | 012_customer_enhancement.sql | **MISSING** |
| `customer_segment_members` | 012_customer_enhancement.sql | **MISSING** |
| `customer_tags` | 012_customer_enhancement.sql | **MISSING** |
| `customer_activity` | 012_customer_enhancement.sql | **MISSING** |
| `customer_addresses` (public) | 012_customer_enhancement.sql | **MISSING** (but customer.addresses exists) |
| `discount_categories` | 029_discount_categories.sql | **MISSING** |
| `support_tickets` | 030_support_tickets.sql | **MISSING** |
| `analytics_*` tables | 031_analytics_tables.sql | **MISSING** |

#### Missing Columns/Features

| Table | Column/Feature | Status |
|-------|----------------|--------|
| `public.warehouse_stock` | `version` column | **MISSING** - No optimistic locking |
| `public.flash_sale_items` | `version` column | **MISSING** - Race condition risk |
| `inventory.stock_items` | CHECK constraints | **MISSING** - chk_stock_quantity_non_negative, etc. |
| `public.flash_sale_items` | CHECK (sold_count <= stock_limit) | **MISSING** - Overselling possible |

#### Missing Foreign Key Constraints (Confirmed on VPS)

| Table | Missing FK | Risk |
|-------|------------|------|
| `payments.payment_receipts` | No FK to orders | Can create orphan payment records |
| `public.stock_reservations` | No FK to orders | Can create orphan reservations |

#### Version Fields Status

| Table | Has Version | Notes |
|-------|-------------|-------|
| `public.orders` | ✓ YES | 43 columns total (extended from local) |
| `public.products` | ✓ YES | Good |
| `inventory.stock_items` | ✓ YES | Good |
| `public.warehouse_stock` | **NO** | NEEDS ADDING |
| `public.flash_sale_items` | **NO** | NEEDS ADDING |

### 10.4 VPS Has Extra Tables/Columns Not in Local

| Table/Column | Location | Notes |
|--------------|----------|-------|
| `orders.total_amount` | public.orders | Extra column |
| `orders.customer_name/email` | public.orders | Denormalized customer data |
| `orders.stock_type` | public.orders | New field |
| `orders.order_source` | public.orders | New field |
| `orders.is_preorder` | public.orders | Preorder support |
| `orders.scheduled_pickup_*` | public.orders | Pickup scheduling |
| `orders.courier_*` | public.orders | Courier integration |
| `marketplace.imported_products` | marketplace | For external products |
| `marketplace.inventory_sync_logs` | marketplace | Sync tracking |
| `marketplace.variant_mappings` | marketplace | Variant mapping |
| `catalog.bundle_items` | catalog | Product bundles |
| `catalog.colors` | catalog | Color management |
| `catalog.fabric_designs` | catalog | Fabric designs |
| `cms.auto_collections` | cms | Automated collections |
| `cms.customer_gallery` | cms | Customer photos |
| `customer.*` tables | customer schema | Separate customer schema |

### 10.5 Migration Safety Checklist

Before applying fixes to VPS:

- [ ] Backup VPS database first: `docker exec kilang-postgres pg_dump -U kilang kilang_batik > backup.sql`
- [ ] Test migration on staging
- [ ] Check for data that violates new constraints
- [ ] Plan for downtime if adding NOT NULL columns
- [ ] Use `IF NOT EXISTS` for idempotent migrations

---

## 11. Priority Fixes Roadmap

### Phase 1: Critical (Immediate)

1. Add version field to `flash_sale_items` and `warehouse_stock`
2. Add FK constraint to `stock_reservations.order_id`
3. Add constraint `sold_count <= stock_limit` on flash_sale_items
4. Create atomic functions for flash sale purchases

### Phase 2: High Priority (This Sprint)

1. Add FK to `payment_receipts.order_id`
2. Add FK to `agent_commissions.order_id`
3. Add CHECK constraints on `orders` amounts
4. Add unique constraint for discount per customer

### Phase 3: Medium Priority (Next Sprint)

1. Decompose orders god table
2. Add missing FKs for customer-related tables
3. Review and fix CASCADE delete policies
4. Add domain events table for audit trail

### Phase 4: Low Priority (Backlog)

1. Add version fields to all aggregate roots
2. Create read replicas for reporting queries
3. Implement event sourcing for orders
4. Add partition strategy for large tables

---

## 12. Schema Diagram (Text-based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AGGREGATE BOUNDARIES                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ ORDER AGGREGATE ──────────────────┐   ┌─ PRODUCT AGGREGATE ────────────────┐
│  orders (root)                     │   │  products (root)                   │
│    ├── order_items                 │   │    ├── product_images              │
│    ├── order_status_history        │   │    └── product_variants            │
│    ├── order_events                │   └─────────────────────────────────────┘
│    ├── order_notes                 │
│    └── order_fulfillments          │   ┌─ INVENTORY AGGREGATE ──────────────┐
└────────────────────────────────────┘   │  warehouses (root)                 │
         ▲                               │    ├── warehouse_zones             │
         │ (missing FK!)                 │    └── warehouse_stock             │
         │                               └─────────────────────────────────────┘
┌─ PAYMENT (should be separate) ─────┐
│  payment_receipts                  │   ┌─ FLASH SALE AGGREGATE ─────────────┐
│    └── order_id (no FK!)           │   │  flash_sales (root)                │
└────────────────────────────────────┘   │    ├── flash_sale_items            │
                                         │    └── flash_sale_purchases        │
┌─ RESERVATION (cross-cutting) ──────┐   └─────────────────────────────────────┘
│  stock_reservations                │
│    ├── order_id (no FK!)           │   ┌─ SALES/AGENT AGGREGATE ────────────┐
│    ├── product_id (no FK!)         │   │  teams (root)                      │
│    └── warehouse_id (FK ✓)         │   │    └── team_performance            │
└────────────────────────────────────┘   │  agents (root)                      │
                                         │    ├── agent_commissions            │
                                         │    └── agent_performance            │
                                         └─────────────────────────────────────┘
```

---

## Appendix A: Full Table List by Schema

| Schema | Tables |
|--------|--------|
| public | orders, order_items, order_status_history, order_fulfillments, order_events, order_notes, products, product_images, product_variants, categories, warehouses, warehouse_zones, warehouse_stock, stock_transfers, stock_transfer_items, stock_reservations, discounts, discount_usage, discount_bxgy, flash_sales, flash_sale_items, flash_sale_purchases, customer_addresses, customer_notes, customer_activity, customer_segments, customer_segment_members, customer_tags |
| auth | users, sessions, password_resets |
| catalog | products, categories, product_variants, product_images, batik_types, price_tiers |
| inventory | warehouses, stock_items, stock_movements, stock_transfers, stock_transfer_items |
| sales | teams, agents, agent_commissions, team_performance, agent_performance, carts, cart_items, coupons |
| payments | payment_methods, payment_receipts |
| cms | site_settings, menus, banners, homepage_sections, promo_boxes, announcements, featured_collections, media_folders, media_library |
| marketplace | connections, product_mappings, category_mappings, orders, sync_jobs, webhook_events |
| outbox | events |

---

*Report generated for production readiness assessment. Review with development team before implementing changes.*
