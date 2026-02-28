# E2E Testing Tracker — KilangDesaMurniBatik

> **Total Tests: ~296** | P0 Critical: ~86 | P1 Important: ~163 | P2 Nice-to-have: ~47
>
> **How to use:** Check off `[x]` as each test is implemented and passing.

---

## A. API E2E Tests (e2e-tests/)

### A1. Auth Service (port 8001) — 28 tests

#### Login / Logout [P0]
- [ ] API-AUTH-001: `POST /auth/login` — valid admin credentials returns token + user
- [ ] API-AUTH-002: `POST /auth/login` — invalid password returns 401
- [ ] API-AUTH-003: `POST /auth/login` — nonexistent email returns 401
- [ ] API-AUTH-004: `POST /auth/login` — empty body returns 400
- [ ] API-AUTH-005: `POST /auth/login` — SQL injection handled safely
- [ ] API-AUTH-006: `POST /auth/logout` — invalidates token
- [ ] API-AUTH-007: `POST /auth/refresh` — valid refresh token returns new access token
- [ ] API-AUTH-008: `POST /auth/refresh` — expired refresh token returns 401

#### Protected Routes [P0]
- [ ] API-AUTH-009: `GET /auth/me` — returns current user with valid token
- [ ] API-AUTH-010: `GET /auth/me` — returns 401 without token
- [ ] API-AUTH-011: `GET /auth/me` — returns 401 with expired token
- [ ] API-AUTH-012: `PUT /auth/me` — update profile fields
- [ ] API-AUTH-013: `POST /auth/change-password` — succeeds with correct old password
- [ ] API-AUTH-014: `POST /auth/change-password` — rejects wrong old password
- [ ] API-AUTH-015: `GET /auth/verify` — token verification

#### 2FA [P1]
- [ ] API-AUTH-016: `GET /auth/2fa/status` — returns 2FA status
- [ ] API-AUTH-017: `GET /auth/2fa/setup` — returns QR code
- [ ] API-AUTH-018: `POST /auth/2fa/enable` — enable with valid TOTP
- [ ] API-AUTH-019: `POST /auth/2fa/disable` — disable with valid code

#### RBAC [P1]
- [ ] API-AUTH-020: `GET /admin/users` — list users (admin only)
- [ ] API-AUTH-021: `POST /admin/users` — create user
- [ ] API-AUTH-022: `GET /admin/roles` — list roles
- [ ] API-AUTH-023: `POST /admin/roles` — create role with permissions
- [ ] API-AUTH-024: `GET /admin/permissions` — list all permissions
- [ ] API-AUTH-025: `POST /admin/users/:id/roles` — assign role to user

#### Settings [P1]
- [ ] API-AUTH-026: `GET /admin/settings` — get all settings
- [ ] API-AUTH-027: `PUT /admin/settings/general` — update general settings
- [ ] API-AUTH-028: `GET /admin/activity-logs` — get activity logs

---

### A2. Catalog Service (port 8002) — 40 tests

#### Products - Public [P0]
- [ ] API-CAT-001: `GET /products` — list products with pagination
- [ ] API-CAT-002: `GET /products?category_id=X` — filter by category
- [ ] API-CAT-003: `GET /products?sort=price_asc` — sort by price
- [ ] API-CAT-004: `GET /products/:slug` — get product by slug
- [ ] API-CAT-005: `GET /products/:slug` — returns 404 for nonexistent slug
- [ ] API-CAT-006: `GET /products/:slug/availability` — variant availability matrix

#### Categories - Public [P0]
- [ ] API-CAT-007: `GET /categories` — list all categories
- [ ] API-CAT-008: `GET /categories/featured` — featured categories
- [ ] API-CAT-009: `GET /categories/:slug` — get category by slug
- [ ] API-CAT-010: `GET /categories/:slug/products` — category products with pagination

