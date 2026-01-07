# Clean Architecture / DDD Findings Report

**Project:** KilangDesaMurniBatik E-Commerce Platform
**Analysis Date:** January 2026
**Services Analyzed:** 10 Microservices

---

## Summary of Violations Found

| Violation Type | Services Affected | Total Occurrences |
|----------------|-------------------|-------------------|
| GORM tags in domain models | 10/10 | 300+ tags |
| Anemic domain models | 10/10 | All models |
| Missing repository interfaces | 6/10 | 15+ repositories |
| Missing value objects | 10/10 | 20+ concepts |
| Business logic in wrong layer | 8/10 | 50+ methods |
| Missing aggregate boundaries | 7/10 | 10+ aggregates |

---

## Service-by-Service Findings

---

## 1. Service-Order (CRITICAL)

### 1.1 GORM Tags in Domain Models

**File:** `service-order/internal/models/order.go`
```go
// Lines 59-125: 60+ GORM tags polluting domain
type Order struct {
    ID              uuid.UUID      `gorm:"type:uuid;primary_key"`
    OrderNumber     string         `gorm:"uniqueIndex;not null"`
    CustomerID      uuid.UUID      `gorm:"type:uuid;index"`
    CustomerName    string         `gorm:"type:varchar(255)"`
    CustomerEmail   string         `gorm:"type:varchar(255)"`
    CustomerPhone   string         `gorm:"type:varchar(50)"`
    Status          string         `gorm:"type:varchar(20);index;default:'pending'"`
    PaymentStatus   string         `gorm:"type:varchar(20);default:'pending'"`
    PaymentMethod   string         `gorm:"type:varchar(50)"`
    Subtotal        float64        `gorm:"type:decimal(15,2)"`
    DiscountAmount  float64        `gorm:"type:decimal(15,2);default:0"`
    ShippingCost    float64        `gorm:"type:decimal(15,2);default:0"`
    TaxAmount       float64        `gorm:"type:decimal(15,2);default:0"`
    Total           float64        `gorm:"type:decimal(15,2)"`
    // ... 40+ more fields with GORM tags
}
```

**File:** `service-order/internal/models/cart.go`
```go
// Lines 11-22: GORM tags in Cart model
type Cart struct {
    ID         uuid.UUID  `gorm:"type:uuid;primary_key"`
    SessionID  string     `gorm:"type:varchar(255);index"`
    CustomerID *uuid.UUID `gorm:"type:uuid;index"`
    Items      []CartItem `gorm:"foreignKey:CartID"`
    // ...
}
```

**File:** `service-order/internal/models/payment.go`
```go
// Lines 23-36: GORM tags in Payment model
type Payment struct {
    ID            uuid.UUID `gorm:"type:uuid;primary_key"`
    OrderID       uuid.UUID `gorm:"type:uuid;index;not null"`
    Amount        float64   `gorm:"type:decimal(15,2);not null"`
    Currency      string    `gorm:"type:varchar(3);default:'MYR'"`
    Status        string    `gorm:"type:varchar(20);default:'pending'"`
    // ...
}
```

**File:** `service-order/internal/models/return.go`
```go
// Lines 50-107: 30+ GORM tags
type Return struct {
    ID              uuid.UUID `gorm:"type:uuid;primary_key"`
    ReturnNumber    string    `gorm:"uniqueIndex;not null"`
    OrderID         uuid.UUID `gorm:"type:uuid;index;not null"`
    CustomerID      uuid.UUID `gorm:"type:uuid;index;not null"`
    Status          string    `gorm:"type:varchar(20);default:'pending'"`
    // ...
}
```

### 1.2 Anemic Domain Models

**File:** `service-order/internal/models/order.go`
```go
// Lines 221-223: Only method is a simple check
func (o *Order) CanBeCancelled() bool {
    return o.Status == OrderStatusPending || o.Status == OrderStatusConfirmed
}
// MISSING: Rich behavior like:
// - o.Cancel(reason string) error
// - o.Confirm() error
// - o.TransitionTo(status) error
// - o.AddItem(item OrderItem) error
// - o.ApplyDiscount(discount Discount) error
```

