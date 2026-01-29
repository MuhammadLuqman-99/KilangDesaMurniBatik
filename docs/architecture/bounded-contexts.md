# Bounded Contexts - Kilang Desa Murni Batik Platform

This document describes the Domain-Driven Design (DDD) bounded contexts within the Kilang Desa Murni Batik e-commerce platform.

## Overview

The platform is divided into distinct bounded contexts, each responsible for a specific business domain. These contexts communicate through well-defined interfaces and events.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Kilang Platform                             │
├───────────────┬───────────────┬───────────────┬───────────────────┤
│  Inventory    │    Order      │    Agent      │   Marketplace     │
│   Context     │   Context     │   Context     │    Context        │
├───────────────┼───────────────┼───────────────┼───────────────────┤
│  • Products   │  • Orders     │  • Agents     │  • Listings       │
│  • Stock      │  • Payments   │  • Commissions│  • Storefronts    │
│  • Categories │  • Shipping   │  • Payouts    │  • Analytics      │
│  • Suppliers  │  • Tracking   │  • Teams      │  • Reviews        │
└───────────────┴───────────────┴───────────────┴───────────────────┘
                              ↕ Events ↕
┌─────────────────────────────────────────────────────────────────────┐
│                    Shared Infrastructure                            │
│  • Event Store  • Message Bus (NATS)  • Auth Service  • Telemetry   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Inventory Context (service-inventory)

### Purpose
Manages product catalog, stock levels, and inventory operations.

### Aggregate Roots
- **Product** - Core entity representing items for sale
- **StockItem** - Tracks quantity and location of products
- **Category** - Product categorization hierarchy

### Entities
- ProductVariant (size, color variations)
- Supplier
- WarehouseLocation

### Value Objects
- SKU (Stock Keeping Unit)
- Price
- Dimensions
- Weight

### Domain Events
```
inventory.product.created
inventory.product.updated
inventory.product.discontinued
inventory.stock.reserved
inventory.stock.released
inventory.stock.depleted
inventory.stock.replenished
```

### Ubiquitous Language
| Term | Definition |
|------|------------|
| SKU | Unique identifier for a product variant |
| Reserved Stock | Stock allocated to pending orders |
| Available Stock | Stock ready for new orders |
| Reorder Point | Minimum stock level triggering replenishment |

---

## 2. Order Context (service-order)

### Purpose
Manages the complete order lifecycle from creation to fulfillment.

### Aggregate Roots
- **Order** - The main order aggregate
- **Shipment** - Manages delivery and tracking

### Entities
- OrderItem
- PaymentTransaction
- ShippingAddress
- TrackingEvent

### Value Objects
- OrderNumber
- Money
- ShippingMethod
- TrackingNumber

### Domain Events
```
order.created
order.confirmed
order.paid
order.shipped
order.delivered
order.cancelled
order.refunded
payment.received
payment.failed
shipment.created
shipment.tracking_updated
```

### Ubiquitous Language
| Term | Definition |
|------|------------|
| Order | Customer purchase request with items |
| Fulfillment | Process of preparing and shipping order |
| COD | Cash on Delivery payment method |
| AWB | Air Waybill - shipping tracking number |

### Integrations
- **SF Express** (ABX): International shipping via API
- **PosLaju**: Local Malaysian delivery
- **Payment Gateways**: Multiple payment providers

---

## 3. Agent Context (service-agent)

### Purpose
Manages sales agents, their commissions, and performance tracking.

### Aggregate Roots
- **Agent** - Sales representative
- **Commission** - Earned sales incentive
- **Payout** - Agent payment disbursement

### Entities
- Team (group of agents)
- CategoryCommission (per-category rates)
- Performance (monthly metrics)

### Value Objects
- AgentCode
- CommissionRate
- AgentTier (Bronze, Silver, Gold, Platinum)
- AgentStatus (Active, Suspended, Inactive)
- CommissionStatus (Pending, Approved, Paid, Cancelled)
- PayoutStatus (Pending, Processing, Completed, Failed)

### Domain Events
```
agent.created
agent.status_changed
agent.promoted
agent.team_assigned
commission.created
commission.approved
commission.paid
commission.cancelled
payout.created
payout.completed
payout.failed
```

### Ubiquitous Language
| Term | Definition |
|------|------------|
| Agent | Sales representative earning commissions |
| Commission | Percentage of sale earned by agent |
| Tier | Agent ranking based on performance |
| Payout | Scheduled disbursement to agent |

### Business Rules
- Agents must be active to earn commissions
- Commissions require approval before payout
- Tier upgrades based on total sales volume
- Commission rates vary by product category

---

## 4. Marketplace Context (service-marketplace)