#### Search [P0]
- [ ] API-CAT-011: `GET /search?q=batik` — full-text search returns results
- [ ] API-CAT-012: `GET /search?q=nonexistent` — empty results for no match
- [ ] API-CAT-013: `GET /search/suggestions?q=bat` — autocomplete suggestions

#### Products - Admin [P1]
- [ ] API-CAT-014: `POST /admin/products` — create product with variants
- [ ] API-CAT-015: `PUT /admin/products/:id` — update product
- [ ] API-CAT-016: `DELETE /admin/products/:id` — soft delete product
- [ ] API-CAT-017: `PATCH /admin/products/:id/status` — change active/draft
- [ ] API-CAT-018: `POST /admin/products/:id/duplicate` — duplicate product
- [ ] API-CAT-019: `PUT /admin/products/bulk` — bulk update
- [ ] API-CAT-020: `POST /admin/products/:id/variants` — create variant
- [ ] API-CAT-021: `PUT /admin/products/:id/variants/:vid` — update variant
- [ ] API-CAT-022: `DELETE /admin/products/:id/variants/:vid` — delete variant
- [ ] API-CAT-023: `GET /admin/products/export` — CSV export

#### Categories - Admin [P1]
- [ ] API-CAT-024: `POST /admin/categories` — create category
- [ ] API-CAT-025: `PUT /admin/categories/:id` — update category
- [ ] API-CAT-026: `DELETE /admin/categories/:id` — delete category

#### Flash Sales [P1]
- [ ] API-CAT-027: `GET /flash-sales/active` — get active flash sales
- [ ] API-CAT-028: `GET /flash-sales/:slug` — get flash sale details
- [ ] API-CAT-029: `POST /admin/flash-sales` — create flash sale
- [ ] API-CAT-030: `POST /admin/flash-sales/:id/items` — add item to flash sale

#### Collections [P2]
- [ ] API-CAT-031: `GET /collections` — list collections
- [ ] API-CAT-032: `POST /admin/collections` — create collection
- [ ] API-CAT-033: `GET /looks` — list looks
- [ ] API-CAT-034: `POST /admin/looks` — create look

#### CMS [P1]
- [ ] API-CAT-035: `GET /cms/admin/banners` — list banners
- [ ] API-CAT-036: `POST /cms/admin/banners` — create banner
- [ ] API-CAT-037: `PUT /cms/admin/banners/:id` — update banner
- [ ] API-CAT-038: `DELETE /cms/admin/banners/:id` — delete banner
- [ ] API-CAT-039: `GET /cms/admin/menus` — list menus
- [ ] API-CAT-040: `POST /cms/admin/media/upload` — upload media file

---

### A3. Order Service (port 8003) — 35 tests

#### Cart [P0]
- [ ] API-ORD-001: `GET /cart` — get empty cart (session-based)
- [ ] API-ORD-002: `POST /cart/items` — add item to cart
- [ ] API-ORD-003: `PUT /cart/items/:itemId` — update item quantity
- [ ] API-ORD-004: `DELETE /cart/items/:itemId` — remove item from cart
- [ ] API-ORD-005: `DELETE /cart` — clear cart
- [ ] API-ORD-006: `POST /cart/coupon` — apply coupon code
- [ ] API-ORD-007: `DELETE /cart/coupon` — remove coupon
- [ ] API-ORD-008: `POST /cart/flash-sale` — add flash sale item with reservation

#### Checkout / Orders [P0]
- [ ] API-ORD-009: `POST /orders` — create order (guest checkout)
- [ ] API-ORD-010: `POST /orders` — create order (authenticated user)
- [ ] API-ORD-011: `GET /orders` — list customer orders (auth required)
- [ ] API-ORD-012: `GET /orders/:id` — get order detail
- [ ] API-ORD-013: `GET /orders/:id/confirmation` — get order confirmation
- [ ] API-ORD-014: `POST /orders/:id/cancel` — cancel order

#### Shipping [P0]
- [ ] API-ORD-015: `GET /shipping/methods` — get shipping methods
- [ ] API-ORD-016: `POST /shipping/rates` — calculate shipping rates