**File:** `service-order/internal/models/return.go`
```go
// Lines 177-203: 6 CanBe* methods but no state machine
func (r *Return) CanBeApproved() bool { ... }
func (r *Return) CanBeRejected() bool { ... }
func (r *Return) CanBeReceived() bool { ... }
func (r *Return) CanBeRefunded() bool { ... }
func (r *Return) CanBeExchanged() bool { ... }
func (r *Return) CanBeCancelled() bool { ... }
// MISSING: State machine that enforces transitions
// - r.Approve(approvedBy string) error
// - r.Reject(reason string) error
```

### 1.3 Business Logic in Wrong Layer

**File:** `service-order/internal/models/order.go`
```go
// Lines 163-175: Database concerns in BeforeCreate hook
func (o *Order) BeforeCreate(tx *gorm.DB) error {
    if o.ID == uuid.Nil {
        o.ID = uuid.New()
    }
    if o.OrderNumber == "" {
        orderNum, err := generateOrderNumber(tx)
        // Database sequence logic in domain model
    }
    return nil
}

// Lines 179-182: Version increment in BeforeUpdate
func (o *Order) BeforeUpdate(tx *gorm.DB) error {
    o.Version++  // Should be in repository
    return nil
}

// Lines 188-203: Database sequence call in domain
func generateOrderNumber(tx *gorm.DB) (string, error) {
    var seqNum int64
    if err := tx.Raw("SELECT nextval('order_number_seq')").Scan(&seqNum).Error; err != nil {
        // Database access in domain layer!
    }
}
```

### 1.4 Missing Value Objects

| Concept | Current Type | Should Be |
|---------|-------------|-----------|
| Money (Total, Subtotal) | `float64` | `Money` value object |
| Order Status | `string` | `OrderStatus` with state machine |
| Payment Status | `string` | `PaymentStatus` with transitions |
| Order Number | `string` | `OrderNumber` value object |
| Shipping Address | 6 separate fields | `ShippingAddress` value object |
| Phone Number | `string` | `PhoneNumber` with validation |

### 1.5 Denormalized Data

**File:** `service-order/internal/models/return.go`
```go
// Lines 100-102: Denormalized order data
type Return struct {
    // ...
    OrderNumber   string  // Duplicated from Order
    CustomerName  string  // Duplicated from Order
    CustomerEmail string  // Duplicated from Order
    // Should fetch from Order aggregate instead
}
```

---

## 2. Service-Inventory (HIGH)

### 2.1 GORM Tags in Domain Models

**File:** `service-inventory/internal/models/stock.go`
```go
// 25+ GORM tags
type Stock struct {
    ID           uuid.UUID `gorm:"type:uuid;primary_key"`
    ProductID    uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
    SKU          string    `gorm:"type:varchar(100);index"`
    Quantity     int       `gorm:"not null;default:0"`
    Reserved     int       `gorm:"not null;default:0"`
    Available    int       `gorm:"not null;default:0"`
    LowStockAt   int       `gorm:"default:10"`
    Version      int64     `gorm:"default:1"`
    // ...
}
```

### 2.2 Missing Repository Interfaces

**File:** `service-inventory/internal/repository/stock_repository.go`
```go
// Current: Struct-based, no interface
type StockRepository struct {
    db *gorm.DB
}

// SHOULD BE:
type StockRepository interface {
    GetByProductID(ctx context.Context, productID uuid.UUID) (*Stock, error)
    UpdateQuantity(ctx context.Context, id uuid.UUID, qty int, version int64) error
    Reserve(ctx context.Context, id uuid.UUID, quantity int) error
}

type gormStockRepository struct {
    db *gorm.DB
}
```

### 2.3 Missing Domain Services

**Current:** Stock logic scattered in repository
**Should Have:**
```go
type StockDomainService interface {
    Reserve(ctx context.Context, productID uuid.UUID, quantity int) (*Reservation, error)
    Release(ctx context.Context, reservationID uuid.UUID) error
    Transfer(ctx context.Context, from, to WarehouseID, productID uuid.UUID, qty int) error
    CheckAvailability(ctx context.Context, items []OrderItem) ([]AvailabilityResult, error)
}
```

---

## 3. Service-Customer (HIGH)

