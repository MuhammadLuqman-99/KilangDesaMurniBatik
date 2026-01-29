# Kilang Desa Murni Batik - Complete System Documentation

## Document Information

| Attribute | Value |
|-----------|-------|
| **Version** | 2.0 |
| **Last Updated** | January 2026 |
| **Database Schemas** | 18 |
| **Database Tables** | 125 |
| **Backend Services** | 10 |
| **Frontend Applications** | 3 |

---

## Disclaimer

> **For Public Sharing**
>
> This documentation describes the technical architecture of an e-commerce platform built with Domain-Driven Design (DDD) and microservices patterns.
>
> **Important Notes:**
> - All bank account numbers, API keys, and credentials shown are **examples only** for illustration purposes
> - No sensitive production data is included in this document
> - Email addresses and phone numbers are fictional examples
> - This document is intended for educational and reference purposes
>
> **Technology Stack:** Go 1.24, Next.js 14, PostgreSQL 16, NATS JetStream, Docker
>
> **Architecture Pattern:** Domain-Driven Design (DDD) with Microservices

---

# PART 1: SYSTEM OVERVIEW

## 1.1 What is Kilang Desa Murni Batik?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KILANG DESA MURNI BATIK                           │
│                    Malaysian Batik E-Commerce Platform                       │
└─────────────────────────────────────────────────────────────────────────────┘

  This system allows:

  ✓ Customers    → Browse and buy Batik products online
  ✓ Admins       → Manage products, orders, and customers
  ✓ Agents       → Sell products and earn commissions
  ✓ Warehouse    → Manage stock and ship orders
  ✓ Marketplaces → Sync with Shopee and TikTok Shop
```

## 1.2 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

                    USERS (Browsers/Mobile)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   STOREFRONT  │    │     ADMIN     │    │   WAREHOUSE   │
│  (Customer)   │    │  (Staff/Admin)│    │    (Staff)    │
│   Port 3000   │    │   Port 3001   │    │   Port 3002   │
│   Next.js 14  │    │   Next.js 14  │    │   Next.js 14  │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │          NGINX           │
              │      (Reverse Proxy)     │
              │    Port 80 (HTTP)        │
              │    Port 443 (HTTPS)      │
              └────────────┬─────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
     ▼                     ▼                     ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  AUTH   │  │ CATALOG │  │INVENTORY│  │CUSTOMER │  │  ORDER  │
│  :8001  │  │  :8002  │  │  :8003  │  │  :8004  │  │  :8005  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘

┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  AGENT  │  │REPORTING│  │ NOTIF   │  │ SUPPORT │  │MARKET   │
│  :8006  │  │  :8007  │  │  :8008  │  │  :8009  │  │ :8010   │
└─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘
     │            │            │            │            │
     └────────────┴────────────┼────────────┴────────────┘
                               │
                               ▼
              ┌──────────────────────────┐
              │       PostgreSQL         │
              │    18 Schemas            │
              │    125 Tables            │
              └──────────────────────────┘
```

## 1.3 DDD Microservices Architecture (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              DOMAIN-DRIVEN DESIGN (DDD) MICROSERVICES ARCHITECTURE          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   STOREFRONT    │  │     ADMIN       │  │   WAREHOUSE     │              │
│  │   Next.js 14    │  │   Next.js 14    │  │   Next.js 14    │              │
│  │   Port: 3000    │  │   Port: 3001    │  │   Port: 3002    │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
└───────────┼─────────────────────┼─────────────────────┼──────────────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                    ┌────────────────────────┐                                │
│                    │         NGINX          │                                │
│                    │   - SSL Termination    │                                │
│                    │   - Load Balancing     │                                │
│                    │   - Rate Limiting      │                                │
│                    │   - Request Routing    │                                │
│                    └───────────┬────────────┘                                │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
     ▼                           ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER (GO 1.24)                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                     CORE BOUNDED CONTEXTS                                ││
│  │                                                                          ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       ││
│  │  │  AUTH CONTEXT    │  │ CATALOG CONTEXT  │  │  ORDER CONTEXT   │       ││
│  │  │  Port: 8001      │  │  Port: 8002      │  │  Port: 8005      │       ││
│  │  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       ││
│  │  │ Domain:          │  │ Domain:          │  │ Domain:          │       ││
│  │  │ - User           │  │ - Product        │  │ - Order          │       ││
│  │  │ - Role           │  │ - Category       │  │ - OrderItem      │       ││
│  │  │ - Permission     │  │ - Variant        │  │ - Cart           │       ││
│  │  │ - Session        │  │ - Discount       │  │ - Payment        │       ││
│  │  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       ││
│  │  │ Schema:          │  │ Schema:          │  │ Schema:          │       ││
│  │  │ auth (7 tables)  │  │ catalog (14 tbl) │  │ orders (6 tbl)   │       ││
│  │  │                  │  │ public (products)│  │ sales (13 tbl)   │       ││
│  │  │                  │  │                  │  │ payments (2 tbl) │       ││
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘       ││
│  │           │                     │                     │                  ││
│  └───────────┼─────────────────────┼─────────────────────┼──────────────────┘│
│              │                     │                     │                   │
│  ┌───────────┼─────────────────────┼─────────────────────┼──────────────────┐│
│  │           │    SUPPORTING BOUNDED CONTEXTS            │                  ││
│  │           │                     │                     │                  ││
│  │  ┌────────┴─────────┐  ┌────────┴─────────┐  ┌────────┴─────────┐       ││
│  │  │ INVENTORY CTXT   │  │ CUSTOMER CONTEXT │  │  AGENT CONTEXT   │       ││
│  │  │  Port: 8003      │  │  Port: 8004      │  │  Port: 8006      │       ││
│  │  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       ││
│  │  │ Domain:          │  │ Domain:          │  │ Domain:          │       ││
│  │  │ - Warehouse      │  │ - Customer       │  │ - Agent          │       ││
│  │  │ - StockItem      │  │ - Segment        │  │ - Commission     │       ││
│  │  │ - StockMovement  │  │ - Activity       │  │ - Team           │       ││
│  │  │ - Transfer       │  │ - Address        │  │                  │       ││
│  │  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       ││
│  │  │ Schema:          │  │ Schema:          │  │ Schema:          │       ││
│  │  │ inventory (5 tbl)│  │ customers (5 tbl)│  │ agents (3 tbl)   │       ││
│  │  │                  │  │ customer (4 tbl) │  │                  │       ││
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘       ││
│  │                                                                          ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       ││
│  │  │ REPORTING CTXT   │  │ NOTIF CONTEXT    │  │ MARKETPLACE CTXT │       ││
│  │  │  Port: 8007      │  │  Port: 8008      │  │  Port: 8010      │       ││
│  │  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       ││
│  │  │ Domain:          │  │ Domain:          │  │ Domain:          │       ││
│  │  │ - Report         │  │ - Notification   │  │ - Connection     │       ││
│  │  │ - Analytics      │  │ - Email          │  │ - ProductMapping │       ││
│  │  │ - Dashboard      │  │ - SMS            │  │ - SyncJob        │       ││
│  │  │                  │  │ - Push           │  │ - WebhookEvent   │       ││
│  │  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       ││
│  │  │ Schema:          │  │ Schema:          │  │ Schema:          │       ││
│  │  │ analytics (4 tbl)│  │ notification     │  │ marketplace      │       ││
│  │  │ reporting        │  │                  │  │ (9 tables)       │       ││
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘       ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       │ NATS JetStream (Events)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MESSAGING LAYER                                    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      NATS JETSTREAM                                  │   │
│   │                                                                      │   │
│   │   Events Published:                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │order.created│  │payment.paid │  │stock.updated│                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │order.shipped│  │agent.commis │  │customer.new │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      OUTBOX PATTERN                                  │   │
│   │   outbox.events table → Background worker → NATS publish            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE LAYER                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         PostgreSQL 16                                    ││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────┐    ││
│  │  │                    18 BOUNDED CONTEXT SCHEMAS                    │    ││
│  │  │                                                                  │    ││
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    ││
│  │  │  │  auth  │ │catalog │ │ orders │ │ sales  │ │payments│        │    ││
│  │  │  │7 table │ │14 table│ │6 table │ │13 table│ │2 table │        │    ││
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │    ││
│  │  │                                                                  │    ││
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    ││
│  │  │  │inventory│ │customers│ │ agents │ │analytics│ │market │        │    ││
│  │  │  │5 table │ │5 table │ │3 table │ │4 table │ │9 table │        │    ││
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │    ││
│  │  │                                                                  │    ││
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    ││
│  │  │  │ public │ │  cms   │ │customer│ │ outbox │ │  crm   │        │    ││
│  │  │  │40 table│ │11 table│ │4 table │ │1 table │ │1 table │        │    ││
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │    ││
│  │  │                                                                  │    ││
│  │  │              TOTAL: 125 TABLES                                   │    ││
│  │  └──────────────────────────────────────────────────────────────────┘    ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐        │
│  │       MinIO       │  │    Meilisearch    │  │       Redis       │        │
│  │  (File Storage)   │  │  (Full-text Search)│ │     (Cache)       │        │
│  │  - Images         │  │  - Products        │  │  - Sessions       │        │
│  │  - Receipts       │  │  - Categories      │  │  - API Cache      │        │
│  │  - Labels         │  │                    │  │                   │        │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.4 Service Communication Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICE COMMUNICATION PATTERNS                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  SYNCHRONOUS (HTTP/REST) - Request/Response                               ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

    ┌──────────┐         HTTP GET/POST         ┌──────────┐
    │ Frontend │ ────────────────────────────▶ │  Service │
    │          │ ◀──────────────────────────── │          │
    └──────────┘         JSON Response         └──────────┘

    Example: Customer views product
    ┌──────────┐      GET /products/123       ┌──────────┐
    │Storefront│ ────────────────────────────▶│ Catalog  │
    │          │ ◀──────────────────────────── │ Service  │
    └──────────┘      { product data }         └──────────┘


  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  ASYNCHRONOUS (NATS) - Event-Driven                                       ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

    ┌──────────┐                              ┌──────────┐
    │  Order   │ ─── order.created ─────────▶ │   NATS   │
    │ Service  │                              │ JetStream│
    └──────────┘                              └────┬─────┘
                                                   │
                     ┌─────────────────────────────┼─────────────────────────┐
                     │                             │                         │
                     ▼                             ▼                         ▼
              ┌──────────┐                  ┌──────────┐               ┌──────────┐
              │Inventory │                  │  Agent   │               │  Notif   │
              │ Service  │                  │ Service  │               │ Service  │
              └──────────┘                  └──────────┘               └──────────┘
              (reserve stock)              (calc commission)          (send email)


  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  SERVICE-TO-SERVICE (Internal HTTP)                                       ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

    Example: Order needs to check stock

    ┌──────────┐    GET /internal/stock/check   ┌──────────┐
    │  Order   │ ─────────────────────────────▶ │Inventory │
    │ Service  │ ◀───────────────────────────── │ Service  │
    └──────────┘    { available: true }         └──────────┘


  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  DATABASE PER SERVICE (Schema Isolation)                                  ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │  Auth    │       │ Catalog  │       │  Order   │
    │ Service  │       │ Service  │       │ Service  │
    └────┬─────┘       └────┬─────┘       └────┬─────┘
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │  auth   │        │ catalog │        │ orders  │
    │ schema  │        │ schema  │        │ schema  │
    └─────────┘        └─────────┘        └─────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   PostgreSQL    │
                   │  (Single DB,    │
                   │  Multi-Schema)  │
                   └─────────────────┘