#### Payment [P0]
- [ ] API-ORD-017: `POST /payment/process` — process payment
- [ ] API-ORD-018: `POST /payment/curlec/initiate` — initiate FPX payment

#### Returns - Customer [P1]
- [ ] API-ORD-019: `GET /returns/reasons` — get return reasons
- [ ] API-ORD-020: `POST /returns` — create return request
- [ ] API-ORD-021: `GET /returns` — list my returns
- [ ] API-ORD-022: `GET /returns/:id` — get return detail
- [ ] API-ORD-023: `POST /returns/:id/cancel` — cancel return
- [ ] API-ORD-024: `POST /returns/:id/tracking` — add tracking info

#### Admin Orders [P1]
- [ ] API-ORD-025: `GET /admin/orders` — list all orders
- [ ] API-ORD-026: `GET /admin/orders/stats` — order statistics
- [ ] API-ORD-027: `POST /admin/orders/:id/fulfill` — fulfill order
- [ ] API-ORD-028: `POST /admin/orders/:id/cancel` — cancel order (admin)
- [ ] API-ORD-029: `POST /admin/orders/:id/refund` — refund order
- [ ] API-ORD-030: `POST /admin/orders/:id/notes` — add order note
- [ ] API-ORD-031: `POST /admin/orders/:id/consignment` — create consignment AWB

#### Admin Returns [P1]
- [ ] API-ORD-032: `GET /admin/returns` — list all returns
- [ ] API-ORD-033: `POST /admin/returns/:id/approve` — approve return
- [ ] API-ORD-034: `POST /admin/returns/:id/reject` — reject return
- [ ] API-ORD-035: `POST /admin/returns/:id/refund` — process refund

---

### A4. Customer Service (port 8004) — 20 tests

#### Profile [P0]
- [ ] API-CUS-001: `GET /customer/profile` — get own profile
- [ ] API-CUS-002: `PUT /customer/profile` — update profile
- [ ] API-CUS-003: `GET /customer/profile` — returns 401 without auth

#### Addresses [P0]
- [ ] API-CUS-004: `GET /customer/addresses` — list addresses
- [ ] API-CUS-005: `POST /customer/addresses` — create address
- [ ] API-CUS-006: `PUT /customer/addresses/:id` — update address
- [ ] API-CUS-007: `DELETE /customer/addresses/:id` — delete address
- [ ] API-CUS-008: `PUT /customer/addresses/:id/default` — set default

#### Wishlist [P1]
- [ ] API-CUS-009: `GET /customer/wishlist` — list wishlist
- [ ] API-CUS-010: `POST /customer/wishlist` — add to wishlist
- [ ] API-CUS-011: `DELETE /customer/wishlist/:productId` — remove from wishlist
- [ ] API-CUS-012: `GET /customer/wishlist/check/:productId` — check if wishlisted

#### Measurements [P2]
- [ ] API-CUS-013: `GET /customer/measurements` — list measurements
- [ ] API-CUS-014: `POST /customer/measurements` — create measurement
- [ ] API-CUS-015: `PUT /customer/measurements/:id` — update measurement

#### Back-in-Stock [P2]
- [ ] API-CUS-016: `POST /customer/back-in-stock` — subscribe to restock
- [ ] API-CUS-017: `GET /customer/back-in-stock` — list subscriptions

#### Admin [P1]
- [ ] API-CUS-018: `GET /admin/customers` — list customers
- [ ] API-CUS-019: `GET /admin/customers/:id` — get customer detail
- [ ] API-CUS-020: `GET /admin/customers/stats` — customer stats

---

### A5. Inventory Service (port 8005) — 18 tests

#### Public Availability [P0]
- [ ] API-INV-001: `GET /inventory/availability/:product_id` — check product availability
- [ ] API-INV-002: `GET /inventory/availability/:product_id/:variant_id` — variant availability
- [ ] API-INV-003: `POST /inventory/availability/bulk` — bulk availability check

