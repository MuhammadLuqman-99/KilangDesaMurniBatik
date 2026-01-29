# Architecture Refactoring Guide

**Project:** Kilang Desa Murni Batik
**Date:** 2026-01-20
**Status:** Future Improvements (Not Blocking Production)

---

## Overview

This document outlines architectural improvements identified during the DDD audit. These changes are **not urgent** but will improve maintainability, scalability, and data integrity as the system grows.

**Current Status:** Production system is stable with critical fixes applied (migration 032).

---

## 1. God Table: Split `orders` Table

### Current Problem

The `orders` table has **43 columns** handling multiple concerns:

```
public.orders (43 columns)
├── Core Order Data
│   ├── id, order_number, customer_id, status
│   ├── created_at, updated_at, deleted_at, version
│
├── Payment Data (should be separate)
│   ├── payment_status, payment_method_code
│   ├── subtotal, shipping_cost, discount, tax, total
│   └── total_amount (duplicate?)
│
├── Shipping Data (should be separate)
│   ├── shipping_address (JSONB), shipping_method
│   ├── tracking_number, estimated_weight
│   ├── courier_service_id, courier_name
│   └── estimated_ship_date
│
├── Customer Data (denormalized - should reference)
│   ├── customer_name, customer_email
│
├── Agent/Commission Data (should be separate)
│   ├── agent_id, agent_commission
│
├── Preorder Data (should be separate)
│   ├── is_preorder, preorder_lead_days, stock_type
│
├── Pickup Data (should be separate)
│   ├── scheduled_pickup_id, scheduled_pickup_date
│
├── Status Timestamps (10 different ones!)
│   ├── processed_at, shipped_at, delivered_at
│   ├── cancelled_at, refunded_at
│   └── cancellation_reason
│
└── Metadata
    ├── order_source, remarks, free_shipping
    └── customer_notes, admin_notes
```

### Why This Is a Problem

1. **Single Responsibility Violation** - One table doing too many things
2. **Lock Contention** - Updating shipping status locks payment data
3. **Hard to Maintain** - 43 columns is hard to understand
4. **Performance** - Reading order list loads unnecessary data

### Proposed Solution

Split into focused tables:

```sql
-- Core Order (Aggregate Root)
CREATE TABLE orders.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    order_source VARCHAR(30) DEFAULT 'website',
    customer_notes TEXT,
    admin_notes TEXT,
    remarks TEXT,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Payment Details (Owned by Order)
CREATE TABLE orders.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    payment_status VARCHAR(30) DEFAULT 'unpaid',
    payment_method_code VARCHAR(50),
    subtotal NUMERIC(12,2) DEFAULT 0,
    shipping_cost NUMERIC(10,2) DEFAULT 0,
    discount NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Details (Owned by Order)
CREATE TABLE orders.order_shipping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    shipping_address JSONB,
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    courier_service_id UUID,
    courier_name VARCHAR(100),
    estimated_weight NUMERIC(10,2) DEFAULT 0,
    estimated_ship_date TIMESTAMP,
    free_shipping BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fulfillment Timeline (Owned by Order)
CREATE TABLE orders.order_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    processed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

-- Agent Commission (Owned by Order)
CREATE TABLE orders.order_agent_commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    agent_id UUID,
    commission_amount NUMERIC(10,2) DEFAULT 0,
    commission_rate NUMERIC(5,2)
);

-- Preorder Details (Owned by Order, Optional)
CREATE TABLE orders.order_preorder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    is_preorder BOOLEAN DEFAULT FALSE,
    preorder_lead_days INTEGER DEFAULT 0,
    stock_type VARCHAR(30) DEFAULT 'ready_stock'
);

-- Pickup Details (Owned by Order, Optional)
CREATE TABLE orders.order_pickup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    scheduled_pickup_id UUID,
    scheduled_pickup_date TIMESTAMP
);
```

### Migration Strategy

1. **Phase 1:** Create new tables alongside existing
2. **Phase 2:** Create views that combine old + new for backward compatibility
3. **Phase 3:** Migrate services one by one to use new tables
4. **Phase 4:** Remove old columns after all services migrated

### Effort Estimate

| Task | Time |
|------|------|
| Create new tables | 1 day |
| Create compatibility views | 1 day |
| Update service-order | 2-3 days |
| Update frontend-admin | 1-2 days |
| Testing | 2 days |
| **Total** | **~1-2 weeks** |

---

## 2. Cross-Aggregate Foreign Keys

### Current Problem

Direct FK relationships between aggregates create tight coupling:

```
Current Architecture (Tight Coupling):
┌─────────────────┐     FK      ┌─────────────────┐
│ payment_receipts│────────────>│     orders      │
│   .order_id     │             │                 │
└─────────────────┘             └─────────────────┘
        │
        └── Problem: Payment aggregate depends on Order aggregate
            - Can't deploy payment service independently
            - Can't scale payment service independently
            - Order deletion affects payment records
```

### Affected Tables