```

## 1.5 DDD Layers Per Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DDD LAYERS - EACH MICROSERVICE                            │
└─────────────────────────────────────────────────────────────────────────────┘

  Example: Order Service (service-order)

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         PRESENTATION LAYER                               │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/handlers/                                                │  │
  │  │  ├── order_handler.go      → HTTP endpoints                       │  │
  │  │  ├── payment_handler.go    → Payment endpoints                    │  │
  │  │  └── webhook_handler.go    → External webhooks                    │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                    │                                     │
  │                                    ▼                                     │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/dto/                                                     │  │
  │  │  ├── order_request.go      → Input validation                     │  │
  │  │  └── order_response.go     → Output formatting                    │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         APPLICATION LAYER                                │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/services/                                                │  │
  │  │  ├── order_service.go      → Business orchestration               │  │
  │  │  ├── payment_service.go    → Payment processing                   │  │
  │  │  └── fulfillment_service.go→ Shipping logic                       │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                    │                                     │
  │  Use Cases:                        │                                     │
  │  - CreateOrder()                   │                                     │
  │  - VerifyPayment()                 │                                     │
  │  - ShipOrder()                     │                                     │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                          DOMAIN LAYER                                    │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/domain/                                                  │  │
  │  │  ├── order.go              → Order aggregate root                 │  │
  │  │  ├── order_item.go         → Order item entity                    │  │
  │  │  ├── payment.go            → Payment entity                       │  │
  │  │  └── order_status.go       → Value objects (status enum)          │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                    │                                     │
  │  Business Rules:                   │                                     │
  │  - Order must have items           │                                     │
  │  - Cannot ship unpaid order        │                                     │
  │  - Stock must be available         │                                     │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                       INFRASTRUCTURE LAYER                               │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/repository/                                              │  │
  │  │  ├── order_repository.go   → Database operations                  │  │
  │  │  └── payment_repository.go → Payment data access                  │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                    │                                     │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/events/                                                  │  │
  │  │  └── publisher.go          → NATS event publishing                │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                    │                                     │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │  internal/external/                                                │  │
  │  │  ├── easyparcel_client.go  → Shipping API                         │  │
  │  │  └── curlec_client.go      → Payment gateway                      │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────────────┘
```

## 1.6 All Services and Ports

| Service | Port | Purpose | URL Pattern |
|---------|------|---------|-------------|
| **Nginx** | 80, 443 | Reverse proxy, SSL | `https://store.kilangdesamurnibatik.com` |
| **Storefront** | 3000 | Customer website | `/` |
| **Admin** | 3001 | Admin dashboard | `/admin` |
| **Warehouse** | 3002 | Warehouse portal | `/warehouse` |
| **Auth Service** | 8001 | Login, register, JWT | `/api/v1/auth/*` |
| **Catalog Service** | 8002 | Products, categories | `/api/v1/products/*` |
| **Inventory Service** | 8003 | Stock, warehouses | `/api/v1/inventory/*` |
| **Customer Service** | 8004 | Customer profiles | `/api/v1/customers/*` |
| **Order Service** | 8005 | Orders, payments | `/api/v1/orders/*` |
| **Agent Service** | 8006 | Agents, commissions | `/api/v1/agents/*` |
| **Reporting Service** | 8007 | Reports, analytics | `/api/v1/reports/*` |
| **Notification Service** | 8008 | Email, SMS | `/api/v1/notifications/*` |
| **Support Service** | 8009 | Tickets, help | `/api/v1/support/*` |
| **Marketplace Service** | 8010 | Shopee, TikTok | `/api/v1/marketplace/*` |

---

# PART 2: CUSTOMER JOURNEY (DETAILED)

## 2.1 Customer Journey Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY - OVERVIEW                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ BROWSE  │───▶│  ADD    │───▶│CHECKOUT │───▶│  PAY    │───▶│ RECEIVE │
  │PRODUCTS │    │TO CART  │    │         │    │         │    │ PACKAGE │
  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ Catalog │    │  Order  │    │Inventory│    │ Payment │    │Shipping │
  │ Service │    │ Service │    │ Service │    │ Service │    │ Service │
  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

