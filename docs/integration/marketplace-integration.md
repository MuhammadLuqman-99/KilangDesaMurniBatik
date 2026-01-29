# Marketplace Integration: Shopee & TikTok Shop

## Status: Implementation Complete ✅

| Component | Status |
|-----------|--------|
| service-marketplace | ✅ Complete |
| Database Migration | ✅ Complete |
| Shopee Provider | ✅ Complete |
| TikTok Provider | ✅ Complete |
| NATS Events | ✅ Complete |
| API Endpoints | ✅ Complete |
| Frontend Admin UI | ✅ Complete |
| Docker Compose | ✅ Complete |
| Nginx Config | ✅ Complete |

**Next Step**: Apply for API access from Shopee and TikTok to start testing.

## Overview
Integrate Shopee Open Platform and TikTok Shop Partner APIs with KilangDesaMurniBatik admin panel for unified multi-channel e-commerce management.

## Prerequisites (User Action Required)
1. **Apply for Shopee Open Platform API access**: https://open.shopee.com
2. **Apply for TikTok Shop Partner API access**: https://partner.tiktokshop.com
3. Get Partner ID, API Keys, and configure redirect URLs

---

## Architecture

```
Frontend Admin (Next.js)
         |
         v
service-marketplace (NEW) <---> service-catalog
         |                            |
    +----+----+                       |
    |         |                       |
 Shopee    TikTok                     |
Provider   Provider                   |
    |         |                       |
    v         v                       v
Shopee API  TikTok API         service-inventory
                                      |
                                      v
                               service-order
```

## Key Features
1. **Product Sync**: Push products from admin to Shopee/TikTok
2. **Inventory Sync**: Real-time stock sync across all channels
3. **Order Sync**: Receive marketplace orders, confirm in admin, push status back
4. **Category Mapping**: Map internal categories to marketplace categories

---

## Implementation Steps

### Phase 1: New Service Setup
**Create `service-marketplace/`**

```
service-marketplace/
├── cmd/server/main.go
├── internal/
│   ├── config/config.go
│   ├── models/
│   │   ├── connection.go        # OAuth tokens & shop info
│   │   ├── product_mapping.go   # Internal ↔ External product IDs
│   │   ├── category_mapping.go  # Category mapping
│   │   ├── marketplace_order.go # Orders from marketplaces
│   │   └── sync_job.go          # Background job queue
│   ├── providers/
│   │   ├── interface.go         # MarketplaceProvider interface
│   │   ├── shopee/
│   │   │   ├── client.go        # Shopee API client
│   │   │   ├── auth.go          # OAuth flow
│   │   │   ├── product.go       # Product operations
│   │   │   ├── order.go         # Order operations
│   │   │   └── inventory.go     # Inventory sync
│   │   └── tiktok/
│   │       ├── client.go        # TikTok API client
│   │       ├── auth.go          # OAuth flow
│   │       ├── product.go       # Product operations
│   │       ├── order.go         # Order operations
│   │       └── inventory.go     # Inventory sync
│   ├── repository/
│   │   ├── connection_repo.go
│   │   ├── product_mapping_repo.go
│   │   └── order_repo.go
│   ├── services/
│   │   ├── marketplace_service.go
│   │   ├── sync_service.go
│   │   └── webhook_service.go
│   ├── handlers/
│   │   ├── connection_handler.go
│   │   ├── product_handler.go
│   │   ├── order_handler.go
│   │   └── webhook_handler.go
│   └── workers/
│       ├── sync_worker.go       # Background sync processor
│       └── token_refresh.go     # Token refresh worker
├── go.mod
└── Dockerfile
```

### Phase 2: Database Migration
**File: `database/migrations/027_marketplace_integration.sql`**