### 3.1 No Repository Pattern

**Current State:** Direct DB access in handlers

**File:** `service-customer/internal/handlers/customer_handler.go`
```go
// Direct GORM calls in handler layer
func (h *CustomerHandler) GetCustomer(c *gin.Context) {
    var customer models.Customer
    if err := h.db.Where("id = ?", id).First(&customer).Error; err != nil {
        // Database access in handler!
    }
}
```

### 3.2 Missing Service Layer

**Current:** Handler → Database
**Should Be:** Handler → Service → Repository → Database

### 3.3 GORM Tags in Domain

**File:** `service-customer/internal/models/customer.go`
```go
// 20+ GORM tags
type Customer struct {
    ID           uuid.UUID `gorm:"type:uuid;primary_key"`
    Email        string    `gorm:"type:varchar(255);uniqueIndex;not null"`
    PasswordHash string    `gorm:"type:varchar(255)"`
    FirstName    string    `gorm:"type:varchar(100)"`
    LastName     string    `gorm:"type:varchar(100)"`
    Phone        string    `gorm:"type:varchar(50)"`
    // ...
}
```

### 3.4 Missing Value Objects

| Concept | Current | Should Be |
|---------|---------|-----------|
| Email | `string` | `Email` value object with validation |
| Phone | `string` | `PhoneNumber` value object |
| Full Name | `FirstName` + `LastName` | `PersonName` value object |
| Address | Multiple fields | `Address` value object |
| Body Measurements | Flat fields | `BodyMeasurement` value object |

---

## 4. Service-Catalog (MEDIUM)

### 4.1 GORM Tags in Domain Models

**File:** `service-catalog/internal/models/product.go`
```go
// 40+ GORM tags across Product and related models
type Product struct {
    ID              uuid.UUID  `gorm:"type:uuid;primary_key"`
    Name            string     `gorm:"type:varchar(255);not null"`
    Slug            string     `gorm:"type:varchar(255);uniqueIndex"`
    Description     string     `gorm:"type:text"`
    Price           float64    `gorm:"type:decimal(15,2);not null"`
    CompareAtPrice  *float64   `gorm:"type:decimal(15,2)"`
    CostPrice       *float64   `gorm:"type:decimal(15,2)"`
    // ...
}
```

### 4.2 Missing Aggregate Boundaries

**Current:** 20+ separate models with unclear boundaries
**Should Have:**
- Product Aggregate (Product, Variant, Image, SEO)
- Category Aggregate
- Collection Aggregate
- Discount Aggregate

### 4.3 Missing Value Objects

| Concept | Current | Should Be |
|---------|---------|-----------|
| Price | `float64` | `Price` value object |
| Slug | `string` | `Slug` value object with validation |
| SKU | `string` | `SKU` value object |
| Dimensions | Multiple fields | `Dimensions` value object |
| Weight | `float64` | `Weight` value object with unit |

---

## 5. Service-Support (MEDIUM)

### 5.1 Missing Repository Interfaces

**Files without interfaces:**
- `ticket_repository.go`
- `message_repository.go`
- `category_repository.go`

### 5.2 Missing Service Layer

**Current:** Handlers with business logic
**Should Have:**
```go
type TicketService interface {
    Create(ctx context.Context, req CreateTicketRequest) (*Ticket, error)
    Assign(ctx context.Context, ticketID, agentID uuid.UUID) error
    Escalate(ctx context.Context, ticketID uuid.UUID, reason string) error
    Resolve(ctx context.Context, ticketID uuid.UUID, resolution string) error
    Close(ctx context.Context, ticketID uuid.UUID) error
}

type SLAService interface {
    CalculateDueDate(priority TicketPriority) time.Time
    CheckBreaches(ctx context.Context) ([]Ticket, error)
}
```

### 5.3 Missing State Machine

**File:** `service-support/internal/models/ticket.go`
```go
// Status is just a string with no transition validation
type Ticket struct {
    Status string `gorm:"type:varchar(20)"`
    // MISSING: TicketStatus value object with:
    // - Valid transitions map
    // - CanTransitionTo(target) bool
    // - TransitionTo(target) error
}
```

---