## 2.2 Step 1: Customer Registration

### 2.2.1 Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STEP 1: CUSTOMER REGISTRATION                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                   Auth Service
     │                           │                            │
     │  1. Click "Register"      │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  2. Fill form:            │                            │
     │     - Email               │                            │
     │     - Password            │                            │
     │     - First Name          │                            │
     │     - Last Name           │                            │
     │     - Phone               │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  3. POST /api/v1/auth/register
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  4. Validate:
     │                           │                            │     - Email unique?
     │                           │                            │     - Password strong?
     │                           │                            │     - Phone valid?
     │                           │                            │
     │                           │                            │  5. Hash password
     │                           │                            │     (bcrypt, cost 12)
     │                           │                            │
     │                           │                            │  6. Insert to DB:
     │                           │                            │     auth.users
     │                           │                            │
     │                           │                            │  7. Create customer:
     │                           │                            │     public.customers
     │                           │                            │
     │                           │  8. Return JWT token        │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  9. Redirect to homepage  │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
```

### 2.2.2 Registration API Details

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "first_name": "Ahmad",
  "last_name": "Ibrahim",
  "phone": "+60123456789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "customer@example.com",
      "first_name": "Ahmad",
      "last_name": "Ibrahim",
      "role": "customer"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900
  }
}
```

**Database Tables Affected:**

| Table | Action | Fields |
|-------|--------|--------|
| `auth.users` | INSERT | id, email, password_hash, first_name, last_name, phone, role='customer', status='active', created_at |
| `public.customers` | INSERT | id (same as user), email, name, phone, status='active', total_orders=0, total_spent=0 |

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

**JWT Token Details:**
| Field | Value |
|-------|-------|
| Algorithm | HS256 |
| Access Token Expiry | 15 minutes |
| Refresh Token Expiry | 7 days (168 hours) |

---

## 2.3 Step 2: Customer Login

### 2.3.1 Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 2: CUSTOMER LOGIN                               │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                   Auth Service
     │                           │                            │
     │  1. Enter credentials     │                            │
     │     - Email               │                            │
     │     - Password            │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. POST /api/v1/auth/login│
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  3. Find user by email
     │                           │                            │     SELECT FROM auth.users
     │                           │                            │
     │                           │                            │  4. Compare password
     │                           │                            │     bcrypt.compare()
     │                           │                            │
     │                           │                            │  5. Generate tokens:
     │                           │                            │     - Access token (15m)
     │                           │                            │     - Refresh token (7d)
     │                           │                            │
     │                           │                            │  6. Create session:
     │                           │                            │     auth.sessions
     │                           │                            │
     │                           │                            │  7. Update last_login_at
     │                           │                            │
     │                           │  8. Return tokens          │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  9. Store in cookie       │                            │
     │     (httpOnly, secure)    │                            │
     │◀──────────────────────────│                            │
```

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "first_name": "Ahmad",
      "last_name": "Ibrahim",
      "role": "customer",
      "last_login_at": "2026-01-21T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

---

## 2.4 Step 3: Browse Products

### 2.4.1 Browse Products Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STEP 3: BROWSE PRODUCTS                                │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                  Catalog Service
     │                           │                            │
     │  1. Open homepage         │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. GET /api/v1/products   │
     │                           │     ?page=1                │
     │                           │     &limit=20              │
     │                           │     &category=kain-batik   │
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  3. Query database:
     │                           │                            │     catalog.products
     │                           │                            │     catalog.categories
     │                           │                            │     catalog.product_images
     │                           │                            │
     │                           │                            │  4. Check Redis cache
     │                           │                            │     (if available)
     │                           │                            │
     │                           │  5. Return products        │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  6. Display product grid  │                            │
     │◀──────────────────────────│                            │
```

### 2.4.2 Product List API

**Endpoint:** `GET /api/v1/products`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `category` | string | - | Category slug filter |
| `search` | string | - | Search keyword |
| `min_price` | decimal | - | Minimum price (RM) |
| `max_price` | decimal | - | Maximum price (RM) |
| `sort` | string | created_at | Sort field |
| `order` | string | desc | Sort order (asc/desc) |
| `is_featured` | boolean | - | Featured products only |
| `in_stock` | boolean | - | In stock only |

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Kain Batik Songket Premium",
        "slug": "kain-batik-songket-premium",
        "short_desc": "Kain batik songket berkualiti tinggi",
        "base_price": 150.00,
        "sale_price": 120.00,
        "currency": "MYR",
        "stock_quantity": 50,
        "is_featured": true,
        "category": {
          "id": "uuid",
          "name": "Kain Batik",
          "slug": "kain-batik"
        },
        "images": [
          {
            "url": "https://storage.../image1.jpg",
            "is_primary": true
          }
        ],
        "created_at": "2026-01-15T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### 2.4.3 Product Categories

| Category | Slug | Description |
|----------|------|-------------|
| Kain Batik | kain-batik | Traditional batik fabric |
| Baju Kurung | baju-kurung | Traditional Malay dress |
| Kebaya | kebaya | Traditional blouse |
| Baju Melayu | baju-melayu | Traditional Malay men's wear |
| Selendang | selendang | Shawl/scarf |
| Aksesori | aksesori | Accessories |

---

## 2.5 Step 4: View Product Details

### 2.5.1 Product Detail Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STEP 4: VIEW PRODUCT DETAILS                            │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                  Catalog Service
     │                           │                            │
     │  1. Click on product      │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. GET /api/v1/products/{slug}
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  3. Query:
     │                           │                            │     - Product details
     │                           │                            │     - Variants (sizes)
     │                           │                            │     - Images (all)
     │                           │                            │     - Reviews
     │                           │                            │     - Related products
     │                           │                            │
     │                           │                            │  4. Increment view_count
     │                           │                            │
     │                           │  5. Return full product    │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  6. Display:              │                            │
     │     - Images gallery      │                            │
     │     - Price               │                            │
     │     - Size selector       │                            │
     │     - Add to cart button  │                            │
     │◀──────────────────────────│                            │
```

**Endpoint:** `GET /api/v1/products/{slug}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Kain Batik Songket Premium",
    "slug": "kain-batik-songket-premium",
    "description": "Kain batik songket berkualiti tinggi dari Terengganu...",
    "short_desc": "Kain batik songket berkualiti tinggi",
    "sku": "KBS-001",
    "base_price": 150.00,
    "sale_price": 120.00,
    "cost": 80.00,
    "weight": 0.5,
    "stock_quantity": 50,
    "is_active": true,
    "is_featured": true,
    "view_count": 1250,
    "product_type": "unit",
    "unit_type": "piece",
    "min_order_qty": 1,
    "fabric_width": 1.15,
    "fabric_composition": "100% Cotton",
    "care_instructions": "Hand wash only",
    "category": {
      "id": "uuid",
      "name": "Kain Batik",
      "slug": "kain-batik"
    },
    "variants": [
      {
        "id": "uuid",
        "name": "2 Meter",
        "sku": "KBS-001-2M",
        "price": 120.00,
        "stock_quantity": 20,
        "attributes": {
          "length": "2m",
          "color": "Blue"
        }
      },
      {
        "id": "uuid",
        "name": "3 Meter",
        "sku": "KBS-001-3M",
        "price": 180.00,
        "stock_quantity": 15,
        "attributes": {
          "length": "3m",
          "color": "Blue"
        }
      }
    ],
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.../image1.jpg",
        "alt_text": "Front view",
        "is_primary": true,
        "sort_order": 1
      },
      {
        "id": "uuid",
        "url": "https://storage.../image2.jpg",
        "alt_text": "Detail view",
        "is_primary": false,
        "sort_order": 2
      }
    ],
    "reviews": {
      "average_rating": 4.5,
      "total_reviews": 28,
      "rating_breakdown": {
        "5": 15,
        "4": 8,
        "3": 3,
        "2": 1,
        "1": 1
      }
    },
    "related_products": [
      {
        "id": "uuid",
        "name": "Kain Batik Canting",
        "slug": "kain-batik-canting",
        "base_price": 100.00,
        "image_url": "https://storage.../related1.jpg"
      }
    ],
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-01-20T14:30:00Z"
  }
}
```

---

## 2.6 Step 5: Add to Cart

### 2.6.1 Add to Cart Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 5: ADD TO CART                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                   Order Service
     │                           │                            │
     │  1. Select variant        │                            │
     │     (size/color)          │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  2. Enter quantity        │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  3. Click "Add to Cart"   │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  4. POST /api/v1/cart/items│
     │                           │     {                      │
     │                           │       product_id,          │
     │                           │       variant_id,          │
     │                           │       quantity             │
     │                           │     }                      │
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  5. Get/create cart
     │                           │                            │     (by user_id or
     │                           │                            │      session_id)
     │                           │                            │
     │                           │                            │  6. Check stock
     │                           │                            │
     │                           │                            │  7. Add item to cart
     │                           │                            │     sales.cart_items
     │                           │                            │
     │                           │  8. Return updated cart    │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  9. Update cart icon      │                            │
     │     (show item count)     │                            │
     │◀──────────────────────────│                            │
```

