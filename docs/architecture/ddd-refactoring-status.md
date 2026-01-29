# DDD Refactoring Status

**Last Updated:** January 2026

---

## Summary

| Phase | Status | Domain Files | Infrastructure Files |
|-------|--------|--------------|---------------------|
| Phase 1: lib-common | ✅ DONE | 3 + 3 tests | - |
| Phase 2: service-order | ✅ DONE | 19 files | 4 files |
| Phase 3: service-inventory | ✅ DONE | 12 files | 5 files |
| Phase 4: service-customer | ✅ DONE | 14 files | 6 files |
| Phase 5: service-support | ✅ DONE | 10 files | 5 files |
| Phase 6: service-agent | ✅ DONE | 13 files | 4 files |
| Phase 7: service-catalog | ✅ DONE | 15 files | 5 files |
| Phase 8: service-reporting | ✅ DONE | 2 files | - |
| Phase 9: service-auth | ✅ DONE | 3 files | - |
| Phase 9: service-notification | ✅ DONE | 2 files | - |
| Phase 9: service-marketplace | ✅ DONE | 2 files | - |

**Total Created: 95 domain files + 29 infrastructure files = 124 new files**

---

## What's Complete

### lib-common/domain/
- ✅ `money.go` - Money value object with MYR currency
- ✅ `quantity.go` - Quantity value object (pieces/meters)
- ✅ `errors.go` - Domain error types
- ✅ Tests for all value objects

### service-order/internal/domain/
- ✅ `order/` - Order aggregate (order.go, order_item.go, order_status.go, order_number.go, events.go, validator.go)
- ✅ `cart/` - Cart aggregate (cart.go, cart_item.go)
- ✅ `payment/` - Payment aggregate (payment.go, payment_status.go)
- ✅ `returns/` - Return aggregate (return.go, return_status.go)
- ✅ `shared/` - Shared value objects (money.go, address.go)

### service-order/internal/infrastructure/persistence/
- ✅ `order_model.go` - GORM model separated from domain
- ✅ `order_repository.go` - Interface-based repository
- ✅ `cart_model.go` - GORM model separated
- ✅ `cart_repository.go` - Interface-based repository

### service-inventory/internal/domain/
- ✅ `stock/` - Stock aggregate (stock_item.go, stock_level.go, reservation.go, events.go)
- ✅ `warehouse/` - Warehouse aggregate (warehouse.go, warehouse_type.go)
- ✅ `transfer/` - Transfer aggregate (transfer.go, transfer_item.go, transfer_status.go)
- ✅ `movement/` - Movement aggregate (movement.go, movement_type.go)
- ✅ `shared/` - Shared value objects (quantity.go)

### service-inventory/internal/infrastructure/persistence/
- ✅ `stock_model.go`, `stock_repository.go`
- ✅ `warehouse_model.go`, `transfer_model.go`, `movement_model.go`

### service-customer/internal/domain/
- ✅ `customer/` - Customer aggregate (customer.go, customer_note.go, customer_activity.go, events.go)
- ✅ `address/` - Address aggregate (address.go, address_type.go)
- ✅ `wishlist/` - Wishlist aggregate (wishlist.go, wishlist_item.go)
- ✅ `measurement/` - Measurement (measurement.go)
- ✅ `shared/` - Value objects (email.go, phone.go, person_name.go, customer_status.go, measurement.go)

### service-customer/internal/infrastructure/persistence/
- ✅ `customer_model.go`, `customer_repository.go`
- ✅ `address_model.go`, `wishlist_model.go`, `measurement_model.go`, `back_in_stock_model.go`

### service-support/internal/domain/
- ✅ `ticket/` - Ticket aggregate (ticket.go, message.go, status_history.go, events.go)
- ✅ `category/` - Category (category.go)
- ✅ `response/` - Canned responses (canned_response.go)
- ✅ `shared/` - Value objects (ticket_status.go, ticket_priority.go, sender_type.go, ticket_number.go)