## 6. Service-Agent (MEDIUM)

### 6.1 Missing Repository Interfaces

**Files without interfaces:**
- `agent_repository.go`
- `commission_repository.go`
- `payout_repository.go`
- `team_repository.go`

### 6.2 Commission Logic in Wrong Layer

**Current:** Commission calculation scattered
**Should Have:**
```go
// domain/commission/commission_calculator.go
type CommissionCalculator struct {
    rates CommissionRateRepository
}

func (c *CommissionCalculator) Calculate(order Order, agent Agent) (Commission, error) {
    rate := c.rates.GetForAgent(agent.ID)
    baseAmount := order.Total.Multiply(rate.Percentage)

    // Apply tier bonuses
    if agent.Tier == TierGold {
        baseAmount = baseAmount.Add(order.Total.Multiply(0.02))
    }

    return NewCommission(agent.ID, order.ID, baseAmount)
}
```

### 6.3 Missing Value Objects

| Concept | Current | Should Be |
|---------|---------|-----------|
| Commission Rate | `float64` | `CommissionRate` value object |
| Payout Amount | `float64` | `Money` value object |
| Agent Tier | `string` | `AgentTier` enum value object |

---

## 7. Service-Auth (LOW - Already Clean)

### 7.1 Minor Issues

**File:** `service-auth/internal/models/user.go`
```go
// GORM tags present but acceptable for this service
type User struct {
    ID           uuid.UUID `gorm:"type:uuid;primary_key"`
    Email        string    `gorm:"type:varchar(255);uniqueIndex;not null"`
    PasswordHash string    `gorm:"type:varchar(255)"`
    // ...
}
```

### 7.2 Recommendation

Add domain layer for User aggregate:
```go
// domain/user/user.go
type User struct {
    id       UserID
    email    Email
    password HashedPassword
    role     UserRole
    status   UserStatus
}

func (u *User) ChangePassword(current, new Password) error
func (u *User) Enable2FA(secret string) error
func (u *User) VerifyEmail() error
```

---

## 8. Service-Notification (LOW)

### 8.1 Event-Driven - Different Pattern

This service is primarily event-driven, so traditional DDD patterns apply differently.

### 8.2 Recommendations

Add notification preference domain:
```go
// domain/preference/notification_preference.go
type NotificationPreference struct {
    customerID CustomerID
    channels   []NotificationChannel
    templates  map[NotificationType]TemplateID
}

func (p *NotificationPreference) Enable(channel NotificationChannel) error
func (p *NotificationPreference) Disable(channel NotificationChannel) error
```

---

## 9. Service-Reporting (LOW)

### 9.1 Read-Only Service - CQRS Pattern

This service should follow CQRS read-side patterns, not traditional DDD.

### 9.2 Recommendations

```go
// query/sales_query.go
type SalesQueryService struct {
    db *sql.DB // Direct SQL for performance
}

func (s *SalesQueryService) GetSalesSummary(period DateRange) (*SalesSummary, error)
func (s *SalesQueryService) GetTopProducts(limit int) ([]ProductSales, error)
func (s *SalesQueryService) GetRevenueByCategory() ([]CategoryRevenue, error)
```

---

## 10. Service-Marketplace (LOW - Already Excellent)

### 10.1 Well-Structured

This service already follows good patterns:
- Clear aggregate boundaries (Seller, Listing, Order)
- Value objects for Status types
- Interface-based repositories

### 10.2 Minor Improvements

- Separate GORM models from domain models
- Add more explicit domain events

---

## Cross-Cutting Findings

### Missing Shared Value Objects (lib-common)

| Value Object | Used In | Description |
|--------------|---------|-------------|
| `Money` | All services | Decimal precision, currency, arithmetic |
| `Quantity` | order, inventory, catalog | Integer/decimal with unit |
| `Email` | auth, customer, order | Validation, normalization |
| `PhoneNumber` | customer, order | Format validation |
| `Address` | customer, order | Postal validation |
| `DateRange` | reporting, catalog | Start/end date pair |

### Missing Domain Error Types