```sql
-- Marketplace Integration Schema
CREATE SCHEMA IF NOT EXISTS marketplace;

-- Marketplace Connections (OAuth credentials)
CREATE TABLE marketplace.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,          -- 'shopee' or 'tiktok'
    shop_id VARCHAR(100) NOT NULL,          -- Platform's shop ID
    shop_name VARCHAR(255),
    access_token TEXT NOT NULL,             -- Encrypted
    refresh_token TEXT,                     -- Encrypted
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, shop_id)
);

-- Product Mappings (Internal ↔ External)
CREATE TABLE marketplace.product_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES marketplace.connections(id) ON DELETE CASCADE,
    internal_product_id UUID NOT NULL,      -- Our product ID
    external_product_id VARCHAR(100) NOT NULL, -- Shopee/TikTok product ID
    external_sku VARCHAR(100),
    sync_status VARCHAR(50) DEFAULT 'synced', -- synced, pending, error
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(connection_id, internal_product_id)
);

-- Category Mappings
CREATE TABLE marketplace.category_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES marketplace.connections(id) ON DELETE CASCADE,
    internal_category_id UUID NOT NULL,
    external_category_id VARCHAR(100) NOT NULL,
    external_category_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(connection_id, internal_category_id)
);

-- Marketplace Orders
CREATE TABLE marketplace.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES marketplace.connections(id),
    internal_order_id UUID,                  -- Linked order in service-order
    external_order_id VARCHAR(100) NOT NULL, -- Shopee/TikTok order ID
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,             -- Platform-specific status
    order_data JSONB NOT NULL,               -- Full order details
    shipping_info JSONB,
    buyer_info JSONB,
    total_amount DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'MYR',
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(connection_id, external_order_id)
);

-- Sync Jobs Queue
CREATE TABLE marketplace.sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES marketplace.connections(id),
    job_type VARCHAR(50) NOT NULL,           -- product_push, inventory_sync, order_sync
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',    -- pending, processing, completed, failed
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Events Log
CREATE TABLE marketplace.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_connections_platform ON marketplace.connections(platform);
CREATE INDEX idx_product_mappings_internal ON marketplace.product_mappings(internal_product_id);
CREATE INDEX idx_orders_internal ON marketplace.orders(internal_order_id);
CREATE INDEX idx_orders_external ON marketplace.orders(external_order_id);
CREATE INDEX idx_sync_jobs_status ON marketplace.sync_jobs(status, scheduled_at);
CREATE INDEX idx_webhook_events_processed ON marketplace.webhook_events(processed, received_at);
```

### Phase 3: Provider Interface

**File: `service-marketplace/internal/providers/interface.go`**

```go
package providers

import (
    "context"
    "time"
)

// MarketplaceProvider defines the interface for marketplace integrations
type MarketplaceProvider interface {
    // Platform identification
    GetPlatform() string

    // OAuth Flow
    GetAuthURL(state string) string
    ExchangeCode(ctx context.Context, code string) (*TokenResponse, error)
    RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error)

    // Shop Info
    GetShopInfo(ctx context.Context) (*ShopInfo, error)

    // Products
    PushProduct(ctx context.Context, product *ProductPushRequest) (*ProductPushResponse, error)
    UpdateProduct(ctx context.Context, externalID string, product *ProductUpdateRequest) error
    DeleteProduct(ctx context.Context, externalID string) error
    GetCategories(ctx context.Context) ([]ExternalCategory, error)

    // Inventory
    UpdateInventory(ctx context.Context, updates []InventoryUpdate) error
    GetInventory(ctx context.Context, externalProductIDs []string) ([]InventoryItem, error)

    // Orders
    GetOrders(ctx context.Context, params OrderQueryParams) ([]ExternalOrder, error)
    GetOrder(ctx context.Context, externalOrderID string) (*ExternalOrder, error)
    UpdateOrderStatus(ctx context.Context, externalOrderID string, status string, tracking *TrackingInfo) error

    // Webhooks
    VerifyWebhook(ctx context.Context, body []byte, headers map[string]string) (bool, error)
    ParseWebhookEvent(body []byte) (*WebhookEvent, error)
}

// TokenResponse represents OAuth token response
type TokenResponse struct {
    AccessToken  string
    RefreshToken string
    ExpiresAt    time.Time
    ShopID       string
    ShopName     string
}

// ShopInfo represents marketplace shop information
type ShopInfo struct {
    ShopID   string
    ShopName string
    Status   string
}

// ProductPushRequest represents a product to push to marketplace
type ProductPushRequest struct {
    InternalID      string
    Name            string
    Description     string
    Price           float64
    OriginalPrice   float64
    Stock           int
    SKU             string
    CategoryID      string
    Images          []string
    Weight          float64
    Dimensions      *Dimensions
    Variants        []VariantRequest
}

type Dimensions struct {
    Length float64
    Width  float64
    Height float64
}

type VariantRequest struct {
    SKU   string
    Name  string
    Price float64
    Stock int
}

// ProductPushResponse represents the response from pushing a product
type ProductPushResponse struct {
    ExternalProductID string
    ExternalSKU       string
    Status            string
}

// InventoryUpdate represents a stock update
type InventoryUpdate struct {
    ExternalProductID string
    ExternalSKU       string
    Quantity          int
}

// ExternalOrder represents an order from marketplace
type ExternalOrder struct {
    ExternalOrderID string
    Status          string
    Items           []OrderItem
    BuyerInfo       BuyerInfo
    ShippingInfo    ShippingInfo
    TotalAmount     float64
    Currency        string
    CreatedAt       time.Time
}

type OrderItem struct {
    ExternalProductID string
    SKU               string
    Name              string
    Quantity          int
    Price             float64
}

type BuyerInfo struct {
    Name  string
    Phone string
    Email string
}

type ShippingInfo struct {
    RecipientName string
    Phone         string
    Address       string
    City          string
    State         string
    PostalCode    string
    Country       string
}

// TrackingInfo for order fulfillment
type TrackingInfo struct {
    Courier        string
    TrackingNumber string
}

// WebhookEvent represents a parsed webhook event
type WebhookEvent struct {
    Type    string // order.created, order.status_changed, etc.
    ShopID  string
    Payload interface{}
}
```