#### Stock Management [P1]
- [ ] API-INV-004: `GET /admin/inventory` — list stock items
- [ ] API-INV-005: `GET /admin/inventory/stats` — inventory statistics
- [ ] API-INV-006: `GET /admin/inventory/low-stock` — low stock items
- [ ] API-INV-007: `GET /admin/inventory/product/:id` — stock for specific product
- [ ] API-INV-008: `POST /admin/inventory/product/:id/adjust` — adjust stock
- [ ] API-INV-009: `POST /admin/inventory/product/:id/set` — set stock level
- [ ] API-INV-010: `PUT /admin/inventory/product/:id/threshold` — update low-stock threshold

#### Warehouses [P1]
- [ ] API-INV-011: `GET /inventory/warehouses` — list warehouses
- [ ] API-INV-012: `POST /inventory/warehouses` — create warehouse
- [ ] API-INV-013: `PUT /inventory/warehouses/:id` — update warehouse
- [ ] API-INV-014: `DELETE /inventory/warehouses/:id` — delete warehouse

#### Transfers [P2]
- [ ] API-INV-015: `POST /inventory/transfers` — create transfer
- [ ] API-INV-016: `PUT /inventory/transfers/:id/approve` — approve transfer
- [ ] API-INV-017: `PUT /inventory/transfers/:id/complete` — complete transfer

#### Internal [P0]
- [ ] API-INV-018: `POST /internal/stock/reserve` — reserve stock (service-to-service)

---

### A6. Marketplace Service (port 8008) — 14 tests

#### Connections [P1]
- [ ] API-MKT-001: `GET /admin/marketplace/connections` — list connections
- [ ] API-MKT-002: `GET /admin/marketplace/connections/active` — active connections
- [ ] API-MKT-003: `POST /admin/marketplace/shopee/auth-url` — get Shopee auth URL
- [ ] API-MKT-004: `DELETE /admin/marketplace/connections/:id` — disconnect

#### Product Sync [P1]
- [ ] API-MKT-005: `GET /admin/marketplace/connections/:id/products` — mapped products
- [ ] API-MKT-006: `POST /admin/marketplace/connections/:id/products/push` — push products
- [ ] API-MKT-007: `POST /admin/marketplace/connections/:id/products/import` — import products
- [ ] API-MKT-008: `POST /admin/marketplace/connections/:id/products/auto-match` — auto match SKU

#### Order Sync [P1]
- [ ] API-MKT-009: `GET /admin/marketplace/connections/:id/orders` — marketplace orders
- [ ] API-MKT-010: `POST /admin/marketplace/connections/:id/orders/sync` — sync orders

#### Inventory Sync [P1]
- [ ] API-MKT-011: `POST /admin/marketplace/connections/:id/inventory/push` — push inventory
- [ ] API-MKT-012: `POST /admin/marketplace/connections/:id/inventory/reconcile` — reconcile stock

#### Analytics [P2]
- [ ] API-MKT-013: `GET /admin/marketplace/connections/:id/analytics` — marketplace analytics
- [ ] API-MKT-014: `GET /admin/marketplace/connections/:id/analytics/top-products` — top products

---

### A7. Agent Service (port 8009) — 16 tests

#### Agent Admin CRUD [P1]
- [ ] API-AGT-001: `GET /admin/agents` — list agents
- [ ] API-AGT-002: `POST /admin/agents` — create agent
- [ ] API-AGT-003: `GET /admin/agents/:id` — get agent
- [ ] API-AGT-004: `PUT /admin/agents/:id` — update agent
- [ ] API-AGT-005: `DELETE /admin/agents/:id` — delete agent
- [ ] API-AGT-006: `GET /admin/agents/:id/stats` — agent statistics

