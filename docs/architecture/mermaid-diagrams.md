# Kilang Desa Murni Batik - Mermaid Diagrams

> These diagrams can be rendered in GitHub, VS Code, Mermaid Live Editor, or any Mermaid-compatible tool.

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Schema Map](#2-database-schema-map)
3. [Customer Order Journey](#3-customer-order-journey)
4. [DDD Bounded Contexts](#4-ddd-bounded-contexts)
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)

---

## 1. System Architecture

```mermaid
flowchart TB
    subgraph Users["USERS"]
        Browser["Browser/Mobile"]
    end

    subgraph Frontend["FRONTEND - Next.js 14"]
        SF["Storefront<br/>Port: 3000"]
        AD["Admin<br/>Port: 3001"]
        WH["Warehouse<br/>Port: 3002"]
    end

    subgraph Gateway["API GATEWAY"]
        NG["NGINX<br/>SSL - Load Balancing<br/>Rate Limiting"]
    end

    subgraph Services["MICROSERVICES - Go 1.24 + Gin"]
        subgraph Core["Core Bounded Contexts"]
            AUTH["Auth<br/>:8001"]
            CATALOG["Catalog<br/>:8002"]
            ORDER["Order<br/>:8005"]
        end
        subgraph Support["Supporting Contexts"]
            INV["Inventory<br/>:8003"]
            CUST["Customer<br/>:8004"]
            AGENT["Agent<br/>:8006"]
            REPORT["Reporting<br/>:8007"]
            NOTIF["Notification<br/>:8008"]
            SUPPORT["Support<br/>:8009"]
            MARKET["Marketplace<br/>:8010"]
        end
    end

    subgraph Infra["INFRASTRUCTURE"]
        DB[("PostgreSQL 16<br/>18 Schemas<br/>125 Tables")]
        NATS["NATS JetStream<br/>Event Streaming"]
        MINIO["MinIO<br/>File Storage"]
        REDIS["Redis<br/>Cache"]
    end

    subgraph External["EXTERNAL APIs"]
        EP["EasyParcel"]
        CU["Curlec"]
        SH["Shopee"]
        TT["TikTok"]
    end

    Browser --> SF & AD & WH
    SF & AD & WH --> NG
    NG --> AUTH & CATALOG & ORDER & INV & CUST & AGENT
    NG --> REPORT & NOTIF & SUPPORT & MARKET

    AUTH & CATALOG & ORDER --> DB
    INV & CUST & AGENT --> DB
    REPORT & NOTIF & SUPPORT & MARKET --> DB

    ORDER --> NATS
    NATS --> INV & AGENT & NOTIF

    CATALOG --> MINIO
    ORDER --> MINIO

    AUTH --> REDIS
    CATALOG --> REDIS

    ORDER --> EP & CU
    MARKET --> SH & TT
```

---

## 2. Database Schema Map

```mermaid
flowchart TB
    subgraph Core["CORE SCHEMAS"]
        AUTH["auth<br/>7 tables<br/>users, roles, permissions"]
        CATALOG["catalog<br/>14 tables<br/>products, categories, variants"]
        ORDERS["orders<br/>6 tables<br/>timeline, shipping, payments"]
    end

    subgraph Public["PUBLIC SCHEMA - 40 tables"]
        PUB["Shared Kernel<br/>products, orders<br/>customers, agents"]
    end

    subgraph Supporting["SUPPORTING SCHEMAS"]
        INV["inventory<br/>5 tables"]
        CUST["customers<br/>5 tables"]
        AGENTS["agents<br/>3 tables"]
        ANALYTICS["analytics<br/>4 tables"]
    end

    subgraph Domain["DOMAIN SCHEMAS"]
        SALES["sales<br/>13 tables<br/>carts, payments, returns"]
        PAY["payments<br/>2 tables"]
        CMS["cms<br/>11 tables"]
        MARKET["marketplace<br/>9 tables"]
    end

    subgraph Events["EVENT SCHEMA"]
        OUTBOX["outbox<br/>1 table<br/>Transactional Outbox"]
    end

    AUTH <--> PUB
    CATALOG <--> PUB
    ORDERS <--> PUB

    PUB <--> INV
    PUB <--> CUST
    PUB <--> AGENTS
    PUB <--> ANALYTICS

    PUB <--> SALES
    SALES <--> PAY
    SALES --> OUTBOX

    CATALOG <--> MARKET
```

---

## 3. Customer Order Journey

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant SF as Storefront
    participant CAT as Catalog
    participant ORD as Order
    participant INV as Inventory
    participant PAY as Payment
    participant ADM as Admin
    participant WH as Warehouse
    participant EP as EasyParcel

    rect rgb(200, 230, 255)
        Note over C,CAT: STEP 1-3: Browse & Add to Cart
        C->>SF: Browse products
        SF->>CAT: GET /products
        CAT-->>SF: Product list
        C->>SF: Add to cart
        SF->>ORD: POST /cart/items
        ORD->>INV: Check stock
        INV-->>ORD: Stock available
        ORD-->>SF: Cart updated
    end

    rect rgb(200, 255, 200)
        Note over C,ORD: STEP 4-5: Checkout & Place Order
        C->>SF: Checkout
        SF->>ORD: POST /orders
        ORD->>INV: Reserve stock
        ORD-->>SF: Order created (ORD202601210001)
    end

    rect rgb(255, 230, 200)
        Note over C,PAY: STEP 6: Payment
        C->>SF: Upload receipt
        SF->>PAY: POST /payments/upload-receipt
        PAY-->>SF: Receipt uploaded (pending)
    end

    rect rgb(255, 200, 200)
        Note over ADM,PAY: STEP 7: Admin Verification
        ADM->>PAY: Verify payment
        PAY->>ORD: Update status = paid
        ORD-->>ADM: Order processing
    end

    rect rgb(230, 200, 255)
        Note over WH,EP: STEP 8: Shipping
        WH->>EP: Create AWB
        EP-->>WH: Tracking: JT123456789
        WH->>ORD: Update status = shipped
    end

    rect rgb(200, 255, 230)
        Note over C,ORD: STEP 9: Delivery
        EP-->>C: Package delivered
        ORD->>ORD: Status = completed
    end
```

---

## 4. DDD Bounded Contexts

```mermaid
flowchart TB
    subgraph Auth["AUTH CONTEXT"]
        direction TB
        A1["Domain: User, Role, Permission"]
        A2["Schema: auth - 7 tables"]
        A3["Service: :8001"]
    end

    subgraph Catalog["CATALOG CONTEXT"]
        direction TB
        C1["Domain: Product, Category, Variant"]
        C2["Schema: catalog - 14 tables"]
        C3["Service: :8002"]
    end

    subgraph Order["ORDER CONTEXT"]
        direction TB
        O1["Domain: Order, Cart, Payment"]
        O2["Schema: orders, sales, payments"]
        O3["Service: :8005"]
    end

    subgraph Inventory["INVENTORY CONTEXT"]
        direction TB
        I1["Domain: Warehouse, Stock"]
        I2["Schema: inventory - 5 tables"]
        I3["Service: :8003"]
    end

    subgraph Agent["AGENT CONTEXT"]
        direction TB
        AG1["Domain: Agent, Commission, Team"]
        AG2["Schema: agents - 3 tables"]
        AG3["Service: :8006"]
    end

    subgraph Marketplace["MARKETPLACE CONTEXT"]
        direction TB
        M1["Domain: Connection, Mapping, Sync"]
        M2["Schema: marketplace - 9 tables"]
        M3["Service: :8010"]
    end

    NATS["NATS JetStream"]

    Order -->|order.created| NATS
    NATS -->|subscribe| Inventory
    NATS -->|subscribe| Agent
    NATS -->|subscribe| Marketplace

    Order -.->|HTTP| Inventory
    Catalog -.->|HTTP| Inventory
    Order -.->|HTTP| Auth
```

---

## 5. Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ SESSIONS : has
    USERS }|--|| ROLES : has

    CUSTOMERS ||--o{ ORDERS : places
    CUSTOMERS ||--o{ ADDRESSES : has
    CUSTOMERS }o--o{ SEGMENTS : belongs_to

    PRODUCTS ||--o{ VARIANTS : has
    PRODUCTS ||--o{ IMAGES : has
    PRODUCTS }|--|| CATEGORIES : belongs_to

    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o| PAYMENT_RECEIPTS : has
    ORDERS ||--o| FULFILLMENTS : has
    ORDERS }o--o| AGENTS : referred_by

    AGENTS ||--o{ COMMISSIONS : earns

    WAREHOUSES ||--o{ STOCK_ITEMS : stores
    STOCK_ITEMS }|--|| PRODUCTS : tracks
```

---

## 6. Service Communication Pattern

```mermaid
flowchart LR
    subgraph Sync["SYNCHRONOUS - HTTP/REST"]
        FE[Frontend] -->|GET /products| BE[Backend Service]
        BE -->|JSON Response| FE
    end

    subgraph Async["ASYNCHRONOUS - NATS Events"]
        ORD2[Order Service] -->|order.created| NATS2[NATS JetStream]
        NATS2 -->|subscribe| INV2[Inventory]
        NATS2 -->|subscribe| AGT2[Agent]
        NATS2 -->|subscribe| NOT2[Notification]
    end

    subgraph S2S["SERVICE-TO-SERVICE"]
        ORD3[Order] -->|GET /internal/stock| INV3[Inventory]
    end
```

---

## How to Use These Diagrams

### 1. Mermaid Live Editor (Recommended)
- Go to [mermaid.live](https://mermaid.live)
- Paste the code between ` ```mermaid ` and ` ``` `
- Export as PNG or SVG

### 2. GitHub
- GitHub renders Mermaid diagrams natively in markdown files
- Just push this file and view on GitHub

### 3. VS Code
- Install "Markdown Preview Mermaid Support" extension
- Open this file and press `Ctrl+Shift+V` to preview

### 4. Notion
- Create a code block with language "mermaid"
- Paste the diagram code

---

## Color Scheme Reference

| Element | Suggested Color | Hex Code |
|---------|----------------|----------|
| Frontend (Next.js) | Blue | `#3B82F6` |
| API Gateway (Nginx) | Orange | `#F97316` |
| Microservices (Go) | Teal | `#14B8A6` |
| Database (PostgreSQL) | Purple | `#8B5CF6` |
| Messaging (NATS) | Green | `#22C55E` |
| Storage (MinIO) | Yellow | `#EAB308` |
| External APIs | Gray | `#6B7280` |

---

*Document Version 1.0 - January 2026*