| Table | FK Column | References | Issue |
|-------|-----------|------------|-------|
| `payments.payment_receipts` | `order_id` | `orders.id` | No FK, but direct reference |
| `public.stock_reservations` | `order_id` | `orders.id` | No FK, direct reference |
| `sales.agent_commissions` | `order_id` | `orders.id` | No FK, direct reference |
| `marketplace.orders` | `internal_order_id` | `orders.id` | No FK, direct reference |

### Proposed Solution: Event-Driven Architecture

```
Proposed Architecture (Loose Coupling):
┌─────────────────┐                    ┌─────────────────┐
│     Orders      │                    │    Payments     │
│   (Aggregate)   │                    │   (Aggregate)   │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ Publish Event                        │ Listen
         ▼                                      ▼
┌─────────────────────────────────────────────────────────┐
│                    outbox.events                         │
│  {aggregate_type: 'order', event_type: 'order.created'} │
└─────────────────────────────────────────────────────────┘
```

### Implementation Pattern

```go
// Instead of direct FK reference:
type PaymentReceipt struct {
    OrderID uuid.UUID `gorm:"type:uuid"` // Direct FK - BAD
}

// Use string reference with event sync:
type PaymentReceipt struct {
    OrderReference string    `gorm:"size:50"`  // Order number, not FK
    OrderID        uuid.UUID `gorm:"type:uuid"` // Cached, not FK constrained
}

// Order service publishes event:
func (s *OrderService) CreateOrder(order *Order) error {
    // Save order
    if err := s.repo.Save(order); err != nil {
        return err
    }

    // Publish event to outbox
    event := OutboxEvent{
        AggregateType: "order",
        AggregateID:   order.ID,
        EventType:     "order.created",
        Payload:       order.ToJSON(),
    }
    return s.outbox.Publish(event)
}

// Payment service listens:
func (s *PaymentService) OnOrderCreated(event OrderCreatedEvent) {
    // Store reference, not FK
    receipt := PaymentReceipt{
        OrderReference: event.OrderNumber,
        OrderID:        event.OrderID, // Cached, not FK
    }
    s.repo.Save(receipt)
}
```

### Benefits

1. **Independent Deployment** - Each service can deploy independently
2. **Independent Scaling** - Scale payment service without scaling orders
3. **Fault Isolation** - Payment failures don't affect orders
4. **Data Ownership** - Each service owns its data

### Effort Estimate

| Task | Time |
|------|------|
| Design event schemas | 2 days |
| Update outbox publisher | 2 days |
| Update payment service | 3 days |
| Update inventory service | 3 days |
| Update agent commission | 2 days |
| Testing | 3 days |
| **Total** | **~2-3 weeks** |

---

## 3. Shared Mutable State

### Current Problem

Multiple services write to the same tables:

```
inventory.stock_items is modified by:
┌──────────────────┐
│  service-order   │──┐
└──────────────────┘  │
┌──────────────────┐  │     ┌─────────────────────┐
│service-inventory │──┼────>│ inventory.stock_items│
└──────────────────┘  │     └─────────────────────┘
┌──────────────────┐  │
│ service-catalog  │──┤
└──────────────────┘  │
┌──────────────────┐  │
│   Flash Sales    │──┘
└──────────────────┘

Problems:
- Race conditions (mitigated by version field)
- No clear owner
- Hard to debug "who changed this?"
- Hard to maintain consistency
```

### Proposed Solution: Clear Data Ownership

```
Define Single Owner Per Table:
┌─────────────────────────────────────────────────────────────┐
│ Table                      │ Owner            │ Others      │
├─────────────────────────────────────────────────────────────┤
│ inventory.stock_items      │ service-inventory│ API/Events  │
│ inventory.warehouses       │ service-inventory│ Read-only   │
│ public.orders              │ service-order    │ API/Events  │
│ public.products            │ service-catalog  │ Read-only   │
│ auth.users                 │ service-auth     │ Read-only   │
│ payments.payment_receipts  │ service-payment  │ API only    │
└─────────────────────────────────────────────────────────────┘
```

### Implementation: API-Based Access

```go
// BAD: Direct DB write from order service
func (s *OrderService) ReserveStock(productID uuid.UUID, qty int) error {
    return s.db.Exec(`
        UPDATE inventory.stock_items
        SET reserved_quantity = reserved_quantity + ?
        WHERE product_id = ?
    `, qty, productID)
}

// GOOD: API call to inventory service
func (s *OrderService) ReserveStock(productID uuid.UUID, qty int) error {
    req := ReserveStockRequest{
        ProductID: productID,
        Quantity:  qty,
        OrderID:   s.currentOrderID,
    }
    return s.inventoryClient.ReserveStock(ctx, req)
}

// Or via events:
func (s *OrderService) ReserveStock(productID uuid.UUID, qty int) error {
    event := StockReservationRequested{
        ProductID: productID,
        Quantity:  qty,
        OrderID:   s.currentOrderID,
    }
    return s.outbox.Publish(event)
}
```

