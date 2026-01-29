# Kilang Desa Murni Batik
## Enterprise System Documentation

**Document Purpose:** Management Overview
**Last Updated:** January 25, 2026
**Prepared For:** Founders, Directors, and Senior Management

---

## 1. Executive Summary

### What the System Is

Kilang Desa Murni Batik is a complete digital commerce platform purpose-built for selling traditional Malaysian Batik products. The system handles every aspect of the business: from showcasing products online to processing orders, managing inventory across warehouses, tracking sales agent commissions, and connecting with major online marketplaces like Shopee and TikTok Shop.

### Why It Was Built

The platform was developed to:
- **Scale the business** beyond physical retail limitations
- **Automate operations** that were previously manual and error-prone
- **Enable multi-channel selling** through integrated marketplace connections
- **Empower sales agents** with commission tracking and customer management tools
- **Provide real-time visibility** into sales, inventory, and business performance

### Business Problems It Solves

| Challenge | Solution |
|-----------|----------|
| Manual order processing | Automated order flow from purchase to delivery |
| Inventory tracking across locations | Real-time stock visibility across all warehouses |
| Agent commission disputes | Transparent, automated commission calculations |
| Marketplace fragmentation | Single system connected to Shopee and TikTok Shop |
| Payment verification delays | Streamlined receipt upload and approval workflow |
| Customer support inefficiency | Ticketing system with priority and tracking |
| Lack of business insights | Comprehensive reporting and analytics dashboard |

---

## 2. System Overview

### What Has Been Built

The Kilang Desa Murni Batik platform consists of three main portals and ten specialized services working together:

**Customer-Facing Portal**
- Product browsing with search and filters
- Shopping cart and checkout
- Multiple payment options (FPX, Bank Transfer, Cash Deposit)
- Order tracking and history
- Customer account management

**Administration Portal**
- Complete product catalog management
- Order processing and fulfillment
- Customer relationship management
- Sales agent and commission management
- Inventory control across warehouses
- Payment verification workflow
- Business reports and analytics
- User access and permissions

**Warehouse Portal**
- Goods receiving and stock updates
- Order picking and packing
- Stock transfers between locations
- Shipping label generation

### Main Capabilities

- **Sell Products Online** - Full e-commerce with variant support (size, color, length)
- **Process Orders** - From cart to delivery with status tracking
- **Accept Payments** - Multiple Malaysian payment methods with verification
- **Manage Inventory** - Real-time stock across multiple warehouses
- **Track Commissions** - Automated agent commission calculations
- **Connect Marketplaces** - Sync products and orders with Shopee/TikTok Shop
- **Support Customers** - Ticket system with priority levels
- **Generate Reports** - Sales, inventory, agent, and customer analytics

---

## 3. High-Level Architecture

### Major Components

The system is organized into distinct components, each handling a specific business function:

```
                         CUSTOMER ACCESS
                              |
                    +---------+---------+
                    |                   |
              [Website]           [Marketplace]
           (Online Store)        (Shopee/TikTok)
                    |                   |
                    +--------+----------+
                             |
                      [Central Gateway]
                    (Routes all requests)
                             |
        +--------+--------+--------+--------+--------+
        |        |        |        |        |        |
   [Products] [Orders] [Stock] [Agents] [Support] [Reports]
        |        |        |        |        |        |
        +--------+--------+--------+--------+--------+
                             |
                      [Data Storage]
               (Database, Files, Cache)
```

### Component Responsibilities

**Online Store (Frontend)**
- Displays products beautifully for customers
- Provides smooth shopping and checkout experience
- Shows order history and tracking
- Enables agents to create orders for their customers

**Admin Dashboard (Frontend)**
- Manages all products, categories, and collections
- Processes orders through fulfillment
- Verifies customer payments
- Controls inventory levels
- Configures agent commissions
- Generates business reports

**Products Service**
- Stores product information (name, description, pricing)
- Manages product variants (sizes, colors)
- Handles product images and media
- Powers product search functionality
- Organizes products into categories and collections

**Orders Service**
- Creates and processes customer orders
- Tracks order status from pending to delivered
- Handles payment receipt uploads
- Manages returns and refunds
- Coordinates with shipping couriers

**Inventory Service**
- Tracks stock quantities in real-time
- Prevents overselling by reserving stock
- Manages stock transfers between warehouses
- Logs all stock movements for audit

**Customer Service**
- Stores customer profiles and contact information
- Manages shipping and billing addresses
- Tracks customer activity and order history
- Supports wishlists and preferences