**Endpoint:** `POST /api/v1/cart/items`

**Request:**
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "variant_id": "660e8400-e29b-41d4-a716-446655440001",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart-uuid",
      "items": [
        {
          "id": "item-uuid",
          "product_id": "550e8400-e29b-41d4-a716-446655440000",
          "variant_id": "660e8400-e29b-41d4-a716-446655440001",
          "product_name": "Kain Batik Songket Premium",
          "variant_name": "2 Meter",
          "sku": "KBS-001-2M",
          "image_url": "https://storage.../image1.jpg",
          "unit_price": 120.00,
          "quantity": 2,
          "subtotal": 240.00
        }
      ],
      "item_count": 1,
      "total_quantity": 2,
      "subtotal": 240.00,
      "created_at": "2026-01-21T10:00:00Z",
      "updated_at": "2026-01-21T10:30:00Z"
    }
  }
}
```

**Database Tables:**

| Table | Action | Description |
|-------|--------|-------------|
| `sales.carts` | INSERT/UPDATE | Cart record |
| `sales.cart_items` | INSERT | Cart item |

**Cart Identification:**
- **Logged in user:** Cart linked by `customer_id`
- **Guest user:** Cart linked by `session_id` (stored in cookie)

---

## 2.7 Step 6: Checkout

### 2.7.1 Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STEP 6: CHECKOUT                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                  Multiple Services
     │                           │                            │
     │  1. Click "Checkout"      │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. GET /api/v1/cart       │
     │                           │───────────────────────────▶│ Order Service
     │                           │                            │
     │                           │  3. Check stock            │
     │                           │───────────────────────────▶│ Inventory Service
     │                           │                            │
     │  4. Display checkout form │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  5. Enter shipping info:  │                            │
     │     - Full name           │                            │
     │     - Phone               │                            │
     │     - Address line 1      │                            │
     │     - Address line 2      │                            │
     │     - City                │                            │
     │     - State               │                            │
     │     - Postcode            │                            │
     │     - Country             │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  6. GET shipping rates     │
     │                           │───────────────────────────▶│ EasyParcel API
     │                           │                            │
     │  7. Display shipping      │                            │
     │     options               │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  8. Select shipping       │                            │
     │     method                │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  9. Select payment method │                            │
     │     - Bank Transfer       │                            │
     │     - Online Banking      │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  10. Review order summary │                            │
     │◀──────────────────────────│                            │
```

### 2.7.2 Shipping Address Format

**Malaysia Address Fields:**

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `full_name` | string | Yes | "Ahmad Ibrahim" |
| `phone` | string | Yes | "+60123456789" |
| `email` | string | Yes | "ahmad@example.com" |
| `address_line1` | string | Yes | "No. 123, Jalan Batik" |
| `address_line2` | string | No | "Taman Songket" |
| `city` | string | Yes | "Shah Alam" |
| `state` | string | Yes | "Selangor" |
| `postcode` | string | Yes | "40000" |
| `country` | string | Yes | "MY" (Malaysia) |

**Malaysian States:**

| Code | Name |
|------|------|
| JHR | Johor |
| KDH | Kedah |
| KTN | Kelantan |
| MLK | Melaka |
| NSN | Negeri Sembilan |
| PHG | Pahang |
| PNG | Pulau Pinang |
| PRK | Perak |
| PLS | Perlis |
| SBH | Sabah |
| SWK | Sarawak |
| SGR | Selangor |
| TRG | Terengganu |
| KUL | W.P. Kuala Lumpur |
| LBN | W.P. Labuan |
| PJY | W.P. Putrajaya |

### 2.7.3 Shipping Methods (via EasyParcel)

| Courier | Service | Estimated Days | Price Range |
|---------|---------|----------------|-------------|
| J&T Express | Standard | 2-4 days | RM 6-15 |
| Pos Laju | Next Day | 1-2 days | RM 8-20 |
| DHL eCommerce | Standard | 3-5 days | RM 7-18 |
| Ninja Van | Standard | 2-3 days | RM 6-15 |
| City-Link | Express | 1-2 days | RM 10-25 |

### 2.7.4 Payment Methods

| Method | Code | Description | Requires Receipt |
|--------|------|-------------|------------------|
| Bank Transfer | `bank_transfer` | Manual bank transfer | Yes |
| Online Banking (FPX) | `fpx` | Curlec FPX gateway | No |
| Credit/Debit Card | `card` | Curlec card payment | No |

**Bank Transfer Details:**

| Bank | Account Name | Account Number |
|------|--------------|----------------|
| Maybank | Kilang Desa Murni Batik Sdn Bhd | 1234567890 |
| CIMB | Kilang Desa Murni Batik Sdn Bhd | 0987654321 |
| Bank Islam | Kilang Desa Murni Batik Sdn Bhd | 1122334455 |

---

## 2.8 Step 7: Place Order

### 2.8.1 Place Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 7: PLACE ORDER                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                   Order Service
     │                           │                            │
     │  1. Click "Place Order"   │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. POST /api/v1/orders    │
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  ┌─────────────────┐
     │                           │                            │  │  TRANSACTION    │
     │                           │                            │  │  BEGIN          │
     │                           │                            │  └─────────────────┘
     │                           │                            │
     │                           │                            │  3. Generate order number
     │                           │                            │     Format: ORD + YYYYMMDD + XXXX
     │                           │                            │     Example: ORD202601210001
     │                           │                            │
     │                           │                            │  4. Create order record
     │                           │                            │     public.orders
     │                           │                            │
     │                           │                            │  5. Create order items
     │                           │                            │     public.order_items
     │                           │                            │
     │                           │                            │  6. Reserve stock
     │                           │                            │     ────────────────────▶ Inventory
     │                           │                            │
     │                           │                            │  7. Update stock_items
     │                           │                            │     (reserved_quantity)
     │                           │                            │
     │                           │                            │  8. Create reservation
     │                           │                            │     public.stock_reservations
     │                           │                            │
     │                           │                            │  9. Clear cart
     │                           │                            │     sales.cart_items
     │                           │                            │
     │                           │                            │  10. Create timeline
     │                           │                            │      orders.order_timeline
     │                           │                            │
     │                           │                            │  ┌─────────────────┐
     │                           │                            │  │  TRANSACTION    │
     │                           │                            │  │  COMMIT         │
     │                           │                            │  └─────────────────┘
     │                           │                            │
     │                           │                            │  11. Publish event
     │                           │                            │      "order.created"
     │                           │                            │      ───────▶ NATS
     │                           │                            │
     │                           │  12. Return order details  │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  13. Show confirmation    │                            │
     │      page with order      │                            │
     │      number               │                            │
     │◀──────────────────────────│                            │
