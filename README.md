# Kilang Desa Murni Batik

<div align="center">

### Enterprise E-Commerce Platform for Traditional Malaysian Batik

[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![NATS](https://img.shields.io/badge/NATS-JetStream-27AAE1?style=for-the-badge&logo=nats.io&logoColor=white)](https://nats.io)

**A full-stack microservices platform built with Domain-Driven Design (DDD)**

[Features](#-key-features) | [Architecture](#-system-architecture) | [How It Works](#-how-the-system-works) | [Tech Stack](#-tech-stack) | [Database](#-database-design)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [How The System Works](#-how-the-system-works)
  - [Customer Order Flow](#1-customer-order-flow)
  - [Payment Verification Flow](#2-payment-verification-flow)
  - [Agent Commission Flow](#3-agent-commission-flow)
  - [Inventory Management Flow](#4-inventory-management-flow)
  - [Marketplace Sync Flow](#5-marketplace-sync-flow)
- [Tech Stack](#-tech-stack)
- [Domain-Driven Design](#-domain-driven-design-ddd)
- [Database Design](#-database-design)
- [API Documentation](#-api-documentation)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

**Kilang Desa Murni Batik** is an enterprise-grade e-commerce platform designed specifically for selling traditional Malaysian Batik textiles. The platform serves multiple user types and integrates with major marketplaces.

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     🏭  KILANG DESA MURNI BATIK - Malaysian Batik E-Commerce Platform        ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║     👥 CUSTOMERS        Browse catalog, add to cart, checkout, track orders  ║
║                                                                               ║
║     👔 ADMINISTRATORS   Manage products, process orders, verify payments     ║
║                                                                               ║
║     💼 SALES AGENTS     Earn commissions, track sales, request payouts       ║
║                                                                               ║
║     📦 WAREHOUSE        Manage inventory, process shipments, stock alerts    ║
║                                                                               ║
║     🛒 MARKETPLACES     Sync with Shopee & TikTok Shop automatically         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Business Problem Solved

| Challenge | Solution |
|-----------|----------|
| Manual order processing | Automated order workflow with status tracking |
| Payment verification delays | Digital receipt upload with admin verification dashboard |
| Agent commission tracking | Automated commission calculation and payout management |
| Multi-channel selling | Unified dashboard for Shopee & TikTok Shop integration |
| Inventory discrepancies | Real-time stock reservation and alerts |

---

## ✨ Key Features

### 1. Multi-Portal E-Commerce
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FOUR FRONTEND PORTALS                             │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│   STOREFRONT    │     ADMIN       │     AGENT       │     WAREHOUSE       │
│   (Customer)    │   (Back-office) │   (Sales Rep)   │    (Inventory)      │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ • Browse Catalog│ • Manage Orders │ • View Sales    │ • Stock Management  │
│ • Shopping Cart │ • Product CRUD  │ • Commissions   │ • Order Fulfillment │
│ • Checkout      │ • User Roles    │ • Payout Request│ • Shipping Labels   │
│ • Order History │ • Analytics     │ • Team Stats    │ • Low Stock Alerts  │
│ • Payment Upload│ • Payment Verify│ • Referral Links│ • Warehouse Zones   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

### 2. Role-Based Access Control (RBAC)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERMISSION MATRIX                                   │
├─────────────────┬───────┬─────────┬───────┬───────┬───────────────────────┤
│    Permission   │ Admin │ Manager │ Staff │ Agent │     Description       │
├─────────────────┼───────┼─────────┼───────┼───────┼───────────────────────┤
│ products.view   │   ✓   │    ✓    │   ✓   │   ✓   │ View product catalog  │
│ products.create │   ✓   │    ✓    │   ✗   │   ✗   │ Add new products      │
│ products.update │   ✓   │    ✓    │   ✗   │   ✗   │ Edit products         │
│ products.delete │   ✓   │    ✗    │   ✗   │   ✗   │ Remove products       │
├─────────────────┼───────┼─────────┼───────┼───────┼───────────────────────┤
│ orders.view     │   ✓   │    ✓    │   ✓   │   ✓*  │ View orders (*own)    │
│ orders.update   │   ✓   │    ✓    │   ✓   │   ✗   │ Update order status   │
│ orders.cancel   │   ✓   │    ✓    │   ✗   │   ✗   │ Cancel orders         │
├─────────────────┼───────┼─────────┼───────┼───────┼───────────────────────┤
│ payments.verify │   ✓   │    ✓    │   ✗   │   ✗   │ Verify payment receipt│
│ users.manage    │   ✓   │    ✗    │   ✗   │   ✗   │ Manage user accounts  │
│ roles.manage    │   ✓   │    ✗    │   ✗   │   ✗   │ Manage roles/perms    │
├─────────────────┼───────┼─────────┼───────┼───────┼───────────────────────┤
│ reports.view    │   ✓   │    ✓    │   ✗   │   ✓*  │ View reports (*own)   │
│ reports.export  │   ✓   │    ✓    │   ✗   │   ✗   │ Export reports        │
└─────────────────┴───────┴─────────┴───────┴───────┴───────────────────────┘
```

### 3. Agent Commission System
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AGENT TIER SYSTEM                                    │
├─────────────────┬──────────────┬──────────────┬────────────────────────────┤
│      Tier       │  Commission  │ Sales Target │        Benefits            │
├─────────────────┼──────────────┼──────────────┼────────────────────────────┤
│  🥉 BRONZE      │     5%       │   RM 0+      │ Basic commission rate      │
│  🥈 SILVER      │     7%       │   RM 5,000+  │ + Priority support         │
│  🥇 GOLD        │    10%       │   RM 15,000+ │ + Exclusive products       │
│  💎 PLATINUM    │    12%       │   RM 50,000+ │ + Team leadership bonus    │
└─────────────────┴──────────────┴──────────────┴────────────────────────────┘
```

### 4. Multiple Payment Methods
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUPPORTED PAYMENT METHODS                              │
├─────────────────┬─────────────────────────────────────────────────────────┤
│  💳 FPX         │ Online banking (Maybank, CIMB, RHB, etc.)               │
│  🏦 Bank Transfer│ Manual transfer with receipt upload                     │
│  💵 Cash Deposit │ ATM/CDM deposit with receipt upload                     │
│  🚚 COD          │ Cash on Delivery (selected areas)                       │
└─────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🏗 System Architecture

### High-Level Architecture

```
                              ┌─────────────────────────────────────┐
                              │           CLOUDFLARE CDN            │
                              │      (DDoS Protection + Cache)      │
                              └──────────────────┬──────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Storefront  │  │   Admin     │  │   Agent     │  │  Warehouse  │        │
│  │  Next.js    │  │  Next.js    │  │  Next.js    │  │  Next.js    │        │
│  │  Port 3000  │  │  Port 3001  │  │  Port 3002  │  │  Port 3003  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (NGINX)                                │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • SSL/TLS Termination    • Rate Limiting    • Load Balancing       │   │
│   │  • Request Routing        • CORS Handling    • Compression          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Route Mapping:                                                             │
│   /api/v1/auth/*        → service-auth:8001                                 │
│   /api/v1/products/*    → service-catalog:8002                              │
│   /api/v1/orders/*      → service-order:8003                                │
│   /api/v1/agents/*      → service-agent:8004                                │
│   /api/v1/inventory/*   → service-inventory:8005                            │
│   /api/v1/marketplace/* → service-marketplace:8006                          │
│   /storage/*            → minio:9000                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                                   │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │    Auth      │ │   Catalog    │ │    Order     │ │    Agent     │       │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │       │
│  │    (Go)      │ │    (Go)      │ │    (Go)      │ │    (Go)      │       │
│  │  Port 8001   │ │  Port 8002   │ │  Port 8003   │ │  Port 8004   │       │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │
│         │                │                │                │                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │  Inventory   │ │ Marketplace  │ │ Notification │ │  Reporting   │       │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │       │
│  │    (Go)      │ │    (Go)      │ │    (Go)      │ │    (Go)      │       │
│  │  Port 8005   │ │  Port 8006   │ │  Port 8007   │ │  Port 8008   │       │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │
│         │                │                │                │                │
│  ┌──────────────┐ ┌──────────────┐                                          │
│  │   Customer   │ │   Support    │                                          │
│  │   Service    │ │   Service    │                                          │
│  │    (Go)      │ │    (Go)      │                                          │
│  │  Port 8009   │ │  Port 8010   │                                          │
│  └──────┬───────┘ └──────┬───────┘                                          │
└─────────┼────────────────┼──────────────────────────────────────────────────┘
          │                │
          └────────────────┴────────────────┐
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA & MESSAGING LAYER                             │
│                                                                              │
│  ┌─────────────────────────┐        ┌─────────────────────────┐             │
│  │      PostgreSQL 16      │        │     NATS JetStream      │             │
│  │                         │        │                         │             │
│  │  • 18 Schemas           │        │  • Event Publishing     │             │
│  │  • 125+ Tables          │        │  • Message Queuing      │             │
│  │  • Full-text Search     │        │  • At-least-once        │             │
│  │  • JSON/JSONB Support   │        │  • Persistence          │             │
│  └─────────────────────────┘        └─────────────────────────┘             │
│                                                                              │
│  ┌─────────────────────────┐        ┌─────────────────────────┐             │
│  │       MinIO (S3)        │        │    Redis (Optional)     │             │
│  │                         │        │                         │             │
│  │  • Product Images       │        │  • Session Cache        │             │
│  │  • Payment Receipts     │        │  • Rate Limiting        │             │
│  │  • Documents            │        │  • Real-time Data       │             │
│  └─────────────────────────┘        └─────────────────────────┘             │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Service Communication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVICE COMMUNICATION PATTERNS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SYNCHRONOUS (REST API)              ASYNCHRONOUS (NATS Events)           │
│   ━━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                                                             │
│   ┌─────────┐  HTTP   ┌─────────┐    ┌─────────┐ publish ┌─────────┐      │
│   │ Frontend│ ──────► │  NGINX  │    │  Order  │ ──────► │  NATS   │      │
│   └─────────┘         └────┬────┘    │ Service │         │JetStream│      │
│                            │         └─────────┘         └────┬────┘      │
│                            ▼                                  │            │
│                     ┌─────────────┐                          │            │
│                     │   Service   │            subscribe     │            │
│                     └─────────────┘         ┌────────────────┼──────┐     │
│                                             │                │      │     │
│                                             ▼                ▼      ▼     │
│                                        ┌────────┐   ┌──────────┐ ┌─────┐  │
│                                        │Inventory│  │Notification│ │Agent│  │
│                                        └────────┘   └──────────┘ └─────┘  │
│                                                                             │
│   Use Cases:                          Use Cases:                           │
│   • User authentication               • Order status changes               │
│   • Product queries                   • Stock level updates                │
│   • Order creation                    • Commission calculations            │
│   • Direct API calls                  • Email/SMS notifications            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 How The System Works

### 1. Customer Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER ORDER FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    CUSTOMER                    SYSTEM                         BACKEND
    ════════                    ══════                         ═══════

    ┌─────────┐
    │ Browse  │
    │ Products│
    └────┬────┘
         │
         │ 1. View catalog
         ├──────────────────────►  service-catalog
         │                         ┌─────────────────┐
         │◄────────────────────────│ Return products │
         │                         │ with stock info │
         │                         └─────────────────┘
    ┌────▼────┐
    │ Add to  │
    │  Cart   │
    └────┬────┘
         │
         │ 2. Store in localStorage/session
         │
    ┌────▼────┐
    │Checkout │
    │  Page   │
    └────┬────┘
         │
         │ 3. Submit order
         ├──────────────────────►  service-order
         │                         ┌─────────────────────────────────┐
         │                         │ a. Validate cart items          │
         │                         │ b. Check stock availability     │──► service-inventory
         │                         │ c. Reserve stock                │
         │                         │ d. Calculate totals             │
         │                         │ e. Create order record          │
         │                         │ f. Publish ORDER_CREATED event  │──► NATS
         │◄────────────────────────│ g. Return order confirmation    │
         │                         └─────────────────────────────────┘
    ┌────▼────┐
    │ Order   │
    │Confirmed│                          NATS Events Triggered:
    │ Page    │                          ─────────────────────
    └────┬────┘                          • order.created
         │                               • inventory.stock.reserved
         │                               • notification.order.confirmation
         │
    ┌────▼────┐
    │ Upload  │
    │ Payment │ ─────────────────► (See Payment Flow below)
    │ Receipt │
    └─────────┘


    ORDER STATUS LIFECYCLE:
    ━━━━━━━━━━━━━━━━━━━━━━

    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ PENDING  │───►│  PAID    │───►│PROCESSING│───►│ SHIPPED  │───►│DELIVERED │
    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
    ┌──────────┐                                   ┌──────────┐
    │CANCELLED │                                   │ RETURNED │
    └──────────┘                                   └──────────┘
```

### 2. Payment Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PAYMENT VERIFICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    CUSTOMER                   ADMIN                         SYSTEM
    ════════                   ═════                         ══════

    ┌───────────────┐
    │ Select Payment│
    │    Method     │
    │ (Bank Transfer)│
    └───────┬───────┘
            │
            │  1. Show bank details
            │     Account: XXX-XXXX-XXXX
            │     Bank: Maybank
            │
    ┌───────▼───────┐
    │  Make Payment │
    │   (via ATM/   │
    │ Online Banking)│
    └───────┬───────┘
            │
            │  2. Take screenshot/photo of receipt
            │
    ┌───────▼───────┐
    │ Upload Receipt│
    │   + Details   │
    │ ┌───────────┐ │
    │ │ Amount    │ │
    │ │ Date      │ │
    │ │ Reference │ │
    │ │ Bank Name │ │
    │ └───────────┘ │
    └───────┬───────┘
            │
            │  3. POST /api/v1/payments/upload-receipt
            ├─────────────────────────────────────────────────► service-order
            │                                                   ┌─────────────────────┐
            │                                                   │ • Save receipt image│
            │                                                   │   to MinIO storage  │
            │                                                   │ • Create payment    │
            │                                                   │   record (PENDING)  │
            │◄──────────────────────────────────────────────────│ • Notify admin      │
            │                                                   └─────────────────────┘
    ┌───────▼───────┐
    │ Receipt Status│
    │   PENDING     │
    │  ⏳ Waiting   │
    └───────────────┘
                                    ┌────────────────┐
                                    │ Admin Dashboard│
                                    │ ┌────────────┐ │
                                    │ │🔔 New      │ │
                                    │ │  Receipts  │ │
                                    │ │  (5)       │ │
                                    │ └────────────┘ │
                                    └───────┬────────┘
                                            │
                                            │  4. View receipt details
                                            │
                                    ┌───────▼────────┐
                                    │ Verify Receipt │
                                    │ ┌────────────┐ │
                                    │ │ [IMAGE]    │ │
                                    │ │            │ │
                                    │ │ Amount: RM │ │
                                    │ │ Date: ...  │ │
                                    │ │ Ref: ...   │ │
                                    │ └────────────┘ │
                                    │                │
                                    │ [✓ Verify]    │
                                    │ [✗ Reject]    │
                                    └───────┬────────┘
                                            │
                                            │  5. PUT /api/v1/admin/payments/:id/verify
                                            ├─────────────────────────────────► service-order
                                            │                                   ┌──────────────────┐
                                            │                                   │ • Update payment │
                                            │                                   │   status:VERIFIED│
                                            │                                   │ • Update order   │
                                            │                                   │   status: PAID   │
                                            │                                   │ • Trigger events │
                                            │◄──────────────────────────────────│ • Notify customer│
                                            │                                   └──────────────────┘

            │
    ┌───────▼───────┐
    │ Receipt Status│
    │   VERIFIED ✓  │
    │  Order: PAID  │
    └───────────────┘


    RECEIPT STATUS:
    ━━━━━━━━━━━━━━━

    ┌──────────┐    Admin Action    ┌──────────┐
    │ PENDING  │───────────────────►│ VERIFIED │ ──► Order becomes PAID
    └──────────┘         │          └──────────┘
                         │
                         │          ┌──────────┐
                         └─────────►│ REJECTED │ ──► Customer re-upload
                                    └──────────┘
```

### 3. Agent Commission Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AGENT COMMISSION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    AGENT                      CUSTOMER                      SYSTEM
    ═════                      ════════                      ══════

    ┌─────────────┐
    │ Generate    │
    │ Referral    │
    │ Link        │
    └──────┬──────┘
           │
           │  1. GET /api/v1/agent/referral-link
           ├───────────────────────────────────────────────► service-agent
           │                                                 ┌────────────────────┐
           │◄────────────────────────────────────────────────│ https://store.com/ │
           │                                                 │ ?ref=AGENT_CODE    │
           │                                                 └────────────────────┘
    ┌──────▼──────┐
    │ Share Link  │
    │ (WhatsApp,  │──────────────────────────►  ┌─────────────┐
    │  Social)    │                             │  Customer   │
    └─────────────┘                             │  clicks     │
                                                │  link       │
                                                └──────┬──────┘
                                                       │
                                                       │  2. Visit store with ?ref=AGENT_CODE
                                                       │     (Ref code stored in cookie)
                                                       │
                                                ┌──────▼──────┐
                                                │   Browse    │
                                                │   & Shop    │
                                                └──────┬──────┘
                                                       │
                                                       │  3. Complete purchase
                                                       ├───────────────────► service-order
                                                       │                     ┌──────────────────┐
                                                       │                     │ • Create order   │
                                                       │                     │ • Attach agent   │
                                                       │                     │ • Publish event  │
                                                       │                     └────────┬─────────┘
                                                       │                              │
                                                       │                              │ order.created
                                                       │                              ▼
                                                       │                     ┌──────────────────┐
                                                       │                     │  service-agent   │
                                                       │                     ├──────────────────┤
                                                       │                     │ 4. Calculate     │
                                                       │                     │    commission:   │
                                                       │                     │                  │
                                                       │                     │    Order: RM 500 │
                                                       │                     │    Tier: GOLD    │
                                                       │                     │    Rate: 10%     │
                                                       │                     │    ───────────   │
                                                       │                     │    = RM 50       │
                                                       │                     └──────────────────┘

                     LATER (when order is delivered):
                     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                                       │  order.delivered event
                                                       ▼
                                             ┌──────────────────┐
                                             │  service-agent   │
                                             ├──────────────────┤
                                             │ Update commission│
                                             │ status: APPROVED │
                                             └──────────────────┘

    ┌─────────────┐
    │ Agent       │
    │ Dashboard   │
    │ ┌─────────┐ │
    │ │Pending  │ │
    │ │RM 50    │ │
    │ │         │ │
    │ │Approved │ │
    │ │RM 500   │ │
    │ └─────────┘ │
    └──────┬──────┘
           │
           │  7. Request payout
           │
    ┌──────▼──────┐
    │ Payout      │
    │ Request     │──────────────────────────► service-agent
    │ Created     │                            ┌──────────────────┐
    └─────────────┘                            │ Create payout    │
                                               │ Status: PENDING  │
                                               │                  │
                                               │ Admin processes  │
                                               │ bank transfer    │
                                               │                  │
                                               │ Mark: COMPLETED  │
                                               └──────────────────┘


    COMMISSION STATUS FLOW:
    ━━━━━━━━━━━━━━━━━━━━━━━

    ┌──────────┐  order.delivered  ┌──────────┐  payout  ┌──────────┐
    │ PENDING  │──────────────────►│ APPROVED │─────────►│   PAID   │
    └──────────┘                   └──────────┘          └──────────┘
         │
         │ order.cancelled
         ▼
    ┌──────────┐
    │CANCELLED │
    └──────────┘
```

### 4. Inventory Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INVENTORY MANAGEMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              STOCK LEVELS
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │    AVAILABLE          RESERVED           SOLD            TOTAL          │
    │    ═════════          ════════           ════            ═════          │
    │                                                                         │
    │    Stock that         Stock held         Stock that      Physical       │
    │    can be sold        for pending        has been        stock in       │
    │                       orders             sold            warehouse      │
    │                                                                         │
    │    Formula: AVAILABLE = TOTAL - RESERVED - SOLD                         │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘


    STOCK RESERVATION FLOW:
    ━━━━━━━━━━━━━━━━━━━━━━━

    Customer Checkout                 service-inventory               Database
    ═════════════════                 ═════════════════               ════════

    ┌─────────────────┐
    │ Place Order     │
    │ (5 items)       │
    └────────┬────────┘
             │
             │  1. Reserve stock
             ├─────────────────────►  ┌─────────────────────────┐
             │                        │ Check availability:      │
             │                        │ Available: 100           │
             │                        │ Requested: 5             │
             │                        │ ✓ Sufficient stock       │
             │                        └────────────┬─────────────┘
             │                                     │
             │                                     │  2. UPDATE stock
             │                                     ├──────────────► ┌────────────┐
             │                                     │                │ available: │
             │                                     │                │ 100 → 95   │
             │                                     │                │            │
             │                                     │                │ reserved:  │
             │                                     │                │ 0 → 5      │
             │                                     │                └────────────┘
             │                                     │
             │◄────────────────────────────────────│  3. Publish event
             │                                     │     inventory.stock.reserved
    ┌────────▼────────┐
    │ Order Confirmed │
    │ (Stock Reserved)│
    └─────────────────┘


    LOW STOCK ALERT:
    ━━━━━━━━━━━━━━━━

                                             ┌─────────────────────────┐
                                             │   Reorder Point: 10     │
                                             └─────────────────────────┘
                                                        │
    ┌─────────┐   Stock: 50   ┌─────────┐   Stock: 8   ┌─────▼─────┐
    │ NORMAL  │──────────────►│ NORMAL  │─────────────►│   LOW     │
    │  (>10)  │               │  (>10)  │              │  STOCK    │
    └─────────┘               └─────────┘              │   (≤10)   │
                                                       └─────┬─────┘
                                                             │
                                                             │ Trigger:
                                                             │ inventory.stock.low
                                                             ▼
                                                   ┌─────────────────────────┐
                                                   │  service-notification   │
                                                   │  • Email to admin       │
                                                   │  • Dashboard alert      │
                                                   └─────────────────────────┘
```

### 5. Marketplace Sync Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MARKETPLACE SYNC FLOW                                 │
│                    (Shopee & TikTok Shop Integration)                       │
└─────────────────────────────────────────────────────────────────────────────┘


    PRODUCT SYNC (Admin → Marketplace):
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Admin Portal              service-marketplace           External API
    ════════════              ═══════════════════           ════════════

    ┌─────────────────┐
    │ Select Products │
    │ to Sync         │
    │ ┌─────────────┐ │
    │ │☑ Batik A    │ │
    │ │☑ Batik B    │ │
    │ │☐ Batik C    │ │
    │ └─────────────┘ │
    │                 │
    │ Platform: Shopee│
    │ [Sync Now]      │
    └────────┬────────┘
             │
             │  POST /api/v1/admin/marketplace/sync
             │
             ├─────────────────────►  ┌─────────────────────────────┐
             │                        │ 1. Get product details      │
             │                        │                             │
             │                        │ 2. Transform to Shopee      │
             │                        │    format                   │
             │                        │    • Map categories         │
             │                        │    • Convert images         │
             │                        └──────────────┬──────────────┘
             │                                       │
             │                                       │  Shopee API
             │                                       ├─────────────► ┌──────────┐
             │                                       │               │  SHOPEE  │
             │                                       │◄──────────────│ Created  │
             │                                       │               └──────────┘
             │                        ┌──────────────▼──────────────┐
             │                        │ 3. Store mapping:           │
             │◄───────────────────────│    internal ↔ shopee_id     │
             │                        └─────────────────────────────┘
    ┌────────▼────────┐
    │ Sync Complete   │
    │ ✓ 2 products    │
    └─────────────────┘


    ORDER SYNC (Marketplace → Admin):
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ┌──────────────┐
    │   SHOPEE     │
    │ New Order    │
    └──────┬───────┘
           │
           │  Webhook
           ├─────────────────────►  ┌─────────────────────────────┐
           │                        │ 1. Validate webhook         │
           │                        │ 2. Parse order data         │
           │                        │ 3. Create internal order    │
           │                        │ 4. Store order mapping      │
           │                        └──────────────┬──────────────┘
           │                                       │
           │                        ┌──────────────▼──────────────┐
           │                        │ Admin Dashboard             │
           │                        │ ┌─────────────────────────┐ │
           │                        │ │ NEW ORDERS              │ │
           │                        │ │ ─────────────────────── │ │
           │                        │ │ #ORD-001 (Website)      │ │
           │                        │ │ #ORD-002 (Shopee) 🛒    │ │
           │                        │ │ #ORD-003 (TikTok) 🎵    │ │
           │                        │ └─────────────────────────┘ │
           │                        └─────────────────────────────┘


    INVENTORY SYNC (Bidirectional):
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │    ┌─────────────────┐                                                  │
    │    │ Stock Changed   │                                                  │
    │    │ Batik A: 50→45  │                                                  │
    │    └────────┬────────┘                                                  │
    │             │                                                           │
    │             │  inventory.stock.updated                                  │
    │             ▼                                                           │
    │    ┌────────────────────────────────────────────┐                      │
    │    │         Sync to All Marketplaces          │                      │
    │    │                                            │                      │
    │    │    ┌──────────┐         ┌──────────┐      │                      │
    │    │    │  SHOPEE  │         │  TIKTOK  │      │                      │
    │    │    │ Stock:45 │         │ Stock:45 │      │                      │
    │    │    └──────────┘         └──────────┘      │                      │
    │    │                                            │                      │
    │    └────────────────────────────────────────────┘                      │
    │                                                                         │
    │    Result: Stock synchronized across all channels                       │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend Services

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| `service-auth` | 8001 | Go + Gin | Authentication, JWT, RBAC |
| `service-catalog` | 8002 | Go + Gin | Products, Categories, Variants |
| `service-order` | 8003 | Go + Gin | Orders, Payments, Shipping |
| `service-agent` | 8004 | Go + Gin | Commissions, Payouts, Tiers |
| `service-inventory` | 8005 | Go + Gin | Stock, Warehouses |
| `service-marketplace` | 8006 | Go + Gin | Shopee & TikTok |
| `service-notification` | 8007 | Go + Gin | Email, SMS, Push |
| `service-reporting` | 8008 | Go + Gin | Analytics, Reports |
| `service-customer` | 8009 | Go + Gin | Profiles, Addresses |
| `service-support` | 8010 | Go + Gin | Tickets, FAQ |

### Frontend Applications

| Application | Port | Technology | Users |
|-------------|------|------------|-------|
| `frontend-storefront` | 3000 | Next.js 14 | Customers |
| `frontend-admin` | 3001 | Next.js 14 | Administrators |
| `frontend-agent` | 3002 | Next.js 14 | Sales Agents |
| `frontend-warehouse` | 3003 | Next.js 14 | Warehouse Staff |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| API Gateway | NGINX | Routing, SSL, Load balancing |
| Database | PostgreSQL 16 | Primary data store |
| Message Bus | NATS JetStream | Event-driven messaging |
| Object Storage | MinIO | Images, receipts |
| CDN | Cloudflare | Caching, DDoS protection |
| Containers | Docker Compose | Orchestration |

---

## 🎨 Domain-Driven Design (DDD)

### Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BOUNDED CONTEXTS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CORE DOMAIN                                   │   │
│  │                                                                      │   │
│  │   ┌──────────────────┐    ┌──────────────────┐                      │   │
│  │   │  ORDER CONTEXT   │    │ INVENTORY CONTEXT│                      │   │
│  │   │  • Order         │    │  • Product       │                      │   │
│  │   │  • Payment       │    │  • StockItem     │                      │   │
│  │   │  • Shipment      │    │  • Category      │                      │   │
│  │   └──────────────────┘    └──────────────────┘                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SUPPORTING DOMAIN                               │   │
│  │                                                                      │   │
│  │   ┌──────────────────┐    ┌──────────────────┐                      │   │
│  │   │  AGENT CONTEXT   │    │MARKETPLACE CONTEXT│                     │   │
│  │   │  • Agent         │    │  • Listing       │                      │   │
│  │   │  • Commission    │    │  • Connection    │                      │   │
│  │   │  • Payout        │    │  • SyncJob       │                      │   │
│  │   └──────────────────┘    └──────────────────┘                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       GENERIC DOMAIN                                 │   │
│  │                                                                      │   │
│  │   ┌──────────────────┐    ┌──────────────────┐   ┌──────────────┐   │   │
│  │   │   AUTH CONTEXT   │    │ CUSTOMER CONTEXT │   │   SUPPORT    │   │   │
│  │   │  • User          │    │  • Profile       │   │  • Ticket    │   │   │
│  │   │  • Role          │    │  • Address       │   │  • FAQ       │   │   │
│  │   │  • Permission    │    │  • Wishlist      │   │              │   │   │
│  │   └──────────────────┘    └──────────────────┘   └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### DDD Building Blocks

```go
// AGGREGATE ROOT
type Order struct {
    ID          uuid.UUID
    CustomerID  uuid.UUID
    Items       []OrderItem
    Status      OrderStatus
    TotalAmount Money
}

// VALUE OBJECT
type Money struct {
    Amount   decimal.Decimal
    Currency string
}

// DOMAIN EVENT
type OrderCreatedEvent struct {
    OrderID    uuid.UUID
    CustomerID uuid.UUID
    Items      []OrderItem
    Timestamp  time.Time
}

// REPOSITORY
type OrderRepository interface {
    Save(order *Order) error
    FindByID(id uuid.UUID) (*Order, error)
}
```

---

## 💾 Database Design

### Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMAS (18)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │    auth     │  │   catalog   │  │   orders    │  │   agent     │       │
│   │ • users     │  │ • products  │  │ • orders    │  │ • agents    │       │
│   │ • roles     │  │ • categories│  │ • items     │  │ • commissions│      │
│   │ • perms     │  │ • variants  │  │ • payments  │  │ • payouts   │       │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │  inventory  │  │ marketplace │  │  customer   │  │   support   │       │
│   │ • stock     │  │ • connections│ │ • profiles  │  │ • tickets   │       │
│   │ • warehouses│  │ • mappings  │  │ • addresses │  │ • messages  │       │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│   TOTAL: 18 Schemas, 125+ Tables                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Tables ERD

```
    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │    users     │         │   products   │         │  categories  │
    ├──────────────┤         ├──────────────┤         ├──────────────┤
    │ id (PK)      │         │ id (PK)      │◄────────│ id (PK)      │
    │ email        │         │ name         │         │ name         │
    │ password_hash│         │ category_id  │         │ parent_id    │
    │ role_id (FK) │         │ base_price   │         └──────────────┘
    └──────┬───────┘         │ sku          │
           │                 └──────┬───────┘         ┌──────────────┐
           │                        │                 │   variants   │
           │                        └────────────────►│ id (PK)      │
           │                                          │ product_id   │
           │                                          │ size, color  │
           │                                          └──────────────┘
    ┌──────▼───────┐         ┌──────────────┐
    │    orders    │         │ order_items  │
    ├──────────────┤         ├──────────────┤
    │ id (PK)      │◄────────│ id (PK)      │
    │ user_id (FK) │         │ order_id     │
    │ status       │         │ product_id   │
    │ total_amount │         │ quantity     │
    │ agent_code   │         └──────────────┘
    └──────┬───────┘
           │
    ┌──────▼───────┐         ┌──────────────┐
    │    agents    │         │ commissions  │
    ├──────────────┤         ├──────────────┤
    │ id (PK)      │◄────────│ id (PK)      │
    │ agent_code   │         │ agent_id     │
    │ tier         │         │ order_id     │
    │ total_sales  │         │ amount, rate │
    └──────────────┘         └──────────────┘
```

---

## 📨 Event-Driven Architecture

### Event Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NATS JETSTREAM EVENT FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              NATS JetStream
    ┌─────────────────────────────────────────────────────────────────────────┐
    │   Streams:                                                              │
    │   ├── ORDERS    (order.*)                                               │
    │   ├── INVENTORY (inventory.*)                                           │
    │   ├── PAYMENTS  (payment.*)                                             │
    │   └── AGENTS    (agent.*)                                               │
    └─────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
    │   ORDER     │          │  INVENTORY  │          │    AGENT    │
    │  SERVICE    │          │   SERVICE   │          │   SERVICE   │
    └─────────────┘          └─────────────┘          └─────────────┘
```

### Event Catalog

| Event | Triggered When | Subscribers |
|-------|----------------|-------------|
| `order.created` | Customer completes checkout | Inventory, Agent, Notification |
| `order.paid` | Payment verified | Inventory, Notification |
| `order.shipped` | Order handed to courier | Notification |
| `order.delivered` | Customer confirms receipt | Agent |
| `inventory.reserved` | Stock reserved | Order |
| `inventory.low` | Stock below threshold | Notification |
| `commission.approved` | Order delivered | Notification |
| `payout.completed` | Admin processes transfer | Notification |

---

## 📁 Project Structure

This repository is the **map**, not the code. The platform is 19 repositories in the
[`KilangDesaMurniBatik`](https://github.com/KilangDesaMurniBatik) organisation, one per service, and they are
private. Everything below is a description of that layout — cloning this repository gives you this README, the
documentation in `docs/`, and nothing else.

> Until 2026-08-31 this repository carried 19 git submodule pointers instead. They did not work: `.gitmodules`
> declared only 2 of them, so the other 17 were dangling gitlinks that `git clone --recurse-submodules` could
> not resolve; two pointed at repositories (`frontend-agent`, `kilang-docs`) that no longer exist; and because
> the sources are private, even a correct set would have failed for anyone without organisation access. The
> pointers are gone and this map replaces them.

### Services — Go 1.24

| Repository | Responsibility | Owns in `niaga_db` |
|---|---|---|
| `service-auth` | Login, JWT issue and refresh, users, RBAC roles and permissions | `auth` |
| `service-catalog` | Products, variants, categories, collections, images, CMS content | `catalog`, `cms` |
| `service-order` | Carts, orders, payments, invoices, returns, shipping | `sales`, `payments` |
| `service-inventory` | Multi-warehouse stock, movements, transfers, low-stock alerts | `inventory` |
| `service-customer` | CRM — customers, tiers, RFM segments, addresses, measurements | `customers`, `crm` |
| `service-agent` | Sales agents, order wizard, teams, commissions | `agents` |
| `service-marketplace` | Shopee and TikTok Shop sync — OAuth, product push, order pull, stock sync | `marketplace` |
| `service-notification` | Email, SMS and push delivery from NATS events | — |
| `service-reporting` | Sales analytics, dashboards, scheduled reports, exports | `analytics` |
| `service-support` | Support tickets, categories, messages, SLA tracking | `support` |

### Frontends — Next.js 14

| Repository | Audience |
|---|---|
| `frontend-storefront` | The public shop |
| `frontend-admin` | Back-office dashboard, served under `/admin` |
| `frontend-warehouse` | Warehouse and stock operations |

### Shared and infrastructure

| Repository | What it is |
|---|---|
| `lib-common` | Shared Go: config, database and NATS helpers, auth middleware, logging, transactional outbox |
| `lib-ui` | Shared React components and the Tailwind preset the three frontends build on |
| `infra-database` | The schema for `niaga_db` — one snapshot per PostgreSQL schema, plus the loader |
| `database` | Seeds, e2e fixtures and the admin bootstrap |
| `infra-platform` | Docker Compose, the nginx routing table, deployment and backup scripts |
| `bruno-tests` | Bruno smoke collection covering every HTTP service |

### One database, one schema per service

All ten services share a single PostgreSQL database, `niaga_db`, and each owns its own schema inside it —
**135 tables, 73 foreign keys, 3 views, 68 functions**. `infra-database` holds the definition; no service
migrates the schema itself.

### Running it

The services run from source against a shared local stack (PostgreSQL, Redis, NATS, MinIO, Meilisearch), with
nginx in front on `:8080` routing `/api/v1/…` to the right service — the same routing table used in
deployment. `infra-platform/docs/LOCAL_DEV.md` has the full sequence.

---

## 📊 Technical Highlights

| Aspect | Implementation |
|--------|----------------|
| **Architecture** | Microservices with DDD |
| **API Design** | RESTful with OpenAPI |
| **Authentication** | JWT + Refresh tokens |
| **Authorization** | Fine-grained RBAC |
| **Database** | PostgreSQL 16 (18 schemas, 125+ tables) |
| **Events** | NATS JetStream |
| **File Storage** | MinIO (S3-compatible) |
| **Monitoring** | OpenTelemetry ready |

---

## 👨‍💻 Author

**Muhammad Luqman**

- Building enterprise-grade e-commerce solutions
- Specializing in Go, Next.js, and cloud-native architectures
- Focus on Domain-Driven Design and microservices

---

## 📄 License

This project is proprietary software developed for Kilang Desa Murni Batik.

---

<div align="center">

**Built with Domain-Driven Design principles for scalability and maintainability**

</div>