**Agent Service**
- Manages sales agent profiles and teams
- Calculates commissions automatically
- Tracks agent performance metrics
- Handles commission approval workflow

**Notifications Service**
- Sends order confirmation emails
- Delivers SMS updates for shipping
- Notifies agents of commission payments
- Alerts staff to pending verifications

**Support Service**
- Creates and tracks support tickets
- Assigns tickets to support staff
- Manages communication with customers
- Provides pre-written response templates

**Marketplace Service**
- Connects to Shopee Open Platform
- Connects to TikTok Shop Partner API
- Syncs product listings to marketplaces
- Imports orders from marketplaces
- Keeps inventory synchronized across channels

**Data Storage**
- Central database storing all business data
- Image storage for product photos and receipts
- Cache layer for fast performance
- Search engine for product discovery

---

## 4. Data Flow & Key Workflows

### How an Order Flows Through the System

```
STEP 1: SHOPPING
Customer browses products -> Adds items to cart -> Proceeds to checkout

STEP 2: CHECKOUT
Customer enters address -> Selects shipping -> Chooses payment method

STEP 3: ORDER CREATION
System creates order -> Reserves stock -> Sends confirmation email

STEP 4: PAYMENT
Customer uploads receipt -> Admin reviews -> Approves/Rejects

STEP 5: FULFILLMENT
Warehouse picks items -> Packs order -> Generates shipping label

STEP 6: SHIPPING
Courier collects package -> Customer receives tracking -> Delivery

STEP 7: COMPLETION
Order marked delivered -> Agent commission calculated -> Analytics updated
```

### How Agent Commissions Work

```
STEP 1: SETUP
Admin creates agent profile -> Sets base rate (e.g., 5%)
Admin configures tier bonuses (higher rates for larger sales)
Admin adds product/category bonuses

STEP 2: SALES
Agent creates order for customer -> Order is processed -> Delivered

STEP 3: CALCULATION
System calculates base commission on order value
+ Adds tier bonus if applicable
+ Adds product-specific bonuses
+ Adds category bonuses
+ Adds team performance bonus
= TOTAL COMMISSION

STEP 4: APPROVAL
Commission appears in pending list -> Admin reviews -> Approves

STEP 5: PAYMENT
Admin marks as paid -> Agent receives notification
```

### How Marketplace Integration Works

```
STEP 1: CONNECTION
Admin authorizes Shopee/TikTok in system -> OAuth login -> Connected

STEP 2: PRODUCT SYNC
Admin selects products to push -> Maps categories -> Products appear on marketplace

STEP 3: INVENTORY SYNC
Stock changes in system -> Automatically updates marketplace -> No overselling

STEP 4: ORDER IMPORT
Customer orders on Shopee/TikTok -> System pulls order -> Processes normally
```

### How Payment Verification Works

```
STEP 1: CUSTOMER PAYS
Customer makes bank transfer or cash deposit -> Uploads receipt photo

STEP 2: ADMIN REVIEW
Payment appears in pending list -> Admin views receipt -> Verifies details

STEP 3: DECISION
If valid: Approves payment -> Order continues to fulfillment
If invalid: Rejects payment -> Customer notified to retry

STEP 4: NOTIFICATION
Customer receives email/SMS confirmation of payment status
```

---

## 5. Security, Reliability & Scalability

### What Is in Place Today

**Access Security**
- User login with secure password storage
- Role-based access (Admin, Agent, Warehouse Staff, Customer)
- Session management with automatic expiry
- Two-factor authentication support
- Login attempt monitoring

**Data Protection**
- All sensitive data encrypted in storage
- Secure communication (HTTPS/SSL)
- Payment credentials never stored directly
- Database access restricted by service

**Operational Security**
- Rate limiting prevents abuse
- Input validation on all forms
- Audit logs track all changes
- Regular automated backups

**System Reliability**
- Services designed to run independently
- If one service fails, others continue operating
- Automatic health checks on all components
- Database connection management prevents overload

**Scalability Features**
- System designed for growth
- Can add more servers as traffic increases
- Caching reduces database load
- Message queue handles traffic spikes

### What Is Out of Scope (Not Currently Implemented)

- Dedicated fraud detection system
- Advanced DDoS protection (relies on hosting provider)
- PCI-DSS compliance for direct card payments
- Formal penetration testing certification
- Multi-region disaster recovery

---

## 6. Risks, Limitations & Technical Debt