```

**Endpoint:** `POST /api/v1/orders`

**Request:**
```json
{
  "shipping_address": {
    "full_name": "Ahmad Ibrahim",
    "phone": "+60123456789",
    "email": "ahmad@example.com",
    "address_line1": "No. 123, Jalan Batik",
    "address_line2": "Taman Songket",
    "city": "Shah Alam",
    "state": "Selangor",
    "postcode": "40000",
    "country": "MY"
  },
  "shipping_method": "J&T Express",
  "courier_service_id": "jt-standard",
  "courier_name": "J&T Express",
  "payment_method": "bank_transfer",
  "customer_notes": "Please call before delivery"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid",
      "order_number": "ORD202601210001",
      "status": "pending",
      "payment_status": "unpaid",
      "items": [
        {
          "product_name": "Kain Batik Songket Premium",
          "variant_name": "2 Meter",
          "quantity": 2,
          "unit_price": 120.00,
          "subtotal": 240.00
        }
      ],
      "subtotal": 240.00,
      "shipping_cost": 8.00,
      "discount": 0.00,
      "tax": 0.00,
      "total": 248.00,
      "shipping_address": {...},
      "payment_method": {
        "code": "bank_transfer",
        "name": "Bank Transfer",
        "instructions": "Please transfer to...",
        "bank_details": [
          {
            "bank": "Maybank",
            "account_name": "Kilang Desa Murni Batik Sdn Bhd",
            "account_number": "1234567890"
          }
        ]
      },
      "created_at": "2026-01-21T11:00:00Z"
    }
  }
}
```

### 2.8.2 Order Number Format

```
ORD + YYYYMMDD + XXXX

Where:
- ORD       = Prefix
- YYYYMMDD  = Date (e.g., 20260121)
- XXXX      = Sequential number (0001-9999)

Example: ORD202601210001
```

### 2.8.3 Order Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORDER STATUS FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ PENDING │────▶│PROCESSING────▶│ SHIPPED │────▶│DELIVERED│────▶│COMPLETED│
  └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
       │
       │ (if cancelled)
       ▼
  ┌─────────┐
  │CANCELLED│
  └─────────┘
```

**Status Definitions:**

| Status | Description | Next Status |
|--------|-------------|-------------|
| `pending` | Order created, awaiting payment | processing, cancelled |
| `processing` | Payment verified, preparing order | shipped, cancelled |
| `shipped` | Order dispatched | delivered |
| `delivered` | Customer received package | completed |
| `completed` | Order finalized | - |
| `cancelled` | Order cancelled | - |

### 2.8.4 Payment Status Flow

```
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │  UNPAID │────▶│ PENDING │────▶│  PAID   │
  └─────────┘     └─────────┘     └─────────┘
       │               │
       │               │ (if rejected)
       ▼               ▼
  ┌─────────┐     ┌─────────┐
  │ EXPIRED │     │ FAILED  │
  └─────────┘     └─────────┘
```

**Payment Status Definitions:**

| Status | Description |
|--------|-------------|
| `unpaid` | No payment received |
| `pending` | Receipt uploaded, awaiting verification |
| `paid` | Payment verified |
| `failed` | Payment rejected |
| `expired` | Payment not received within deadline |

---

## 2.9 Step 8: Payment (Bank Transfer)

### 2.9.1 Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 8: PAYMENT (BANK TRANSFER)                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                   Order Service
     │                           │                            │
     │  1. View order details    │                            │
     │     with bank info        │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  2. Transfer money to     │                            │
     │     bank account          │                            │
     │     (using banking app)   │                            │
     │                           │                            │
     │  3. Take screenshot of    │                            │
     │     transfer receipt      │                            │
     │                           │                            │
     │  4. Go to "My Orders"     │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  5. Click "Upload Receipt"│                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  6. Fill receipt form:    │                            │
     │     - Depositor name      │                            │
     │     - Bank name           │                            │
     │     - Transfer date       │                            │
     │     - Reference number    │                            │
     │     - Amount              │                            │
     │     - Receipt image       │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  7. POST /api/v1/payments/upload-receipt
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  8. Upload image to MinIO
     │                           │                            │     bucket: payment-receipts
     │                           │                            │
     │                           │                            │  9. Create receipt record
     │                           │                            │     payments.payment_receipts
     │                           │                            │
     │                           │                            │  10. Update order
     │                           │                            │      payment_status = 'pending'
     │                           │                            │
     │                           │                            │  11. Publish event
     │                           │                            │      "payment.pending"
     │                           │                            │
     │                           │  12. Return success        │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  13. Show "Receipt        │                            │
     │      uploaded, waiting    │                            │
     │      for verification"    │                            │
     │◀──────────────────────────│                            │
```

**Endpoint:** `POST /api/v1/payments/upload-receipt`

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | uuid | Yes | Order UUID |
| `depositor_name` | string | Yes | Name on bank transfer |
| `bank_name` | string | Yes | Bank used for transfer |
| `deposit_date` | date | Yes | Date of transfer (YYYY-MM-DD) |
| `reference_number` | string | Yes | Bank reference number |
| `amount` | decimal | Yes | Amount transferred |
| `receipt_image` | file | Yes | Receipt image (JPG/PNG, max 5MB) |

**Date Format:** `YYYY-MM-DD` (e.g., `2026-01-21`)

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": "receipt-uuid",
      "order_id": "order-uuid",
      "depositor_name": "Ahmad Ibrahim",
      "bank_name": "Maybank",
      "deposit_date": "2026-01-21",
      "reference_number": "FT12345678",
      "amount": 248.00,
      "receipt_url": "https://storage.../receipts/receipt-uuid.jpg",
      "status": "pending",
      "uploaded_at": "2026-01-21T11:30:00Z"
    },
    "order": {
      "id": "order-uuid",
      "order_number": "ORD202601210001",
      "payment_status": "pending"
    }
  }
}
```

### 2.9.2 Payment Receipt Status

| Status | Description |
|--------|-------------|
| `pending` | Uploaded, awaiting admin verification |
| `verified` | Admin verified, payment accepted |
| `rejected` | Admin rejected, invalid receipt |

---

## 2.10 Step 9: Order Tracking

### 2.10.1 Order Tracking Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STEP 9: ORDER TRACKING                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer                    Frontend                   Order Service
     │                           │                            │
     │  1. Go to "My Orders"     │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. GET /api/v1/orders     │
     │                           │───────────────────────────▶│
     │                           │                            │
     │  3. Display orders list   │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  4. Click on order        │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  5. GET /api/v1/orders/{id}│
     │                           │───────────────────────────▶│
     │                           │                            │
     │  6. Display:              │                            │
     │     - Order details       │                            │
     │     - Status timeline     │                            │
     │     - Tracking number     │                            │
     │     - Tracking link       │                            │
     │◀──────────────────────────│                            │
```

**Order Timeline Example:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORDER TIMELINE                                     │
│                         ORD202601210001                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  ✓ Order Placed                           21 Jan 2026, 11:00 AM
    └─ Order created successfully

  ✓ Payment Received                       21 Jan 2026, 11:30 AM
    └─ Receipt uploaded

  ✓ Payment Verified                       21 Jan 2026, 02:00 PM
    └─ Verified by Admin

  ✓ Order Processing                       21 Jan 2026, 02:15 PM
    └─ Preparing your order

  ✓ Order Shipped                          22 Jan 2026, 10:00 AM
    └─ Tracking: JT123456789
    └─ Courier: J&T Express

  ○ Out for Delivery                       (Pending)

  ○ Delivered                              (Pending)
```

---

# PART 3: ADMIN JOURNEY (DETAILED)