### Purpose
Manages marketplace listings, storefronts, and analytics.

### Aggregate Roots
- **Listing** - Product listing on marketplace
- **Storefront** - Merchant shop on platform
- **Review** - Customer product reviews

### Entities
- ListingVariant
- Analytics
- Promotion

### Value Objects
- ListingStatus
- Rating
- AnalyticsPeriod

### Domain Events
```
marketplace.listing.created
marketplace.listing.published
marketplace.listing.sold
marketplace.storefront.created
marketplace.review.submitted
marketplace.analytics.updated
```

### Ubiquitous Language
| Term | Definition |
|------|------------|
| Listing | Product offered for sale on marketplace |
| Storefront | Merchant's virtual shop |
| Featured | Promoted listing with higher visibility |

---

## Context Mapping

### Relationships Between Contexts

```
┌─────────────┐     Customer/Supplier      ┌─────────────┐
│  Inventory  │◄────────────────────────────│    Order    │
│   Context   │  (Stock reservation,        │   Context   │
│             │   product validation)       │             │
└─────────────┘                            └─────────────┘
       ▲                                          │
       │ Conformist                               │ Published
       │ (Uses inventory                          │ Language
       │  product data)                           ▼
┌─────────────┐                            ┌─────────────┐
│ Marketplace │                            │    Agent    │
│   Context   │────────Shared Kernel───────│   Context   │
│             │  (Agent attribution,       │             │
└─────────────┘   commission calculation)  └─────────────┘
```

### Integration Patterns

1. **Inventory → Order (Customer/Supplier)**
   - Order context consumes inventory data
   - Stock reservation via synchronous API
   - Stock events published for eventual consistency

2. **Order → Agent (Published Language)**
   - Order events trigger commission calculation
   - Agent ID passed with order for attribution
   - Commission created on order completion

3. **Marketplace → Inventory (Conformist)**
   - Marketplace adopts inventory's product model
   - Real-time stock sync via events
   - No modification of inventory domain

4. **Agent ↔ Marketplace (Shared Kernel)**
   - Agent attribution shared between contexts
   - Commission rates used by both
   - Shared agent identity model

---

## Anti-Corruption Layers

### External System Integration

```
┌──────────────────────────────────────────────────────────────┐
│                     Order Context                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                Anti-Corruption Layer                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  SF Express  │  │   PosLaju    │  │   Payment   │  │  │
│  │  │   Adapter    │  │   Adapter    │  │   Adapter   │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Domain Model (Order, Shipment)            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Event Flow Examples

### Order Completion Flow

```
1. Customer places order
   └─► order.created (Order Context)
        └─► inventory.stock.reserved (Inventory Context)

2. Payment received
   └─► payment.received (Order Context)
        └─► order.confirmed (Order Context)

3. Order shipped
   └─► order.shipped (Order Context)
        └─► commission.created (Agent Context)

4. Order delivered
   └─► order.delivered (Order Context)
        └─► commission.approved (Agent Context - if auto-approve)
```

### Agent Commission Flow

```
1. Sale attributed to agent
   └─► commission.created
        ├─► Calculate rate based on product category
        └─► Apply tier bonus

2. Admin approves commission
   └─► commission.approved
        └─► Update agent total_earned

3. Payout scheduled
   └─► payout.created
        └─► Mark commissions as "paid"

4. Payout completed
   └─► payout.completed
        └─► Notify agent
```

---

## Glossary

| Term | Context | Definition |
|------|---------|------------|
| Aggregate | All | Cluster of entities treated as a single unit |
| Bounded Context | All | Logical boundary for a domain model |
| Domain Event | All | Record of something that happened in the domain |
| Value Object | All | Immutable object defined by its attributes |
| Entity | All | Object with unique identity that persists over time |
| Ubiquitous Language | All | Shared vocabulary between developers and domain experts |
| Anti-Corruption Layer | All | Adapter protecting domain from external system changes |
| Event Sourcing | All | Storing state changes as sequence of events |
| CQRS | All | Command Query Responsibility Segregation |

---

## Implementation Status

| Context | Status | Clean Architecture | Event Sourcing |
|---------|--------|-------------------|----------------|
| Inventory | ✅ Implemented | Partial | Planned |
| Order | ✅ Implemented | Legacy | Planned |
| Agent | ✅ Implemented | ✅ Complete | Ready |
| Marketplace | ✅ Implemented | Partial | Planned |

---

## Future Considerations

1. **Customer Context** - Extract customer management from Order context
2. **Analytics Context** - Dedicated business intelligence domain
3. **Notification Context** - Centralized messaging and alerts
4. **Promotion Context** - Discounts, coupons, and campaigns

---

*Last Updated: January 2026*