#### Agent Portal [P1]
- [ ] API-AGT-007: `GET /agent/profile` — get own profile (agent auth)
- [ ] API-AGT-008: `GET /agent/dashboard` — dashboard metrics
- [ ] API-AGT-009: `GET /agent/orders` — agent's orders
- [ ] API-AGT-010: `POST /agent/orders` — create order for customer
- [ ] API-AGT-011: `GET /agent/customers` — agent's customers
- [ ] API-AGT-012: `POST /agent/customers` — register new customer
- [ ] API-AGT-013: `GET /agent/commissions` — commission history

#### Commissions & Payouts [P1]
- [ ] API-AGT-014: `POST /commissions` — create commission
- [ ] API-AGT-015: `PUT /commissions/:id/approve` — approve commission
- [ ] API-AGT-016: `POST /payouts` — create payout

---

### A8. Support Service (port 8010) — 14 tests

#### Public [P1]
- [ ] API-SUP-001: `POST /support/contact` — submit contact form (no auth)
- [ ] API-SUP-002: `GET /support/categories` — get support categories

#### Customer Tickets [P1]
- [ ] API-SUP-003: `POST /support/tickets` — create ticket (auth required)
- [ ] API-SUP-004: `GET /support/tickets` — list my tickets
- [ ] API-SUP-005: `GET /support/tickets/:id` — get ticket detail
- [ ] API-SUP-006: `POST /support/tickets/:id/messages` — add message
- [ ] API-SUP-007: `POST /support/tickets/:id/rate` — rate ticket

#### Admin Support [P1]
- [ ] API-SUP-008: `GET /admin/support/stats` — dashboard stats
- [ ] API-SUP-009: `GET /admin/support/tickets` — list all tickets
- [ ] API-SUP-010: `POST /admin/support/tickets/:id/reply` — reply to ticket
- [ ] API-SUP-011: `PUT /admin/support/tickets/:id/assign` — assign ticket
- [ ] API-SUP-012: `POST /admin/support/tickets/:id/close` — close ticket

#### Categories & Canned Responses [P2]
- [ ] API-SUP-013: `POST /admin/support/categories` — create category
- [ ] API-SUP-014: `POST /admin/support/canned-responses` — create canned response

---

### A9. Reporting Service (port 8007) — 12 tests

#### Sales Reports [P1]
- [ ] API-RPT-001: `GET /reports/sales/summary` — sales summary
- [ ] API-RPT-002: `GET /reports/sales/trends` — sales trends
- [ ] API-RPT-003: `GET /reports/sales/top-products` — top products

#### Inventory Reports [P1]
- [ ] API-RPT-004: `GET /reports/inventory/stock-levels` — stock levels
- [ ] API-RPT-005: `GET /reports/inventory/low-stock` — low stock alerts

#### Order Reports [P1]
- [ ] API-RPT-006: `GET /reports/orders/status-breakdown` — order status
- [ ] API-RPT-007: `GET /reports/orders/fulfillment-metrics` — fulfillment metrics

#### Analytics [P2]
- [ ] API-RPT-008: `GET /analytics/dashboard` — analytics dashboard
- [ ] API-RPT-009: `GET /analytics/funnel` — conversion funnel

#### Export [P1]
- [ ] API-RPT-010: `GET /reports/export/sales` — export sales CSV
- [ ] API-RPT-011: `GET /reports/export/inventory` — export inventory CSV

#### Scheduled Reports [P2]
- [ ] API-RPT-012: `POST /scheduled-reports` — create scheduled report

---

### A10. Cross-Service Integration — 12 tests

#### Full Purchase Flow [P0]
- [ ] CROSS-001: Browse product → Add to cart → Checkout → Order created (catalog + order)
- [ ] CROSS-002: Order created → Stock deducted (order + inventory)
- [ ] CROSS-003: Order created → Payment processed → Status updated (order + payment)
- [ ] CROSS-004: Order paid → Fulfillment → Delivered (order lifecycle)

#### Return Flow [P0]
- [ ] CROSS-005: Initiate return → Approve → Receive → Refund (full return lifecycle)
- [ ] CROSS-006: Return received → Stock restored (returns + inventory)