## 3.1 Admin Journey Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN JOURNEY - OVERVIEW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │   LOGIN     │───▶│  DASHBOARD  │───▶│   MANAGE    │───▶│  REPORTS    │
  │             │    │             │    │             │    │             │
  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌───────────┐   ┌───────────┐   ┌───────────┐
     │  ORDERS   │   │ PRODUCTS  │   │ CUSTOMERS │
     └───────────┘   └───────────┘   └───────────┘
```

## 3.2 Admin Roles and Permissions

### 3.2.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROLE HIERARCHY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │   SUPER_ADMIN   │
                        │  (Full Access)  │
                        └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
               ┌─────────────┐    ┌─────────────┐
               │    ADMIN    │    │   (Other)   │
               │ (Most Access│    │             │
               └──────┬──────┘    └─────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌───────────┐ ┌───────────┐ ┌───────────┐
  │ WAREHOUSE │ │   AGENT   │ │ CUSTOMER  │
  │           │ │           │ │           │
  └───────────┘ └───────────┘ └───────────┘
```

### 3.2.2 Permission Matrix

| Module | Action | super_admin | admin | warehouse | agent | customer |
|--------|--------|-------------|-------|-----------|-------|----------|
| **Products** | view | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Products** | create | ✓ | ✓ | - | - | - |
| **Products** | edit | ✓ | ✓ | - | - | - |
| **Products** | delete | ✓ | ✓ | - | - | - |
| **Orders** | view_all | ✓ | ✓ | ✓ | - | - |
| **Orders** | view_own | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Orders** | update_status | ✓ | ✓ | ✓ | - | - |
| **Orders** | cancel | ✓ | ✓ | - | - | - |
| **Payments** | view | ✓ | ✓ | - | - | - |
| **Payments** | verify | ✓ | ✓ | - | - | - |
| **Payments** | reject | ✓ | ✓ | - | - | - |
| **Inventory** | view | ✓ | ✓ | ✓ | - | - |
| **Inventory** | adjust | ✓ | ✓ | ✓ | - | - |
| **Inventory** | transfer | ✓ | ✓ | ✓ | - | - |
| **Customers** | view | ✓ | ✓ | - | ✓ | - |
| **Customers** | edit | ✓ | ✓ | - | - | - |
| **Agents** | view | ✓ | ✓ | - | ✓ | - |
| **Agents** | manage | ✓ | ✓ | - | - | - |
| **Reports** | view | ✓ | ✓ | - | - | - |
| **Settings** | manage | ✓ | - | - | - | - |
| **Users** | manage | ✓ | - | - | - | - |

---

## 3.3 Admin: Verify Payment

### 3.3.1 Payment Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ADMIN: VERIFY PAYMENT RECEIPT                            │
└─────────────────────────────────────────────────────────────────────────────┘

  Admin                       Frontend                   Order Service
     │                           │                            │
     │  1. Go to Payments page   │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. GET /api/v1/admin/payments/pending
     │                           │───────────────────────────▶│
     │                           │                            │
     │  3. Display pending       │                            │
     │     receipts list         │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  4. Click on receipt      │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  5. Display receipt:      │                            │
     │     - Receipt image       │                            │
     │     - Order details       │                            │
     │     - Amount              │                            │
     │     - Bank reference      │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  6. Admin checks:         │                            │
     │     - Amount matches?     │                            │
     │     - Reference valid?    │                            │
     │     - Date correct?       │                            │
     │                           │                            │
     │  7a. Click "Verify"       │                            │
     │      (if valid)           │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  8. PUT /api/v1/admin/payments/{id}/verify
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  9. Update receipt
     │                           │                            │     status = 'verified'
     │                           │                            │     verified_by = admin_id
     │                           │                            │     verified_at = NOW()
     │                           │                            │
     │                           │                            │  10. Update order
     │                           │                            │      payment_status = 'paid'
     │                           │                            │      status = 'processing'
     │                           │                            │
     │                           │                            │  11. Create timeline entry
     │                           │                            │
     │                           │                            │  12. Publish event
     │                           │                            │      "payment.verified"
     │                           │                            │      ───────▶ NATS
     │                           │                            │
     │                           │  13. Return success        │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  14. Show success message │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │                           │      Notification Service  │
     │                           │             │◀─────────────│
     │                           │             │              │
     │                           │             │  15. Send email
     │                           │             │      to customer
     │                           │             │
```

**Endpoint (Verify):** `PUT /api/v1/admin/payments/{id}/verify`

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": "receipt-uuid",
      "status": "verified",
      "verified_by": "admin-uuid",
      "verified_at": "2026-01-21T14:00:00Z"
    },
    "order": {
      "id": "order-uuid",
      "order_number": "ORD202601210001",
      "payment_status": "paid",
      "status": "processing"
    }
  }
}
```

### 3.3.2 Reject Payment Flow

**Endpoint (Reject):** `PUT /api/v1/admin/payments/{id}/reject`

**Request:**
```json
{
  "rejection_reason": "Amount does not match order total"
}
```

**Common Rejection Reasons:**
- Amount does not match order total
- Receipt image is unclear/unreadable
- Invalid reference number
- Duplicate submission
- Transfer date is invalid

---

## 3.4 Admin: Manage Products

### 3.4.1 Create Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ADMIN: CREATE NEW PRODUCT                               │
└─────────────────────────────────────────────────────────────────────────────┘

  Admin                       Frontend                  Catalog Service
     │                           │                            │
     │  1. Go to Products page   │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  2. Click "Add Product"   │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  3. Fill product form:    │                            │
     │                           │                            │
     │     BASIC INFO:           │                            │
     │     - Name                │                            │
     │     - Description         │                            │
     │     - Category            │                            │
     │     - SKU                 │                            │
     │                           │                            │
     │     PRICING:              │                            │
     │     - Base Price          │                            │
     │     - Sale Price          │                            │
     │     - Cost Price          │                            │
     │                           │                            │
     │     INVENTORY:            │                            │
     │     - Stock Quantity      │                            │
     │     - Low Stock Threshold │                            │
     │                           │                            │
     │     VARIANTS:             │                            │
     │     - Size options        │                            │
     │     - Color options       │                            │
     │                           │                            │
     │     IMAGES:               │                            │
     │     - Main image          │                            │
     │     - Gallery images      │                            │
     │                           │                            │
     │     BATIK SPECIFIC:       │                            │
     │     - Fabric Width        │                            │
     │     - Fabric Composition  │                            │
     │     - Care Instructions   │                            │
     │                           │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  4. Click "Save"          │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  5. Upload images to MinIO │
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │  6. POST /api/v1/admin/products
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  7. Create product
     │                           │                            │     catalog.products
     │                           │                            │
     │                           │                            │  8. Create variants
     │                           │                            │     catalog.product_variants
     │                           │                            │
     │                           │                            │  9. Create images
     │                           │                            │     catalog.product_images
     │                           │                            │
     │                           │                            │  10. Create stock
     │                           │                            │      inventory.stock_items
     │                           │                            │
     │                           │                            │  11. Index in Meilisearch
     │                           │                            │
     │                           │  12. Return product        │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  13. Show success &       │                            │
     │      redirect to list     │                            │
     │◀──────────────────────────│                            │
```

### 3.4.2 Product Fields

**Basic Information:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string(200) | Yes | Product name |
| `slug` | string(200) | Auto | URL-friendly name |
| `description` | text | No | Full description |
| `short_desc` | string(500) | No | Brief description |
| `sku` | string(100) | No | Stock keeping unit |
| `category_id` | uuid | Yes | Category reference |

**Pricing:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `base_price` | decimal(10,2) | Yes | Regular price (RM) |
| `sale_price` | decimal(10,2) | No | Discounted price (RM) |
| `cost` | decimal(10,2) | No | Cost price (RM) |

**Inventory:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stock_quantity` | integer | Yes | Available stock |
| `low_stock_thresh` | integer | No | Low stock alert level |
| `manage_stock` | boolean | No | Track inventory (default: true) |