### Phase 4: Admin API Endpoints

```
# Connection Management
GET    /api/v1/admin/marketplace/connections           # List all connections
POST   /api/v1/admin/marketplace/:platform/auth-url    # Get OAuth URL
GET    /api/v1/admin/marketplace/:platform/callback    # OAuth callback
DELETE /api/v1/admin/marketplace/connections/:id       # Disconnect

# Product Sync
GET    /api/v1/admin/marketplace/connections/:id/products           # List synced products
POST   /api/v1/admin/marketplace/connections/:id/products/push      # Push products
PUT    /api/v1/admin/marketplace/connections/:id/products/:mapping_id  # Update mapping

# Category Mapping
GET    /api/v1/admin/marketplace/connections/:id/categories/external  # Get marketplace categories
GET    /api/v1/admin/marketplace/connections/:id/categories           # Get mappings
POST   /api/v1/admin/marketplace/connections/:id/categories           # Create mapping

# Order Sync
GET    /api/v1/admin/marketplace/connections/:id/orders               # List marketplace orders
POST   /api/v1/admin/marketplace/connections/:id/orders/:ext_id/import # Import to system
PUT    /api/v1/admin/marketplace/orders/:id/ship                      # Ship & push tracking

# Inventory Sync
POST   /api/v1/admin/marketplace/connections/:id/inventory/push       # Push inventory
GET    /api/v1/admin/marketplace/connections/:id/inventory/status     # Sync status

# Webhooks (public endpoints)
POST   /webhooks/shopee                                               # Shopee webhook
POST   /webhooks/tiktok                                               # TikTok webhook
```

### Phase 5: Frontend Admin Pages

**Location: `frontend-admin/src/app/marketplace/`**

```
marketplace/
├── page.tsx                      # Dashboard - connection overview
├── connect/
│   ├── page.tsx                  # Platform selection
│   ├── shopee/page.tsx           # Connect Shopee flow
│   └── tiktok/page.tsx           # Connect TikTok flow
├── callback/
│   ├── shopee/page.tsx           # Shopee OAuth callback
│   └── tiktok/page.tsx           # TikTok OAuth callback
└── [connectionId]/
    ├── page.tsx                  # Connection dashboard
    ├── products/
    │   ├── page.tsx              # Product sync list
    │   └── push/page.tsx         # Select products to push
    ├── categories/page.tsx       # Category mapping
    ├── orders/
    │   ├── page.tsx              # Marketplace orders list
    │   └── [orderId]/page.tsx    # Order details
    ├── inventory/page.tsx        # Inventory sync status
    └── settings/page.tsx         # Connection settings
```

### Phase 6: Event-Driven Sync

**NATS Events for Real-time Sync:**

```
# Events to Subscribe (from other services)
inventory.stock.changed          # Triggers marketplace inventory update
order.status.changed             # Pushes status to marketplace
product.updated                  # Triggers product update on marketplaces

# Events to Publish (from marketplace service)
marketplace.order.created        # New order from marketplace
marketplace.order.imported       # Order imported to system
marketplace.sync.completed       # Sync job completed
marketplace.sync.failed          # Sync job failed
```

---

## Sync Flows

### 1. Product Push Flow (Admin → Marketplaces)
```
1. Admin selects products in frontend
2. POST /api/v1/admin/marketplace/connections/:id/products/push
   - Validates category mapping exists
   - Creates sync job in queue
3. Worker picks up job:
   - Fetches product from service-catalog
   - Transforms to marketplace format
   - Calls marketplace API
   - Stores product mapping
4. Returns status to admin
```

### 2. Inventory Sync Flow (Real-time)
```
1. Stock changes in service-inventory
2. Publishes NATS event: inventory.stock.changed
3. service-marketplace receives event
4. For each connected marketplace:
   - Lookup product mapping by internal_product_id
   - Skip if no mapping (product not pushed)
   - Call marketplace API to update stock
5. Log result in sync_jobs
```

### 3. Order Sync Flow (Marketplaces → Admin)
```
1. Customer orders on Shopee/TikTok
2. Webhook received at /webhooks/{platform}
3. Verify signature, parse order
4. Store in marketplace.orders table
5. Admin sees new order in dashboard
6. Admin clicks "Import Order":
   - Creates order in service-order
   - Links internal_order_id
   - Reserves inventory
7. Admin updates status (shipped):
   - Detects marketplace origin
   - Pushes status + tracking to marketplace
```