#### Auth Integration [P0]
- [ ] CROSS-007: Login → Access all services with same JWT token
- [ ] CROSS-008: Non-admin token rejected by admin endpoints across all services

#### Marketplace Flow [P1]
- [ ] CROSS-009: Push product to Shopee → Verify mapping created
- [ ] CROSS-010: Marketplace order sync → Internal order created

#### Agent Commission Flow [P1]
- [ ] CROSS-011: Agent creates order → Order paid → Commission created
- [ ] CROSS-012: Commission approved → Payout created → Payout paid

---

## B. Storefront UI E2E Tests (frontend-storefront/e2e/)

### Authentication [P0]
- [ ] SF-AUTH-001: Register new customer account
- [ ] SF-AUTH-002: Login with valid credentials
- [ ] SF-AUTH-003: Login with invalid credentials shows error
- [ ] SF-AUTH-004: Forgot password flow
- [ ] SF-AUTH-005: Logout clears session

### Product Browsing [P0]
- [ ] SF-BROWSE-001: Homepage loads with hero carousel + featured products
- [ ] SF-BROWSE-002: Products listing page with pagination
- [ ] SF-BROWSE-003: Filter products by category
- [ ] SF-BROWSE-004: Search products and see results
- [ ] SF-BROWSE-005: Category page displays products
- [ ] SF-BROWSE-006: Collections page loads

### Product Detail [P0]
- [ ] SF-PDP-001: Product detail page loads with images
- [ ] SF-PDP-002: Variant selection updates price/availability
- [ ] SF-PDP-003: Add to cart from PDP
- [ ] SF-PDP-004: Quantity selector works
- [ ] SF-PDP-005: Reviews section displays
- [ ] SF-PDP-006: Related products / recommendations shown

### Cart [P0]
- [ ] SF-CART-001: Add item to cart, cart indicator updates
- [ ] SF-CART-002: Update item quantity in cart
- [ ] SF-CART-003: Remove item from cart
- [ ] SF-CART-004: Cart page shows correct totals
- [ ] SF-CART-005: Apply coupon code
- [ ] SF-CART-006: Cart persists after page refresh

### Checkout [P0]
- [ ] SF-CHECKOUT-001: Navigate from cart to checkout
- [ ] SF-CHECKOUT-002: Fill shipping address form
- [ ] SF-CHECKOUT-003: Select shipping method and see rate
- [ ] SF-CHECKOUT-004: Select payment method
- [ ] SF-CHECKOUT-005: Place order and see confirmation page
- [ ] SF-CHECKOUT-006: Guest checkout (no account)
- [ ] SF-CHECKOUT-007: Authenticated checkout with saved address

### Account Management [P1]
- [ ] SF-ACCOUNT-001: View profile page
- [ ] SF-ACCOUNT-002: Update profile details
- [ ] SF-ACCOUNT-003: View/add/edit addresses
- [ ] SF-ACCOUNT-004: View order history
- [ ] SF-ACCOUNT-005: View order detail with shipping timeline
- [ ] SF-ACCOUNT-006: Measurements page (create/edit)

### Wishlist [P1]
- [ ] SF-WISH-001: Add product to wishlist
- [ ] SF-WISH-002: View wishlist page
- [ ] SF-WISH-003: Remove from wishlist

### Returns [P1]
- [ ] SF-RETURN-001: Initiate return from order detail
- [ ] SF-RETURN-002: View return status
- [ ] SF-RETURN-003: Cancel return request

### Support [P1]
- [ ] SF-SUPPORT-001: Create support ticket
- [ ] SF-SUPPORT-002: View ticket list
- [ ] SF-SUPPORT-003: Add message to ticket

### Agent Portal (storefront) [P1]
- [ ] SF-AGENT-001: Agent login
- [ ] SF-AGENT-002: Agent dashboard loads with stats
- [ ] SF-AGENT-003: Agent views customer list
- [ ] SF-AGENT-004: Agent creates order for customer
- [ ] SF-AGENT-005: Agent views commissions