**Physical Attributes:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `weight` | decimal(10,2) | No | Weight in KG |
| `dimensions` | jsonb | No | {length, width, height} in CM |

**Batik Specific:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fabric_width` | decimal(5,2) | No | Width in meters |
| `fabric_composition` | string(255) | No | Material composition |
| `care_instructions` | text | No | Washing instructions |
| `is_tailorable` | boolean | No | Can be custom tailored |

**Product Types:**

| Type | Description |
|------|-------------|
| `unit` | Sold as single unit |
| `fabric` | Sold by length (meters) |
| `bundle` | Product bundle |

---

## 3.5 Admin: Process Orders

### 3.5.1 Order Fulfillment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ADMIN: SHIP ORDER (FULFILLMENT)                          │
└─────────────────────────────────────────────────────────────────────────────┘

  Admin/Warehouse             Frontend                   Order Service
     │                           │                            │
     │  1. Go to Orders page     │                            │
     │     Filter: "Processing"  │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  2. GET /api/v1/admin/orders?status=processing
     │                           │───────────────────────────▶│
     │                           │                            │
     │  3. Display orders list   │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  4. Click on order        │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │  5. Click "Ship Order"    │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  6. Request AWB from EasyParcel
     │                           │───────────────────────────▶│ EasyParcel API
     │                           │                            │
     │  7. Display shipping form │                            │
     │     with pre-filled info: │                            │
     │     - AWB Number          │                            │
     │     - Courier             │                            │
     │     - Label URL           │                            │
     │◀──────────────────────────│                            │
     │                           │                            │
     │  8. Confirm & Print Label │                            │
     │──────────────────────────▶│                            │
     │                           │                            │
     │                           │  9. POST /api/v1/admin/orders/{id}/ship
     │                           │───────────────────────────▶│
     │                           │                            │
     │                           │                            │  10. Create fulfillment
     │                           │                            │      public.order_fulfillments
     │                           │                            │
     │                           │                            │  11. Update order
     │                           │                            │      status = 'shipped'
     │                           │                            │      shipped_at = NOW()
     │                           │                            │
     │                           │                            │  12. Deduct stock
     │                           │                            │      (fulfill reservation)
     │                           │                            │
     │                           │                            │  13. Create timeline entry
     │                           │                            │
     │                           │                            │  14. Publish event
     │                           │                            │      "order.shipped"
     │                           │                            │
     │                           │  15. Return success        │
     │                           │◀───────────────────────────│
     │                           │                            │
     │  16. Print shipping label │                            │
     │◀──────────────────────────│                            │
```

**Endpoint:** `POST /api/v1/admin/orders/{id}/ship`

**Request:**
```json
{
  "courier_code": "jt",
  "courier_name": "J&T Express",
  "awb_number": "JT123456789",
  "tracking_url": "https://www.jtexpress.my/tracking?no=JT123456789",
  "shipping_cost": 8.00,
  "weight": 0.5,
  "notes": "Package contains fragile items"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fulfillment": {
      "id": "fulfillment-uuid",
      "order_id": "order-uuid",
      "status": "shipped",
      "courier_code": "jt",
      "courier_name": "J&T Express",
      "awb_number": "JT123456789",
      "tracking_url": "https://www.jtexpress.my/tracking?no=JT123456789",
      "label_url": "https://storage.../labels/label-uuid.pdf",
      "shipped_at": "2026-01-22T10:00:00Z"
    },
    "order": {
      "id": "order-uuid",
      "order_number": "ORD202601210001",
      "status": "shipped"
    }
  }
}
```

---

# PART 4: DATABASE SPECIFICATION

## 4.1 All Schemas and Tables

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA MAP                                  │
│                    PostgreSQL 16 - 18 Schemas, 125 Tables                   │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
  │     AUTH        │    │    CATALOG      │    │    INVENTORY    │
  │   (7 tables)    │    │  (14 tables)    │    │   (5 tables)    │
  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
  │ users           │    │ products        │    │ warehouses      │
  │ roles           │    │ product_variants│    │ stock_items     │
  │ permissions     │    │ product_images  │    │ stock_movements │
  │ role_permissions│    │ categories      │    │ stock_transfers │
  │ user_roles      │    │ colors          │    │ stock_transfer_ │
  │ sessions        │    │ fabric_designs  │    │   items         │
  │ password_resets │    │ size_charts     │    └─────────────────┘
  └─────────────────┘    │ product_colors  │
                         │ product_bundles │
                         │ bundle_items    │
                         │ discounts       │
                         │ discount_usage  │
                         │ newsletter_     │
                         │   subscribers   │
                         │ product_        │
                         │   recommendations│
                         └─────────────────┘

  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
  │     ORDERS      │    │    PAYMENTS     │    │     AGENTS      │
  │   (6 tables)    │    │   (2 tables)    │    │   (3 tables)    │
  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
  │ order_agent_    │    │ payment_methods │    │ agents          │
  │   commission    │    │ payment_receipts│    │ commissions     │
  │ order_payments  │    └─────────────────┘    │ teams           │
  │ order_pickup    │                           └─────────────────┘
  │ order_preorder  │
  │ order_shipping  │
  │ order_timeline  │
  └─────────────────┘

  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
  │   ANALYTICS     │    │   CUSTOMERS     │    │   MARKETPLACE   │
  │   (4 tables)    │    │   (5 tables)    │    │   (9 tables)    │
  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
  │ customer_cohorts│    │ customers       │    │ connections     │
  │ daily_aggregates│    │ customer_       │    │ product_mappings│
  │ funnel_events   │    │   segments      │    │ variant_mappings│
  │ page_views      │    │ customer_       │    │ category_       │
  └─────────────────┘    │   segment_      │    │   mappings      │
                         │   assignments   │    │ orders          │
                         │ customer_       │    │ imported_       │
                         │   activities    │    │   products      │
                         │ customer_notes  │    │ sync_jobs       │
                         └─────────────────┘    │ inventory_      │
                                                │   sync_logs     │
                                                │ webhook_events  │
                                                └─────────────────┘