### Add Audit Column

```sql
-- Add to tables that need tracking
ALTER TABLE inventory.stock_items
ADD COLUMN modified_by_service VARCHAR(50),
ADD COLUMN modified_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger to auto-update
CREATE OR REPLACE FUNCTION track_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    -- Service should set modified_by_service before update
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Effort Estimate

| Task | Time |
|------|------|
| Define ownership matrix | 1 day |
| Create internal APIs | 1 week |
| Update service-order | 3 days |
| Update other services | 1 week |
| Add audit columns | 1 day |
| Testing | 3 days |
| **Total** | **~3 weeks** |

---

## 4. Store Snapshots for Historical Data

### Current Problem

Order items reference products by FK:

```sql
-- Current: order_items references product
CREATE TABLE order_items (
    product_id UUID REFERENCES products(id),  -- FK to current product
    unit_price NUMERIC(10,2)  -- Price at order time
);

-- Problem: If product is deleted or changed
-- - Product name in order shows current name, not name at purchase
-- - If product deleted, order_items.product_id becomes orphan
-- - Historical reports show wrong data
```

### Proposed Solution: Store Snapshots

```sql
-- Better: Store snapshot of product at order time
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,

    -- Reference (for linking, not data)
    product_id UUID,  -- No FK constraint!
    variant_id UUID,  -- No FK constraint!

    -- Snapshot (actual data at order time)
    product_snapshot JSONB NOT NULL,
    /*
    {
        "id": "uuid",
        "name": "Kain Batik Mega Mendung",
        "sku": "BTK-001",
        "price": 150.00,
        "image": "/images/btk-001.jpg",
        "category": "Kain Batik",
        "variant": {
            "id": "uuid",
            "name": "3 meter",
            "sku": "BTK-001-3M"
        }
    }
    */

    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,  -- From snapshot
    subtotal NUMERIC(12,2) NOT NULL
);
```

### Implementation

```go
// When creating order item, snapshot the product
func (s *OrderService) AddOrderItem(orderID, productID, variantID uuid.UUID, qty int) error {
    // Get current product data
    product, _ := s.catalogClient.GetProduct(productID)
    variant, _ := s.catalogClient.GetVariant(variantID)

    // Create snapshot
    snapshot := ProductSnapshot{
        ID:       product.ID,
        Name:     product.Name,
        SKU:      product.SKU,
        Price:    product.Price,
        Image:    product.Images[0],
        Category: product.Category.Name,
        Variant: &VariantSnapshot{
            ID:   variant.ID,
            Name: variant.Name,
            SKU:  variant.SKU,
        },
    }

    item := OrderItem{
        OrderID:         orderID,
        ProductID:       productID,  // Keep for reference
        VariantID:       variantID,
        ProductSnapshot: snapshot,
        Quantity:        qty,
        UnitPrice:       variant.Price,
        Subtotal:        variant.Price * float64(qty),
    }

    return s.repo.SaveOrderItem(item)
}
```

### Tables That Need Snapshots

| Table | Current FK | Should Snapshot |
|-------|------------|-----------------|
| `order_items` | `product_id`, `variant_id` | Product name, SKU, price, image |
| `flash_sale_purchases` | `variant_id` | Product name, original price |
| `agent_commissions` | `order_id` | Order total, commission rate |
| `discount_usage` | `discount_id` | Discount code, value, type |

### Effort Estimate

| Task | Time |
|------|------|
| Design snapshot schemas | 1 day |
| Update order_items | 2 days |
| Update flash_sale_purchases | 1 day |
| Update other tables | 2 days |
| Migrate existing data | 2 days |
| Testing | 2 days |
| **Total** | **~1.5 weeks** |

---

## 5. Implementation Roadmap

### Phase 1: Quick Wins (Optional, 1-2 days each)
- [ ] Add `modified_by_service` column to shared tables
- [ ] Add product snapshots to new orders (don't migrate old)
- [ ] Document data ownership matrix

### Phase 2: Medium Term (When Scaling)
- [ ] Split orders table into focused tables
- [ ] Implement internal service APIs
- [ ] Add snapshots to all historical tables

### Phase 3: Long Term (When Needed)
- [ ] Full event-driven architecture
- [ ] Remove cross-aggregate FKs
- [ ] Implement CQRS for complex queries

---

## Priority Matrix

| Improvement | Business Value | Technical Debt | Effort | Priority |
|------------|----------------|----------------|--------|----------|
| Split orders table | Medium | High | Medium | **P2** |
| Service APIs | High | High | High | **P2** |
| Product snapshots | High | Medium | Low | **P1** |
| Event-driven | High | High | Very High | **P3** |
| Audit columns | Low | Low | Low | **P3** |

---

## Notes

- **Current system is production-ready** with critical fixes applied
- These improvements are for **future scalability**
- Implement when you see **actual pain points** (slow queries, deployment issues)
- Each improvement can be done **independently**

---

*Document created as part of DDD audit. Review quarterly to reassess priorities.*
