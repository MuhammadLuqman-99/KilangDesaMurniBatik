# OpenTelemetry Integration Guide

This guide explains how to integrate OpenTelemetry distributed tracing into the KilangDesaMurniBatik microservices.

## Overview

OpenTelemetry provides:
- **Distributed Tracing**: Track requests across services
- **Automatic Context Propagation**: Trace IDs flow through HTTP/NATS
- **Performance Metrics**: Measure latency at each service hop
- **Error Tracking**: Capture errors with full context

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Nginx     │────▶│  Services   │
│  (Browser)  │     │   Gateway   │     │  (Go APIs)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │   Jaeger    │
                                        │  Collector  │
                                        └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │  Jaeger UI  │
                                        │ :16686      │
                                        └─────────────┘
```

## Quick Start

### 1. Add Dependencies to go.mod

```bash
cd lib-common
go get go.opentelemetry.io/otel@latest
go get go.opentelemetry.io/otel/sdk@latest
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp@latest
go get go.opentelemetry.io/otel/trace@latest
go get go.opentelemetry.io/otel/propagation@latest
```

### 2. Initialize Telemetry in main.go

```go
package main

import (
    "context"
    "os"
    "os/signal"
    "syscall"
    "time"

    "lib-common/telemetry"
    "go.uber.org/zap"
)

func main() {
    logger, _ := zap.NewProduction()
    defer logger.Sync()

    // Initialize OpenTelemetry
    cfg := telemetry.DefaultConfig("service-order")
    otel, err := telemetry.New(cfg, logger)
    if err != nil {
        logger.Fatal("Failed to initialize telemetry", zap.Error(err))
    }

    // Ensure graceful shutdown
    defer func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        if err := otel.Shutdown(ctx); err != nil {
            logger.Error("Telemetry shutdown error", zap.Error(err))
        }
    }()

    // ... rest of initialization
}
```

### 3. Add Tracing Middleware to Gin Router

```go
import (
    "github.com/gin-gonic/gin"
    "lib-common/telemetry"
)

func setupRouter(serviceName string) *gin.Engine {
    router := gin.New()

    // Add OpenTelemetry tracing middleware FIRST
    router.Use(telemetry.TracingMiddleware(serviceName))

    // Then other middleware
    router.Use(gin.Recovery())
    router.Use(middleware.LoggerMiddleware())
    // ... other middleware

    return router
}
```

### 4. Instrument HTTP Clients

Replace direct `http.Client` usage with `TracedHTTPClient`:

**Before:**
```go
type InventoryClient struct {
    baseURL    string
    httpClient *http.Client
    logger     *zap.Logger
}

func NewInventoryClient(baseURL string, logger *zap.Logger) *InventoryClient {
    return &InventoryClient{
        baseURL:    baseURL,
        httpClient: &http.Client{Timeout: 10 * time.Second},
        logger:     logger,
    }
}

func (c *InventoryClient) ReserveStock(ctx context.Context, req ReserveRequest) error {
    body, _ := json.Marshal(req)
    resp, err := c.httpClient.Post(c.baseURL+"/reserve", "application/json", bytes.NewBuffer(body))
    // ...
}
```

**After:**
```go
import "lib-common/telemetry"

type InventoryClient struct {
    baseURL    string
    httpClient *telemetry.TracedHTTPClient
    logger     *zap.Logger
}

func NewInventoryClient(baseURL string, logger *zap.Logger) *InventoryClient {
    return &InventoryClient{
        baseURL:    baseURL,
        httpClient: telemetry.NewTracedHTTPClient("inventory-client", 10*time.Second),
        logger:     logger,
    }
}

func (c *InventoryClient) ReserveStock(ctx context.Context, req ReserveRequest) error {
    body, _ := json.Marshal(req)
    resp, err := c.httpClient.PostJSON(ctx, c.baseURL+"/reserve", body)
    // Trace context automatically propagated!
    // ...
}
```

### 5. Instrument GORM Database Queries

```go
import (
    "lib-common/telemetry"
    "gorm.io/gorm"
)

func initDatabase(db *gorm.DB, serviceName string) error {
    tracer := telemetry.NewGORMTracer(serviceName, "kilang_batik")
    return tracer.RegisterCallbacks(db)
}
```

### 6. Instrument NATS Publishers

```go
import (
    "lib-common/telemetry"
    "github.com/nats-io/nats.go"
)

type EventPublisher struct {
    publisher *telemetry.TracedNATSPublisher
}

func NewEventPublisher(conn *nats.Conn, js nats.JetStreamContext) *EventPublisher {
    return &EventPublisher{
        publisher: telemetry.NewTracedNATSPublisher(conn, js, "service-order"),
    }
}

func (p *EventPublisher) PublishOrderCreated(ctx context.Context, event OrderCreatedEvent) error {
    return p.publisher.PublishJSON(ctx, "orders.created", event)
}
```

### 7. Instrument NATS Subscribers

```go
import "lib-common/telemetry"