```

## 4.2 Date/Time Formats

| Field Type | Format | Example |
|------------|--------|---------|
| `date` | YYYY-MM-DD | 2026-01-21 |
| `time` | HH:MM:SS | 14:30:00 |
| `timestamp` | ISO 8601 | 2026-01-21T14:30:00Z |
| `timestamp with time zone` | ISO 8601 + TZ | 2026-01-21T14:30:00+08:00 |

**Timezone:** All timestamps stored in UTC, converted to `Asia/Kuala_Lumpur` (UTC+8) for display.

## 4.3 Key Table Specifications

### 4.3.1 auth.users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| email | varchar(255) | NO | - | Unique email |
| password_hash | varchar(255) | NO | - | bcrypt hash |
| first_name | varchar(100) | YES | - | First name |
| last_name | varchar(100) | YES | - | Last name |
| phone | varchar(20) | YES | - | Phone number |
| avatar_url | varchar(500) | YES | - | Profile picture |
| email_verified_at | timestamp | YES | - | Verification date |
| status | varchar(20) | YES | 'active' | active/inactive/suspended |
| role | varchar(20) | YES | 'customer' | customer/admin/agent/warehouse/super_admin |
| last_login_at | timestamp | YES | - | Last login |
| created_at | timestamp | YES | CURRENT_TIMESTAMP | Created date |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP | Updated date |
| deleted_at | timestamp | YES | - | Soft delete |

### 4.3.2 public.orders

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_number | varchar(50) | NO | - | ORD + date + seq |
| customer_id | uuid | NO | - | Customer FK |
| agent_id | uuid | YES | - | Agent FK (if referred) |
| status | varchar(20) | YES | 'pending' | Order status |
| payment_status | varchar(30) | YES | 'unpaid' | Payment status |
| payment_method_code | varchar(50) | YES | - | Payment method |
| subtotal | decimal(12,2) | YES | 0 | Items total |
| shipping_cost | decimal(10,2) | YES | 0 | Shipping fee |
| discount | decimal(10,2) | YES | 0 | Discount amount |
| tax | decimal(10,2) | YES | 0 | Tax amount |
| total | decimal(12,2) | YES | 0 | Grand total |
| agent_commission | decimal(10,2) | YES | 0 | Agent commission |
| shipping_address | jsonb | YES | - | Address JSON |
| shipping_method | varchar(50) | YES | - | Courier service |
| tracking_number | varchar(100) | YES | - | AWB number |
| customer_notes | text | YES | - | Customer notes |
| admin_notes | text | YES | - | Internal notes |
| free_shipping | boolean | YES | false | Free shipping flag |
| order_source | varchar(30) | YES | 'website' | website/agent/marketplace |
| is_preorder | boolean | YES | false | Pre-order flag |
| created_at | timestamp | YES | CURRENT_TIMESTAMP | Order date |
| processed_at | timestamp | YES | - | Processing date |
| shipped_at | timestamp | YES | - | Ship date |
| delivered_at | timestamp | YES | - | Delivery date |
| cancelled_at | timestamp | YES | - | Cancel date |
| version | bigint | NO | 1 | Optimistic lock |

### 4.3.3 payments.payment_receipts

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Order FK |
| payment_method_id | uuid | NO | - | Payment method FK |
| depositor_name | varchar(100) | NO | - | Transfer from name |
| deposit_date | date | NO | - | Transfer date |
| reference_number | varchar(100) | NO | - | Bank reference |
| bank_name | varchar(100) | NO | - | Bank used |
| amount | decimal(10,2) | NO | - | Amount transferred |
| receipt_url | text | NO | - | Receipt image URL |
| status | varchar(20) | YES | 'pending' | pending/verified/rejected |
| verified_by | uuid | YES | - | Admin who verified |
| verified_at | timestamp | YES | - | Verification date |
| rejection_reason | text | YES | - | Reject reason |
| notes | text | YES | - | Additional notes |
| uploaded_at | timestamp | YES | CURRENT_TIMESTAMP | Upload date |
| idempotency_key | varchar(64) | YES | - | Prevent duplicates |

---

# PART 5: EXTERNAL INTEGRATIONS

## 5.1 EasyParcel Integration (Shipping)

### 5.1.1 Get Shipping Rates

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EASYPARCEL: GET RATES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  Order Service                                        EasyParcel API
       │                                                    │
       │  1. POST /api/v1/rate_checking                     │
       │       {                                            │
       │         "from_postcode": "68100",                  │
       │         "to_postcode": "40000",                    │
       │         "weight": 0.5,                             │
       │         "length": 30,                              │
       │         "width": 20,                               │
       │         "height": 10                               │
       │       }                                            │
       │───────────────────────────────────────────────────▶│
       │                                                    │
       │  2. Response with available couriers               │
       │◀───────────────────────────────────────────────────│
       │                                                    │
```

**Response:**
```json
{
  "rates": [
    {
      "service_id": "EP-CS0A7",
      "courier_name": "J&T Express",
      "service_name": "Standard",
      "price": 8.00,
      "estimated_delivery": "2-4 days"
    },
    {
      "service_id": "EP-CS0B3",
      "courier_name": "Pos Laju",
      "service_name": "Next Day",
      "price": 12.00,
      "estimated_delivery": "1-2 days"
    }
  ]
}
```

### 5.1.2 Create AWB (Airway Bill)

```
Order Service                                        EasyParcel API
     │                                                    │
     │  1. POST /api/v1/order_submit                      │
     │       {                                            │
     │         "service_id": "EP-CS0A7",                  │
     │         "sender": {...},                           │
     │         "receiver": {...},                         │
     │         "parcel": {...}                            │
     │       }                                            │
     │───────────────────────────────────────────────────▶│
     │                                                    │
     │  2. Response with AWB                              │
     │◀───────────────────────────────────────────────────│
     │                                                    │
```

**Response:**
```json
{
  "order_number": "EP-20260121-0001",
  "awb": "JT123456789",
  "label_url": "https://easyparcel.com/labels/JT123456789.pdf",
  "tracking_url": "https://www.jtexpress.my/tracking?no=JT123456789"
}
```

## 5.2 Curlec Integration (Payment)

### 5.2.1 FPX Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CURLEC: FPX PAYMENT                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  Customer          Frontend          Order Service         Curlec API
     │                 │                    │                    │
     │  1. Select FPX  │                    │                    │
     │────────────────▶│                    │                    │
     │                 │                    │                    │
     │                 │  2. Create order   │                    │
     │                 │───────────────────▶│                    │
     │                 │                    │                    │
     │                 │                    │  3. Create payment │
     │                 │                    │───────────────────▶│
     │                 │                    │                    │
     │                 │                    │  4. Return checkout URL
     │                 │                    │◀───────────────────│
     │                 │                    │                    │
     │                 │  5. Redirect to    │                    │
     │                 │     Curlec         │                    │
     │◀────────────────│                    │                    │
     │                 │                    │                    │
     │  6. Select bank │                    │                    │
     │  7. Login to    │                    │                    │
     │     banking     │                    │                    │
     │  8. Approve     │                    │                    │
     │                 │                    │                    │
     │  9. Redirect    │                    │                    │
     │     back        │                    │                    │
     │────────────────▶│                    │                    │
     │                 │                    │                    │
     │                 │                    │  10. Webhook       │
     │                 │                    │◀───────────────────│
     │                 │                    │      payment.success
     │                 │                    │                    │
     │                 │                    │  11. Update order  │
     │                 │                    │      payment_status│
     │                 │                    │                    │
     │  12. Show       │                    │                    │
     │      success    │                    │                    │
     │◀────────────────│                    │                    │
```

## 5.3 Marketplace Integration (Shopee/TikTok)

### 5.3.1 Product Sync Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MARKETPLACE: PRODUCT SYNC                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  Marketplace Service                               Shopee/TikTok API
         │                                                │
         │  1. Check product mappings                     │
         │     marketplace.product_mappings               │
         │                                                │
         │  2. For each mapped product:                   │
         │     - Get local product data                   │
         │     - Get local stock level                    │
         │                                                │
         │  3. POST /api/v2/product/update_stock          │
         │       {                                        │
         │         "product_id": "shopee-id",             │
         │         "stock": 50                            │
         │       }                                        │
         │───────────────────────────────────────────────▶│
         │                                                │
         │  4. Response                                   │
         │◀───────────────────────────────────────────────│
         │                                                │
         │  5. Log sync result                            │
         │     marketplace.inventory_sync_logs            │
         │                                                │
```

---

# PART 6: SUMMARY

## 6.1 Quick Reference

| Item | Count |
|------|-------|
| Frontend Applications | 3 |
| Backend Services | 10 |
| Database Schemas | 18 |
| Database Tables | 125 |
| API Endpoints | 100+ |
| External Integrations | 4 (EasyParcel, Curlec, Shopee, TikTok) |

## 6.2 Key URLs

| Environment | URL |
|-------------|-----|
| Customer Store | https://store.kilangdesamurnibatik.com |
| Admin Dashboard | https://admin.kilangdesamurnibatik.com |
| Warehouse Portal | https://warehouse.kilangdesamurnibatik.com |
| API Base URL | https://store.kilangdesamurnibatik.com/api/v1 |

## 6.3 Date/Time Summary

| Format | Usage | Example |
|--------|-------|---------|
| Date (input) | YYYY-MM-DD | 2026-01-21 |
| DateTime (API) | ISO 8601 | 2026-01-21T14:30:00Z |
| DateTime (display) | DD/MM/YYYY HH:MM | 21/01/2026 14:30 |
| Timezone | Asia/Kuala_Lumpur | UTC+8 |

---

*Document Version 2.0 - Complete System Documentation*
*Last Updated: January 2026*