### service-support/internal/infrastructure/persistence/
- ✅ `ticket_model.go`, `ticket_repository.go`
- ✅ `category_model.go`, `canned_response_model.go`, `status_history_model.go`

### service-agent/internal/domain/
- ✅ `agent/` - Agent aggregate (agent.go, events.go)
- ✅ `commission/` - Commission aggregate (commission.go, calculator.go, events.go)
- ✅ `payout/` - Payout aggregate (payout.go, payout_item.go)
- ✅ `team/` - Team (team.go)
- ✅ `shared/` - Value objects (agent_status.go, agent_tier.go, commission_status.go, commission_rate.go, payout_status.go)

### service-agent/internal/infrastructure/persistence/
- ✅ `agent_model.go`, `commission_model.go`, `payout_model.go`, `team_model.go`

### service-catalog/internal/domain/
- ✅ `product/` - Product aggregate (product.go, variant.go, image.go, availability.go, events.go)
- ✅ `category/` - Category aggregate (category.go, events.go)
- ✅ `collection/` - Collection (collection.go)
- ✅ `shared/` - Value objects (price.go, sku.go, slug.go, dimensions.go, weight.go, product_type.go, product_status.go)

### service-catalog/internal/infrastructure/persistence/
- ✅ `product_model.go`, `product_repository.go`
- ✅ `category_model.go`, `collection_model.go`, `color_model.go`

### service-auth/internal/domain/
- ✅ `user/user.go` - User aggregate
- ✅ `shared/` - Value objects (user_status.go, user_role.go)

### service-notification/internal/domain/
- ✅ `preference/notification_preference.go`
- ✅ `shared/notification_channel.go`

### service-reporting/internal/domain/
- ✅ `query/sales_query.go` - CQRS query service
- ✅ `shared/date_range.go`

### service-marketplace/internal/domain/
- ✅ `shared/` - Value objects (listing_status.go, seller_status.go)

---

## What Remains (Optional Migration)

The following is **optional** - services work fine with old models during transition:

### service-order
Old `internal/models/` marked deprecated. 25 files still import old models:
- `services/order_service.go`
- `services/cart_service.go`
- `services/payment_service.go`
- `handlers/order_handler.go`
- `handlers/admin_order_handler.go`
- `repository/order_repository.go` (old)
- etc.

### Other Services
Similar pattern - old models deprecated, new domain layer created, services use old models.

---

## Migration Strategy (When Ready)

### Option A: Gradual Migration (Recommended)
1. New features use domain layer
2. Migrate one service/handler at a time
3. Keep old models for backward compatibility
4. Remove old models after full migration

### Option B: Full Migration
1. Update all services to use domain layer
2. Update all handlers to use domain layer
3. Update all repositories to use infrastructure layer
4. Remove old models package

---

## Architecture After Migration

```
service-xxx/
├── cmd/server/main.go
├── internal/
│   ├── domain/           # ✅ DONE - Business logic
│   │   ├── aggregate/
│   │   │   ├── aggregate.go
│   │   │   └── events.go
│   │   └── shared/
│   │       └── value_objects.go
│   ├── infrastructure/   # ✅ DONE - GORM models
│   │   └── persistence/
│   │       ├── model.go
│   │       └── repository.go
│   ├── services/         # Uses domain (optional migration)
│   ├── handlers/         # Uses services (optional migration)
│   └── models/           # DEPRECATED - Remove after migration
```

---

## Benefits Achieved

1. **Clean Architecture** - Domain separated from infrastructure
2. **Rich Domain Models** - Business logic encapsulated
3. **Value Objects** - Type-safe Money, Quantity, Email, etc.
4. **State Machines** - OrderStatus, PaymentStatus with valid transitions
5. **Domain Events** - Event sourcing ready
6. **Interface Repositories** - Testable, swappable persistence
7. **GORM Isolation** - GORM tags only in infrastructure layer

---

## Files Summary

| Category | Count |
|----------|-------|
| Domain files created | 95 |
| Infrastructure files created | 29 |
| Old models marked deprecated | 10 services |
| Total new architecture files | 124 |