func handleOrderMessage(msg *nats.Msg) {
    // Extract trace context from message
    ctx, span := telemetry.StartConsumerSpan(context.Background(), "service-inventory", msg.Subject, msg)
    defer span.End()

    // Process message with traced context
    if err := processOrder(ctx, msg.Data); err != nil {
        span.RecordError(err)
    }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OTEL_ENABLED` | `true` | Enable/disable tracing |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `jaeger:4318` | OTLP collector endpoint |
| `OTEL_SERVICE_NAME` | (required) | Service name for traces |
| `APP_ENV` | `development` | Environment (affects sampling) |
| `APP_VERSION` | - | Service version |

## Sampling Configuration

| Environment | Sampling Rate | Reason |
|-------------|---------------|--------|
| development | 100% | Debug all requests |
| production | 10% | Balance cost vs visibility |

To adjust production sampling:
```go
cfg := telemetry.DefaultConfig("service-order")
cfg.SampleRate = 0.05 // 5% sampling
```

## Viewing Traces

1. Start Jaeger: `docker compose up -d jaeger`
2. Open Jaeger UI: http://localhost:16686
3. Select service from dropdown
4. Click "Find Traces"

### Understanding Trace View

```
service-order (root span)
├── GORM SELECT orders (3ms)
├── HTTP POST inventory:8003/reserve (45ms)
│   └── service-inventory
│       ├── GORM SELECT stock (2ms)
│       └── GORM UPDATE stock (5ms)
├── NATS Publish orders.created (1ms)
│   └── service-notification (async)
│       └── GORM INSERT notifications (3ms)
└── HTTP 200 response (total: 52ms)
```

## Custom Spans

Add custom spans for important operations:

```go
import (
    "context"
    "lib-common/telemetry"
    "go.opentelemetry.io/otel/attribute"
)

func processPayment(ctx context.Context, orderID string, amount float64) error {
    ctx, span := telemetry.StartSpan(ctx, "ProcessPayment")
    defer span.End()

    // Add business context
    span.SetAttributes(
        attribute.String("order.id", orderID),
        attribute.Float64("payment.amount", amount),
        attribute.String("payment.currency", "MYR"),
    )

    // Your payment logic here
    result, err := paymentGateway.Charge(ctx, amount)
    if err != nil {
        telemetry.RecordError(ctx, err)
        return err
    }

    span.SetAttributes(attribute.String("payment.transaction_id", result.TransactionID))
    return nil
}
```

## Error Recording

```go
func (s *OrderService) CreateOrder(ctx context.Context, req CreateOrderRequest) (*Order, error) {
    ctx, span := telemetry.StartSpan(ctx, "CreateOrder")
    defer span.End()

    order, err := s.repo.Create(ctx, req)
    if err != nil {
        // Error automatically recorded with stack trace
        telemetry.RecordError(ctx, err)
        span.SetStatus(codes.Error, err.Error())
        return nil, err
    }

    telemetry.AddSpanAttributes(ctx,
        attribute.String("order.id", order.ID.String()),
        attribute.String("order.number", order.OrderNumber),
    )

    return order, nil
}
```

## Integration Checklist

For each service:

- [ ] Add OpenTelemetry dependencies to go.mod
- [ ] Initialize telemetry in main.go
- [ ] Add TracingMiddleware to Gin router
- [ ] Register GORM tracing callbacks
- [ ] Replace http.Client with TracedHTTPClient
- [ ] Wrap NATS publishers with TracedNATSPublisher
- [ ] Add trace context extraction in NATS subscribers
- [ ] Add OTEL environment variables to docker-compose
- [ ] Test traces appear in Jaeger UI

## File Reference

| File | Purpose |
|------|---------|
| `lib-common/telemetry/tracer.go` | Core tracer initialization |
| `lib-common/telemetry/middleware.go` | Gin HTTP middleware |
| `lib-common/telemetry/http_client.go` | Traced HTTP client |
| `lib-common/telemetry/gorm.go` | GORM database tracing |
| `lib-common/telemetry/nats.go` | NATS message tracing |

## Troubleshooting

### Traces not appearing in Jaeger

1. Check OTEL_ENABLED is not "false"
2. Verify Jaeger container is running: `docker ps | grep jaeger`
3. Check service can reach Jaeger: `docker exec kilang-order wget -q jaeger:4318`
4. Verify OTLP endpoint in logs

### Missing parent-child relationships

1. Ensure context is passed through all function calls
2. Use `ctx` from Gin handler, not `context.Background()`
3. Verify TracedHTTPClient is injecting headers

### High memory usage

1. Reduce sampling rate in production
2. Decrease batch size: `sdktrace.WithMaxExportBatchSize(256)`
3. Reduce span attributes for high-volume endpoints

## Production Recommendations

1. **Sampling**: Use 5-10% sampling for high-traffic services
2. **Storage**: Configure Jaeger with Elasticsearch for production
3. **Alerting**: Set up alerts for high latency traces
4. **Security**: Don't expose Jaeger UI publicly
5. **Cost**: Monitor storage costs and adjust retention