### Known Constraints

| Area | Constraint | Impact |
|------|------------|--------|
| **Payment Processing** | No direct card payments | Customers must use bank transfer, FPX, or cash deposit |
| **Marketplace Reach** | Only Shopee and TikTok | Cannot sell on Lazada or other platforms yet |
| **Warehouse System** | Basic functionality | Complex warehouse operations may need enhancement |
| **Mobile Apps** | Web-only | No dedicated iOS/Android apps |
| **Multi-Currency** | MYR only | Cannot sell internationally with local currencies |
| **Multi-Language** | Limited | No built-in translation system |

### Operational Risks

**Single Database**
- All services depend on one database
- Database failure affects entire system
- Mitigation: Regular backups, monitoring

**Marketplace API Dependency**
- Shopee/TikTok may change their APIs
- Could temporarily break integration
- Mitigation: Version monitoring, graceful degradation

**Payment Verification Bottleneck**
- Manual receipt verification required
- High order volume may cause delays
- Mitigation: Prioritization, staff allocation

**Third-Party Services**
- Relies on external services (SMS, email, couriers)
- Service outages affect notifications
- Mitigation: Retry logic, multiple providers

### Technical Debt

- Some services share code that could be further optimized
- Test coverage varies across components
- Documentation for individual services needs expansion
- Mobile-responsive design could be improved in some areas

---

## 7. Recommendations & Next Phase Improvements

### Short-Term Improvements (Immediate Priorities)

**1. Payment Gateway Integration**
- Add direct card payment support (Stripe, PayPal)
- Reduces manual verification workload
- Improves customer checkout experience

**2. Mobile Application**
- Develop native iOS/Android apps
- Push notifications for orders
- Better agent mobile experience

**3. Lazada Marketplace Integration**
- Expand marketplace reach
- Increase sales channels
- Unified inventory management

**4. Automated Stock Alerts**
- Automatic low-stock notifications
- Reorder point suggestions
- Supplier notification integration

**5. Enhanced Reporting**
- Scheduled report delivery to email
- Custom dashboard builder
- Export to Excel/Google Sheets

### Long-Term Roadmap

**Phase 1: Customer Experience**
- Live chat support integration
- Customer loyalty program
- Product reviews and ratings
- Personalized product recommendations

**Phase 2: Operations Efficiency**
- Advanced warehouse management (zones, bins)
- Barcode/QR code scanning
- Automated shipping rate comparison
- Supplier management portal

**Phase 3: Business Intelligence**
- Predictive inventory management
- Sales forecasting
- Customer behavior analytics
- Profit margin analysis

**Phase 4: Market Expansion**
- Multi-currency support
- Multi-language interface
- International shipping integrations
- Cross-border tax handling

**Phase 5: Platform Maturity**
- API for third-party integrations
- White-label option for partners
- Subscription/membership features
- Advanced fraud detection

---

## Appendix A: System Metrics Summary

| Metric | Value |
|--------|-------|
| Backend Services | 10 specialized services |
| Frontend Applications | 3 portals (Store, Admin, Warehouse) |
| Database Tables | 125+ tables across 18 schemas |
| Marketplace Integrations | 2 (Shopee, TikTok Shop) |
| Payment Methods | 3 (FPX, Bank Transfer, Cash Deposit) |
| Courier Integrations | 2 (POS Laju, SF Express) |
| Notification Channels | 2 (Email, SMS) |

---

## Appendix B: User Roles Overview

| Role | Access Level | Responsibilities |
|------|--------------|------------------|
| **Super Admin** | Full system access | System configuration, all management |
| **Admin** | Operations access | Products, orders, customers, reports |
| **Agent** | Limited portal | Own customers, orders, commissions |
| **Warehouse Staff** | Warehouse portal | Stock, picking, shipping |
| **Support Staff** | Support access | Customer tickets only |
| **Customer** | Storefront | Shopping, orders, profile |

---

## Appendix C: Technology Summary (For Technical Reference)

| Component | Technology |
|-----------|------------|
| Web Applications | Next.js 14, React 18 |
| Backend Services | Go 1.24 with Gin framework |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Search | Meilisearch |
| File Storage | MinIO (S3-compatible) |
| Message Queue | NATS JetStream |
| Container Platform | Docker Compose |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 25, 2026 | System Architect | Initial management documentation |

---

*This document provides a high-level overview suitable for management. For technical specifications, refer to the Technical Architecture Documentation.*
