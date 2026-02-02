# Kilang Desa Murni Batik

> Enterprise-grade E-Commerce Platform for Traditional Malaysian Batik

[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?style=flat&logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://docker.com)
[![NATS](https://img.shields.io/badge/NATS-JetStream-27AAE1?style=flat&logo=nats.io)](https://nats.io)

---

## Overview

**Kilang Desa Murni Batik** is a full-stack microservices e-commerce platform designed specifically for selling traditional Malaysian Batik textiles. Built with **Domain-Driven Design (DDD)** principles and modern cloud-native technologies.

### What This System Does

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KILANG DESA MURNI BATIK                           │
│                    Malaysian Batik E-Commerce Platform                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ✓ Customers    → Browse and buy Batik products online
  ✓ Admins       → Manage products, orders, customers, and reports
  ✓ Agents       → Sell products with commission tracking & payouts
  ✓ Warehouse    → Manage stock, inventory, and ship orders
  ✓ Marketplaces → Sync with Shopee and TikTok Shop
```

---

## System Architecture

```
                    ┌──────────────────────────────────────────┐
                    │              FRONTEND APPS               │
                    ├──────────┬──────────┬──────────┬────────┤
                    │Storefront│  Admin   │  Agent   │Warehouse│
                    │(Next.js) │(Next.js) │(Next.js) │(Next.js)│
                    └────┬─────┴────┬─────┴────┬─────┴────┬────┘
                         │          │          │          │
                         └──────────┴──────────┴──────────┘
                                        │
                                        ▼
                    ┌──────────────────────────────────────────┐
                    │           NGINX (API Gateway)            │
                    │         Load Balancer + SSL/TLS          │
                    └──────────────────┬───────────────────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        │              │               │               │              │
        ▼              ▼               ▼               ▼              ▼
  ┌──────────┐  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │   Auth   │  │ Catalog  │   │  Order   │   │  Agent   │   │Inventory │
  │ Service  │  │ Service  │   │ Service  │   │ Service  │   │ Service  │
  └────┬─────┘  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
       │             │              │              │              │
       └─────────────┴──────────────┼──────────────┴──────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌─────────────────┐            ┌─────────────────┐
          │   PostgreSQL    │            │  NATS JetStream │
          │   (Database)    │            │  (Event Bus)    │
          └─────────────────┘            └─────────────────┘
```

---

## Tech Stack

### Backend Services (Go 1.24)

| Service | Description | Key Features |
|---------|-------------|--------------|
| `service-auth` | Authentication & Authorization | JWT, RBAC, OAuth2, Session Management |
| `service-catalog` | Product Management | Products, Categories, Variants, Images |
| `service-order` | Order Processing | Orders, Payments, Receipts, Verification |
| `service-agent` | Agent Management | Commission Tracking, Payouts, Tiers |
| `service-inventory` | Stock Management | Stock Levels, Reservations, Alerts |
| `service-customer` | Customer Management | Profiles, Addresses, History |
| `service-marketplace` | Multi-Channel | Shopee & TikTok Shop Integration |
| `service-notification` | Notifications | Email, SMS, Push Notifications |
| `service-reporting` | Analytics | Sales Reports, Dashboard Metrics |
| `service-support` | Customer Support | Tickets, FAQ, Live Chat |

### Frontend Applications (Next.js 14)

| Application | Description | Users |
|-------------|-------------|-------|
| `frontend-storefront` | Customer-facing store | Public customers |
| `frontend-admin` | Back-office management | Administrators |
| `frontend-agent` | Agent portal | Sales agents |
| `frontend-warehouse` | Inventory management | Warehouse staff |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL 16 | Primary data store (18 schemas, 125+ tables) |
| Message Bus | NATS JetStream | Event-driven communication |
| API Gateway | NGINX | Load balancing, SSL termination, routing |
| Container | Docker Compose | Service orchestration |
| CDN | Cloudflare | Static assets, DDoS protection |
| Storage | MinIO | Object storage for images/files |

---

## Domain-Driven Design (DDD)

The platform is organized into distinct **Bounded Contexts**, each responsible for a specific business domain:

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

### Key DDD Patterns Implemented

- **Aggregate Roots**: Order, Product, Agent, Commission
- **Domain Events**: `order.created`, `inventory.stock.reserved`, `commission.approved`
- **Value Objects**: SKU, Money, OrderNumber, AgentTier
- **Repository Pattern**: Clean separation between domain and data access
- **Event Sourcing**: Order state transitions tracked via events

---

## Key Features

### 1. Multi-Tenant E-Commerce
- Customer storefront with product browsing, cart, and checkout
- Support for multiple payment methods (FPX, Bank Transfer, Cash Deposit)
- Real-time inventory tracking

### 2. Role-Based Access Control (RBAC)
```go
// Permission-based access control
type Permission struct {
    Module string  // e.g., "products", "orders", "users"
    Action string  // e.g., "view", "create", "update", "delete"
}

// Example roles: Admin, Manager, Staff, Agent, Customer
```

| Role | Permissions |
|------|-------------|
| Admin | Full system access |
| Manager | Products, Orders, Reports |
| Staff | View orders, Update inventory |
| Agent | View own sales, Commission reports |

### 3. Agent Commission System
- Multi-tier agent system (Bronze, Silver, Gold, Platinum)
- Automatic commission calculation per sale
- Payout management with approval workflow
- Team-based agent organization

### 4. Payment Verification Workflow
```
Customer uploads receipt → Status: PENDING
          ↓
Admin reviews receipt → VERIFIED or REJECTED
          ↓
If verified → Order status: PAID → Trigger fulfillment
```

### 5. Marketplace Integration
- **Shopee Open Platform**: Product sync, inventory sync, order import
- **TikTok Shop Partner API**: Multi-channel selling
- Centralized order management across all channels

### 6. Real-Time Inventory
- Stock reservation on checkout
- Automatic release on order cancellation
- Low stock alerts and reorder notifications
- Multi-warehouse support

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMAS (18)                        │
├─────────────────────────────────────────────────────────────────┤
│  auth        │ Users, roles, permissions, sessions              │
│  catalog     │ Products, categories, variants, images           │
│  orders      │ Orders, order_items, payments, shipments         │
│  inventory   │ Stock, warehouses, stock_movements               │
│  agent       │ Agents, commissions, payouts, teams              │
│  customer    │ Profiles, addresses, wishlists                   │
│  marketplace │ Connections, product_mappings, sync_jobs         │
│  support     │ Tickets, messages, faq                           │
│  ...         │ + 10 more schemas                                │
└─────────────────────────────────────────────────────────────────┘
                         Total: 125+ Tables
```

---

## API Documentation

### Authentication
```
POST /api/v1/auth/login          # Login with email/password
POST /api/v1/auth/register       # Customer registration
POST /api/v1/auth/refresh        # Refresh JWT token
GET  /api/v1/auth/me             # Get current user profile
```

### Products (Catalog)
```
GET  /api/v1/products            # List products (public)
GET  /api/v1/products/:id        # Get product details
GET  /api/v1/categories          # List categories
POST /api/v1/admin/products      # Create product (admin)
PUT  /api/v1/admin/products/:id  # Update product (admin)
```

### Orders
```
POST /api/v1/orders              # Create order
GET  /api/v1/orders/:id          # Get order details
POST /api/v1/payments/upload     # Upload payment receipt
GET  /api/v1/admin/orders        # List all orders (admin)
PUT  /api/v1/admin/orders/:id    # Update order status
```

### Agent API
```
GET  /api/v1/agent/dashboard     # Agent dashboard stats
GET  /api/v1/agent/commissions   # Commission history
GET  /api/v1/agent/payouts       # Payout history
POST /api/v1/agent/referral      # Generate referral link
```

---

## Project Structure

```
KilangDesaMurniBatik/
├── frontend-admin/          # Admin dashboard (Next.js 14)
├── frontend-agent/          # Agent portal (Next.js 14)
├── frontend-storefront/     # Customer store (Next.js 14)
├── frontend-warehouse/      # Warehouse app (Next.js 14)
│
├── service-auth/            # Authentication service (Go)
├── service-catalog/         # Product catalog service (Go)
├── service-order/           # Order management service (Go)
├── service-agent/           # Agent commission service (Go)
├── service-inventory/       # Inventory service (Go)
├── service-customer/        # Customer service (Go)
├── service-marketplace/     # Marketplace integration (Go)
├── service-notification/    # Notification service (Go)
├── service-reporting/       # Reporting service (Go)
├── service-support/         # Support ticket service (Go)
│
├── lib-common/              # Shared Go libraries
├── lib-ui/                  # Shared UI components
│
├── infra-database/          # Database migrations & seeds
├── infra-platform/          # Docker Compose & configs
│
├── docs/                    # Documentation
│   ├── architecture/        # System architecture docs
│   ├── api/                 # API documentation
│   ├── guides/              # Implementation guides
│   └── reports/             # Test & audit reports
│
└── README.md
```

---

## Event-Driven Architecture

The system uses **NATS JetStream** for reliable event-driven communication:

```
┌─────────────┐    publish    ┌─────────────┐    subscribe    ┌─────────────┐
│   Order     │ ───────────►  │    NATS     │  ────────────►  │  Inventory  │
│  Service    │               │  JetStream  │                 │   Service   │
└─────────────┘               └─────────────┘                 └─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │  Agent   │   │Notification│  │ Reporting│
              │ Service  │   │  Service  │   │ Service  │
              └──────────┘   └──────────┘   └──────────┘
```

### Domain Events
| Event | Publisher | Subscribers |
|-------|-----------|-------------|
| `order.created` | Order | Inventory, Agent, Notification |
| `order.paid` | Order | Inventory, Agent, Notification |
| `inventory.stock.reserved` | Inventory | Order |
| `inventory.stock.depleted` | Inventory | Notification |
| `commission.approved` | Agent | Notification |

---

## Screenshots

### Customer Storefront
- Product catalog with filtering
- Shopping cart and checkout
- Order tracking

### Admin Dashboard
- Sales analytics and reports
- Order management
- Product management
- User & role management

### Agent Portal
- Commission dashboard
- Sales tracking
- Payout requests

---

## Development Setup

### Prerequisites
- Go 1.24+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Quick Start

```bash
# Clone repository
git clone https://github.com/MuhammadLuqman-99/KilangDesaMurniBatik.git
cd KilangDesaMurniBatik

# Start infrastructure
cd infra-platform
docker-compose up -d postgres nats minio nginx

# Run database migrations
cd ../infra-database
./scripts/run_migrations.sh

# Start backend services
cd ../service-auth && go run cmd/server/main.go &
cd ../service-catalog && go run cmd/server/main.go &
# ... start other services

# Start frontend
cd ../frontend-storefront && npm install && npm run dev
```

---

## Deployment

The platform is designed for production deployment with:

- **Docker Compose** for container orchestration
- **NGINX** as reverse proxy with SSL termination
- **Cloudflare** for CDN and DDoS protection
- **PostgreSQL** with automated backups
- **Health checks** and monitoring endpoints

---

## Technical Highlights

| Aspect | Implementation |
|--------|----------------|
| **Architecture** | Microservices with DDD |
| **API Design** | RESTful with OpenAPI spec |
| **Authentication** | JWT + Refresh tokens |
| **Authorization** | Fine-grained RBAC |
| **Database** | PostgreSQL with 18 schemas |
| **Events** | NATS JetStream |
| **Caching** | Redis (optional) |
| **Search** | Full-text search with PostgreSQL |
| **File Storage** | MinIO (S3-compatible) |
| **Monitoring** | OpenTelemetry ready |

---

## Documentation

| Document | Description |
|----------|-------------|
| [System Architecture](docs/architecture/system-architecture.md) | Overall system design |
| [Complete System Documentation](docs/architecture/complete-system-documentation.md) | Comprehensive technical docs |
| [Bounded Contexts](docs/architecture/bounded-contexts.md) | DDD bounded contexts |
| [API Documentation](docs/api/) | API endpoints reference |
| [Marketplace Integration](docs/integration/marketplace-integration.md) | Shopee & TikTok integration |

---

## Author

**Muhammad Luqman**

- Building enterprise-grade e-commerce solutions
- Specializing in Go, Next.js, and cloud-native architectures
- Focus on Domain-Driven Design and microservices

---

## License

This project is proprietary software developed for Kilang Desa Murni Batik.

---

<p align="center">
  <b>Built with Domain-Driven Design principles for scalability and maintainability</b>
</p>