---

## API Specifics

### Shopee Open Platform
- **Base URL**: https://partner.shopeemobile.com (production)
- **Sandbox**: https://partner.test-stable.shopeemobile.com
- **Auth**: OAuth 2.0 with Partner ID + Partner Key
- **Signature**: HMAC-SHA256 on request path + timestamp
- **Token TTL**: 4 hours (use refresh token before expiry)
- **Rate Limit**: ~100 requests per minute
- **Webhook Header**: `Shopee-Hmac-Sha256`

### TikTok Shop Partner API
- **Base URL**: https://open-api.tiktokglobalshop.com
- **Auth**: OAuth 2.0 with App Key + App Secret
- **Signature**: HMAC-SHA256 on query params
- **Token TTL**: Short-lived (auto-refresh mechanism)
- **Rate Limit**: Sliding window (varies by endpoint)
- **Webhook Header**: `X-Tts-Signature`

---

## Error Handling & Retry

```go
// Retry Configuration
type RetryConfig struct {
    MaxAttempts     int           // 3
    InitialDelay    time.Duration // 5 seconds
    MaxDelay        time.Duration // 60 seconds
    BackoffFactor   float64       // 2.0
}

// Retryable Errors
- Rate limit exceeded (HTTP 429)
- Server errors (HTTP 5xx)
- Network timeout
- Connection refused

// Non-Retryable Errors
- Invalid request (HTTP 400)
- Unauthorized (HTTP 401)
- Not found (HTTP 404)
- Validation errors
```

**Circuit Breaker:**
- Open after 5 consecutive failures
- Half-open after 60 seconds
- Close after 3 successful requests

---

## Security Considerations

1. **Token Storage**: Encrypt OAuth tokens at rest using AES-256-GCM
2. **Webhook Verification**: Always verify signatures before processing
3. **RBAC**: Add marketplace permissions to admin roles
4. **Audit Logging**: Log all sync operations with user context
5. **Rate Limiting**: Implement internal rate limiting to respect marketplace limits

---

## Configuration

**Environment Variables:**

```env
# Shopee
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_REDIRECT_URL=https://admin.kilangdesamurnibatik.com/marketplace/callback/shopee
SHOPEE_SANDBOX=true

# TikTok Shop
TIKTOK_APP_KEY=
TIKTOK_APP_SECRET=
TIKTOK_REDIRECT_URL=https://admin.kilangdesamurnibatik.com/marketplace/callback/tiktok

# Encryption
MARKETPLACE_ENCRYPTION_KEY=  # 32-byte key for token encryption

# NATS
NATS_URL=nats://localhost:4222
```

---

## Docker Compose Addition

```yaml
  service-marketplace:
    build:
      context: ./service-marketplace
      dockerfile: Dockerfile
    container_name: kilang-marketplace
    restart: always
    ports:
      - "8007:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NATS_URL=nats://nats:4222
      - SHOPEE_PARTNER_ID=${SHOPEE_PARTNER_ID}
      - SHOPEE_PARTNER_KEY=${SHOPEE_PARTNER_KEY}
      - TIKTOK_APP_KEY=${TIKTOK_APP_KEY}
      - TIKTOK_APP_SECRET=${TIKTOK_APP_SECRET}
    depends_on:
      - postgres
      - nats
    networks:
      - kilang-network
```

---

## Implementation Phases

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| 1. Foundation | Service structure, models, interfaces, migration | None |
| 2. OAuth & Connections | Connect/disconnect flow for both platforms | Phase 1 |
| 3. Product Sync | Category mapping, product push | Phase 2 |
| 4. Inventory Sync | Event-driven stock sync | Phase 3 |
| 5. Order Sync | Webhook handlers, order import, status push | Phase 4 |
| 6. Frontend | Admin UI pages | Phases 2-5 |
| 7. Testing | Sandbox testing, bug fixes | All phases |

---

## Files to Reference

| Existing File | Reference For |
|---------------|---------------|
| `service-order/internal/providers/curlec/` | OAuth client pattern |
| `service-order/internal/providers/easyparcel/` | External API integration |
| `service-order/internal/events/nats_publisher.go` | Event publishing |
| `service-order/internal/saga/saga.go` | Saga pattern for orders |
| `service-catalog/internal/models/product.go` | Product model structure |
| `service-order/internal/models/order.go` | Order model structure |
| `frontend-admin/src/lib/api/core.ts` | API client pattern |

---

## Notes

- Start with Shopee sandbox for testing (set `SHOPEE_SANDBOX=true`)
- Category mapping is **mandatory** before product push
- Stock sync should be real-time (event-driven)
- Order sync requires careful idempotency handling
- Token refresh must run before expiry (set up background worker)