```go
// lib-common/domain/errors.go
var (
    ErrNotFound              = errors.New("entity not found")
    ErrConflict              = errors.New("conflict with existing data")
    ErrValidation            = errors.New("validation failed")
    ErrConcurrentModification = errors.New("concurrent modification detected")
    ErrInsufficientStock     = errors.New("insufficient stock")
    ErrInvalidTransition     = errors.New("invalid state transition")
    ErrUnauthorized          = errors.New("unauthorized access")
)
```

### BeforeCreate/BeforeUpdate Hooks in Domain

**Services with DB hooks in domain models:**

| Service | File | Hook | Should Move To |
|---------|------|------|----------------|
| service-order | `order.go` | `BeforeCreate` | Repository |
| service-order | `order.go` | `BeforeUpdate` | Repository |
| service-order | `cart.go` | `BeforeCreate` | Repository |
| service-order | `payment.go` | `BeforeCreate` | Repository |
| service-order | `return.go` | `BeforeCreate` | Repository |
| service-inventory | `stock.go` | `BeforeCreate` | Repository |
| service-catalog | `product.go` | `BeforeCreate` | Repository |

---

## Violation Count by Service

| Service | GORM Tags | Anemic Models | Missing Interfaces | Missing VOs | Wrong Layer Logic |
|---------|-----------|---------------|-------------------|-------------|-------------------|
| service-order | 125+ | 5 models | Partial | 10+ | 8 methods |
| service-inventory | 40+ | 4 models | All | 5+ | 3 methods |
| service-customer | 35+ | 4 models | All | 8+ | 5 methods |
| service-catalog | 60+ | 6 models | Partial | 8+ | 4 methods |
| service-support | 25+ | 3 models | All | 4+ | 3 methods |
| service-agent | 30+ | 4 models | All | 5+ | 4 methods |
| service-auth | 15+ | 2 models | Has interfaces | 3+ | 1 method |
| service-notification | 10+ | 2 models | Has interfaces | 2+ | 0 methods |
| service-reporting | 5+ | 1 model | Partial | 2+ | 0 methods |
| service-marketplace | 20+ | 3 models | Has interfaces | 3+ | 1 method |

---

## Files Requiring Changes

### Phase 1: lib-common (3 new files)
- `lib-common/domain/money.go` - NEW
- `lib-common/domain/quantity.go` - NEW
- `lib-common/domain/errors.go` - NEW

### Phase 2: service-order (22 files)
- `internal/domain/order/order.go` - NEW
- `internal/domain/order/order_item.go` - NEW
- `internal/domain/order/order_status.go` - NEW
- `internal/domain/order/order_number.go` - NEW
- `internal/domain/order/events.go` - NEW
- `internal/domain/cart/cart.go` - NEW
- `internal/domain/cart/cart_item.go` - NEW
- `internal/domain/payment/payment.go` - NEW
- `internal/domain/payment/payment_status.go` - NEW
- `internal/domain/return/return.go` - NEW
- `internal/domain/return/return_status.go` - NEW
- `internal/domain/shared/money.go` - NEW
- `internal/domain/shared/address.go` - NEW
- `internal/infrastructure/persistence/order_model.go` - NEW
- `internal/infrastructure/persistence/order_repository.go` - NEW
- `internal/infrastructure/persistence/cart_model.go` - NEW
- `internal/infrastructure/persistence/cart_repository.go` - NEW
- `internal/models/order.go` - MODIFY (deprecate)
- `internal/models/cart.go` - MODIFY (deprecate)
- `internal/repository/order_repository.go` - MODIFY (move)
- `internal/services/order_service.go` - MODIFY
- `internal/services/order_validator.go` - MODIFY (move to domain)

### Phase 3-9: Other Services (61 files)
See detailed breakdown in refactoring plan.

---

## Summary

**Total Violations Found:** 500+
**Total Files Affected:** 83
**Estimated Lines of Code:** ~7,550 new/modified

**Priority Order:**
1. lib-common (Foundation)
2. service-order (Most complex, most violations)
3. service-inventory (Critical for stock management)
4. service-customer (Missing architecture entirely)
5. service-support (Business logic layer missing)
6. service-agent (Commission domain needed)
7. service-catalog (Complex product domain)
8. service-reporting (CQRS pattern)
9. Low-priority services (Minor improvements)
