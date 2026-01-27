# DDD Refactoring - Next Steps

## ✅ Completed

**148 files** across **11 services** have been refactored:

| Priority | Services | Files |
|----------|----------|-------|
| Core | lib-common | 6 |
| HIGH | service-order, service-inventory, service-catalog | 68 |
| MEDIUM | service-customer, service-support, service-agent | 65 |
| LOW | service-auth, service-notification, service-reporting, service-marketplace | 9 |

---

## 📋 Recommended Next Steps

### Phase 1: Integration (Priority: HIGH)

#### 1.1 Update Handlers to Use Domain Models
Refactor handlers to use the new domain layer instead of direct GORM models:

```go
// Before (handler)
var product models.Product
db.Where("id = ?", id).First(&product)

// After (handler → service → repository)
product, err := productRepo.GetByID(ctx, id)
```

**Files to update:**
- `service-catalog/internal/handlers/*.go`
- `service-order/internal/handlers/*.go`
- `service-inventory/internal/handlers/*.go`

#### 1.2 Implement Repository Interfaces
Create concrete GORM implementations for all repository interfaces defined in the domain layer.

---

### Phase 2: Testing (Priority: HIGH)

#### 2.1 Unit Tests for Domain Logic
Test value objects and aggregate behavior:

```bash
# Create test files
service-order/internal/domain/order/order_test.go
service-inventory/internal/domain/stock/stock_item_test.go
service-catalog/internal/domain/product/product_test.go
```

#### 2.2 Integration Tests
Test repository implementations with a test database.

---

### Phase 3: Cleanup (Priority: MEDIUM)

#### 3.1 Remove Deprecated Models
After handlers are migrated, safely remove the old `internal/models/*.go` files.

#### 3.2 Update Database Migrations
Ensure migrations align with the new domain model fields.

#### 3.3 Update API Documentation
Update OpenAPI/Swagger docs to reflect any API changes.

---

### Phase 4: Event Handling (Priority: MEDIUM)

#### 4.1 Implement Event Publishers
Publish domain events to message queue (RabbitMQ/Kafka):

```go
// Example
for _, event := range order.Events() {
    eventPublisher.Publish(ctx, event)
}
```

#### 4.2 Create Event Handlers
Handle cross-service events (e.g., OrderCreated → UpdateInventory).

---

### Phase 5: Optimization (Priority: LOW)

- [ ] Add caching for frequently accessed aggregates
- [ ] Implement read models for complex queries (CQRS)
- [ ] Add metrics and tracing for domain operations
- [ ] Performance testing for critical paths

---

## 📁 New Directory Structure

```
service-*/internal/
├── domain/
│   ├── shared/         # Value objects
│   ├── [aggregate]/    # Aggregate root + entities + events
│   └── ...
├── infrastructure/
│   └── persistence/    # GORM models + repositories
├── handlers/           # HTTP handlers (to be updated)
├── services/           # Application services (to be updated)
└── models/             # DEPRECATED - to be removed
```

---

## 🔗 Related Documentation

- [walkthrough.md](file:///C:/Users/desa%20murni/.gemini/antigravity/brain/528de85c-8b3e-4a61-a5a0-6b6cf0026d73/walkthrough.md) - Summary of all changes made
- [DDD_ARCHITECTURE_FINDINGS.md](file:///C:/Users/desa%20murni/Desktop/KilangDesaMurniBatik/DDD_ARCHITECTURE_FINDINGS.md) - Original findings (now resolved)