### Flash Sales [P2]
- [ ] SF-FLASH-001: View active flash sale page with countdown
- [ ] SF-FLASH-002: Add flash sale item to cart

### Tailoring [P2]
- [ ] SF-TAILOR-001: View tailoring order wizard
- [ ] SF-TAILOR-002: Complete tailoring order flow

---

## C. Admin UI E2E Tests — New Specs (frontend-admin/e2e/)

### Marketplace (marketplace.spec.ts) [P1]
- [ ] ADMIN-MKT-001: Navigate to marketplace page
- [ ] ADMIN-MKT-002: View connections list
- [ ] ADMIN-MKT-003: View mapped products for connection
- [ ] ADMIN-MKT-004: Trigger product push
- [ ] ADMIN-MKT-005: Trigger order sync
- [ ] ADMIN-MKT-006: View marketplace analytics

### Agent Management (agents.spec.ts) [P1]
- [ ] ADMIN-AGT-001: Navigate to agents page
- [ ] ADMIN-AGT-002: Create new agent
- [ ] ADMIN-AGT-003: Edit agent details
- [ ] ADMIN-AGT-004: View agent commissions
- [ ] ADMIN-AGT-005: Approve pending commission
- [ ] ADMIN-AGT-006: Create payout

### Support Tickets (support.spec.ts) [P1]
- [ ] ADMIN-SUP-001: Navigate to support page
- [ ] ADMIN-SUP-002: View ticket list with filters
- [ ] ADMIN-SUP-003: Open ticket detail
- [ ] ADMIN-SUP-004: Reply to ticket
- [ ] ADMIN-SUP-005: Assign ticket to staff
- [ ] ADMIN-SUP-006: Close ticket
- [ ] ADMIN-SUP-007: Manage support categories

### Returns Processing (returns.spec.ts) [P1]
- [ ] ADMIN-RET-001: Navigate to returns page
- [ ] ADMIN-RET-002: View return detail
- [ ] ADMIN-RET-003: Approve return
- [ ] ADMIN-RET-004: Reject return with reason
- [ ] ADMIN-RET-005: Process refund for return

### Reports & Analytics (reports.spec.ts) [P1]
- [ ] ADMIN-RPT-001: Navigate to reports page
- [ ] ADMIN-RPT-002: View sales summary report
- [ ] ADMIN-RPT-003: View inventory report
- [ ] ADMIN-RPT-004: Export report to CSV
- [ ] ADMIN-RPT-005: View analytics dashboard

### Flash Sales (flash-sales.spec.ts) [P1]
- [ ] ADMIN-FS-001: Navigate to flash sales page
- [ ] ADMIN-FS-002: Create flash sale
- [ ] ADMIN-FS-003: Add items to flash sale
- [ ] ADMIN-FS-004: Activate/deactivate flash sale

### Settings (settings.spec.ts) [P1]
- [ ] ADMIN-SET-001: Navigate to settings pages
- [ ] ADMIN-SET-002: Update shipping settings
- [ ] ADMIN-SET-003: Manage payment methods
- [ ] ADMIN-SET-004: Manage user roles

---

## Progress Summary

| Section | Total | Done | % |
|---------|-------|------|---|
| A1. Auth API | 28 | 0 | 0% |
| A2. Catalog API | 40 | 0 | 0% |
| A3. Order API | 35 | 0 | 0% |
| A4. Customer API | 20 | 0 | 0% |
| A5. Inventory API | 18 | 0 | 0% |
| A6. Marketplace API | 14 | 0 | 0% |
| A7. Agent API | 16 | 0 | 0% |
| A8. Support API | 14 | 0 | 0% |
| A9. Reporting API | 12 | 0 | 0% |
| A10. Cross-Service | 12 | 0 | 0% |
| B. Storefront UI | 52 | 0 | 0% |
| C. Admin UI (new) | 35 | 0 | 0% |
| **TOTAL** | **296** | **0** | **0%** |
