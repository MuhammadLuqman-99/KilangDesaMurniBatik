# E2E Testing Tracker — KilangDesaMurniBatik

> **Total Tests: ~830** | All Written | Next: Run & verify against live services
>
> **Status:** All spec files created. Tests need to be executed against live services to verify passing.
>
> **Test Projects:**
> - `e2e-tests/` — Backend API tests (Playwright APIRequestContext, no browser)
> - `frontend-admin/e2e/` — Admin panel UI + API tests (Playwright browser)
> - `frontend-storefront/e2e/` — Storefront UI tests (Playwright browser)

---

## A. Backend API E2E Tests (`e2e-tests/`)

### A1. Auth Service (port 8001) — 28 tests

#### Login / Logout [P0]
- [x] API-AUTH-001: `POST /auth/login` — valid admin credentials returns token + user
- [x] API-AUTH-002: `POST /auth/login` — invalid password returns 401
- [x] API-AUTH-003: `POST /auth/login` — nonexistent email returns 401
- [x] API-AUTH-004: `POST /auth/login` — empty body returns 400
- [x] API-AUTH-005: `POST /auth/login` — SQL injection handled safely
- [x] API-AUTH-006: `POST /auth/logout` — invalidates token
- [x] API-AUTH-007: `POST /auth/refresh` — valid refresh token returns new access token
- [x] API-AUTH-008: `POST /auth/refresh` — expired refresh token returns 401

#### Protected Routes [P0]
- [x] API-AUTH-009: `GET /auth/me` — returns current user with valid token
- [x] API-AUTH-010: `GET /auth/me` — returns 401 without token
- [x] API-AUTH-011: `GET /auth/me` — returns 401 with expired token
- [x] API-AUTH-012: `PUT /auth/me` — update profile fields
- [x] API-AUTH-013: `POST /auth/change-password` — succeeds with correct old password
- [x] API-AUTH-014: `POST /auth/change-password` — rejects wrong old password
- [x] API-AUTH-015: `GET /auth/verify` — token verification

#### 2FA [P1]
- [x] API-AUTH-016: `GET /auth/2fa/status` — returns 2FA status
- [x] API-AUTH-017: `GET /auth/2fa/setup` — returns QR code
- [x] API-AUTH-018: `POST /auth/2fa/enable` — enable with valid TOTP
- [x] API-AUTH-019: `POST /auth/2fa/disable` — disable with valid code

#### RBAC [P1]
- [x] API-AUTH-020: `GET /admin/users` — list users (admin only)
- [x] API-AUTH-021: `POST /admin/users` — create user
- [x] API-AUTH-022: `GET /admin/roles` — list roles
- [x] API-AUTH-023: `POST /admin/roles` — create role with permissions
- [x] API-AUTH-024: `GET /admin/permissions` — list all permissions
- [x] API-AUTH-025: `POST /admin/users/:id/roles` — assign role to user

#### Settings [P1]
- [x] API-AUTH-026: `GET /admin/settings` — get all settings
- [x] API-AUTH-027: `PUT /admin/settings/general` — update general settings
- [x] API-AUTH-028: `GET /admin/activity-logs` — get activity logs

---

### A2. Catalog Service (port 8002) — 40 tests

#### Products - Public [P0]
- [x] API-CAT-001: `GET /products` — list products with pagination
- [x] API-CAT-002: `GET /products?category_id=X` — filter by category
- [x] API-CAT-003: `GET /products?sort=price_asc` — sort by price
- [x] API-CAT-004: `GET /products/:slug` — get product by slug
- [x] API-CAT-005: `GET /products/:slug` — returns 404 for nonexistent slug
- [x] API-CAT-006: `GET /products/:slug/availability` — variant availability matrix

#### Categories - Public [P0]
- [x] API-CAT-007: `GET /categories` — list all categories
- [x] API-CAT-008: `GET /categories/featured` — featured categories
- [x] API-CAT-009: `GET /categories/:slug` — get category by slug
- [x] API-CAT-010: `GET /categories/:slug/products` — category products with pagination

#### Search [P0]
- [x] API-CAT-011: `GET /search?q=batik` — full-text search returns results
- [x] API-CAT-012: `GET /search?q=nonexistent` — empty results for no match
- [x] API-CAT-013: `GET /search/suggestions?q=bat` — autocomplete suggestions

#### Products - Admin [P1]
- [x] API-CAT-014: `POST /admin/products` — create product with variants
- [x] API-CAT-015: `PUT /admin/products/:id` — update product
- [x] API-CAT-016: `DELETE /admin/products/:id` — soft delete product
- [x] API-CAT-017: `PATCH /admin/products/:id/status` — change active/draft
- [x] API-CAT-018: `POST /admin/products/:id/duplicate` — duplicate product
- [x] API-CAT-019: `PUT /admin/products/bulk` — bulk update
- [x] API-CAT-020: `POST /admin/products/:id/variants` — create variant
- [x] API-CAT-021: `PUT /admin/products/:id/variants/:vid` — update variant
- [x] API-CAT-022: `DELETE /admin/products/:id/variants/:vid` — delete variant
- [x] API-CAT-023: `GET /admin/products/export` — CSV export

#### Categories - Admin [P1]
- [x] API-CAT-024: `POST /admin/categories` — create category
- [x] API-CAT-025: `PUT /admin/categories/:id` — update category
- [x] API-CAT-026: `DELETE /admin/categories/:id` — delete category

#### Flash Sales [P1]
- [x] API-CAT-027: `GET /flash-sales/active` — get active flash sales
- [x] API-CAT-028: `GET /flash-sales/:slug` — get flash sale details
- [x] API-CAT-029: `POST /admin/flash-sales` — create flash sale
- [x] API-CAT-030: `POST /admin/flash-sales/:id/items` — add item to flash sale

#### Collections [P2]
- [x] API-CAT-031: `GET /collections` — list collections
- [x] API-CAT-032: `POST /admin/collections` — create collection
- [x] API-CAT-033: `GET /looks` — list looks
- [x] API-CAT-034: `POST /admin/looks` — create look

#### CMS [P1]
- [x] API-CAT-035: `GET /cms/admin/banners` — list banners
- [x] API-CAT-036: `POST /cms/admin/banners` — create banner
- [x] API-CAT-037: `PUT /cms/admin/banners/:id` — update banner
- [x] API-CAT-038: `DELETE /cms/admin/banners/:id` — delete banner
- [x] API-CAT-039: `GET /cms/admin/menus` — list menus
- [x] API-CAT-040: `POST /cms/admin/media/upload` — upload media file

---

### A3. Order Service (port 8003) — 35 tests

#### Cart [P0]
- [x] API-ORD-001: `GET /cart` — get empty cart (session-based)
- [x] API-ORD-002: `POST /cart/items` — add item to cart
- [x] API-ORD-003: `PUT /cart/items/:itemId` — update item quantity
- [x] API-ORD-004: `DELETE /cart/items/:itemId` — remove item from cart
- [x] API-ORD-005: `DELETE /cart` — clear cart
- [x] API-ORD-006: `POST /cart/coupon` — apply coupon code
- [x] API-ORD-007: `DELETE /cart/coupon` — remove coupon
- [x] API-ORD-008: `POST /cart/flash-sale` — add flash sale item with reservation

#### Checkout / Orders [P0]
- [x] API-ORD-009: `POST /orders` — create order (guest checkout)
- [x] API-ORD-010: `POST /orders` — create order (authenticated user)
- [x] API-ORD-011: `GET /orders` — list customer orders (auth required)
- [x] API-ORD-012: `GET /orders/:id` — get order detail
- [x] API-ORD-013: `GET /orders/:id/confirmation` — get order confirmation
- [x] API-ORD-014: `POST /orders/:id/cancel` — cancel order

#### Shipping [P0]
- [x] API-ORD-015: `GET /shipping/methods` — get shipping methods
- [x] API-ORD-016: `POST /shipping/rates` — calculate shipping rates

#### Payment [P0]
- [x] API-ORD-017: `POST /payment/process` — process payment
- [x] API-ORD-018: `POST /payment/curlec/initiate` — initiate FPX payment

#### Returns - Customer [P1]
- [x] API-ORD-019: `GET /returns/reasons` — get return reasons
- [x] API-ORD-020: `POST /returns` — create return request
- [x] API-ORD-021: `GET /returns` — list my returns
- [x] API-ORD-022: `GET /returns/:id` — get return detail
- [x] API-ORD-023: `POST /returns/:id/cancel` — cancel return
- [x] API-ORD-024: `POST /returns/:id/tracking` — add tracking info

#### Admin Orders [P1]
- [x] API-ORD-025: `GET /admin/orders` — list all orders
- [x] API-ORD-026: `GET /admin/orders/stats` — order statistics
- [x] API-ORD-027: `POST /admin/orders/:id/fulfill` — fulfill order
- [x] API-ORD-028: `POST /admin/orders/:id/cancel` — cancel order (admin)
- [x] API-ORD-029: `POST /admin/orders/:id/refund` — refund order
- [x] API-ORD-030: `POST /admin/orders/:id/notes` — add order note
- [x] API-ORD-031: `POST /admin/orders/:id/consignment` — create consignment AWB

#### Admin Returns [P1]
- [x] API-ORD-032: `GET /admin/returns` — list all returns
- [x] API-ORD-033: `POST /admin/returns/:id/approve` — approve return
- [x] API-ORD-034: `POST /admin/returns/:id/reject` — reject return
- [x] API-ORD-035: `POST /admin/returns/:id/refund` — process refund

---

### A4. Customer Service (port 8004) — 20 tests

#### Profile [P0]
- [x] API-CUS-001: `GET /customer/profile` — get own profile
- [x] API-CUS-002: `PUT /customer/profile` — update profile
- [x] API-CUS-003: `GET /customer/profile` — returns 401 without auth

#### Addresses [P0]
- [x] API-CUS-004: `GET /customer/addresses` — list addresses
- [x] API-CUS-005: `POST /customer/addresses` — create address
- [x] API-CUS-006: `PUT /customer/addresses/:id` — update address
- [x] API-CUS-007: `DELETE /customer/addresses/:id` — delete address
- [x] API-CUS-008: `PUT /customer/addresses/:id/default` — set default

#### Wishlist [P1]
- [x] API-CUS-009: `GET /customer/wishlist` — list wishlist
- [x] API-CUS-010: `POST /customer/wishlist` — add to wishlist
- [x] API-CUS-011: `DELETE /customer/wishlist/:productId` — remove from wishlist
- [x] API-CUS-012: `GET /customer/wishlist/check/:productId` — check if wishlisted

#### Measurements [P2]
- [x] API-CUS-013: `GET /customer/measurements` — list measurements
- [x] API-CUS-014: `POST /customer/measurements` — create measurement
- [x] API-CUS-015: `PUT /customer/measurements/:id` — update measurement

#### Back-in-Stock [P2]
- [x] API-CUS-016: `POST /customer/back-in-stock` — subscribe to restock
- [x] API-CUS-017: `GET /customer/back-in-stock` — list subscriptions

#### Admin [P1]
- [x] API-CUS-018: `GET /admin/customers` — list customers
- [x] API-CUS-019: `GET /admin/customers/:id` — get customer detail
- [x] API-CUS-020: `GET /admin/customers/stats` — customer stats

---

### A5. Inventory Service (port 8005) — 18 tests

#### Public Availability [P0]
- [x] API-INV-001: `GET /inventory/availability/:product_id` — check product availability
- [x] API-INV-002: `GET /inventory/availability/:product_id/:variant_id` — variant availability
- [x] API-INV-003: `POST /inventory/availability/bulk` — bulk availability check

#### Stock Management [P1]
- [x] API-INV-004: `GET /admin/inventory` — list stock items
- [x] API-INV-005: `GET /admin/inventory/stats` — inventory statistics
- [x] API-INV-006: `GET /admin/inventory/low-stock` — low stock items
- [x] API-INV-007: `GET /admin/inventory/product/:id` — stock for specific product
- [x] API-INV-008: `POST /admin/inventory/product/:id/adjust` — adjust stock
- [x] API-INV-009: `POST /admin/inventory/product/:id/set` — set stock level
- [x] API-INV-010: `PUT /admin/inventory/product/:id/threshold` — update low-stock threshold

#### Warehouses [P1]
- [x] API-INV-011: `GET /inventory/warehouses` — list warehouses
- [x] API-INV-012: `POST /inventory/warehouses` — create warehouse
- [x] API-INV-013: `PUT /inventory/warehouses/:id` — update warehouse
- [x] API-INV-014: `DELETE /inventory/warehouses/:id` — delete warehouse

#### Transfers [P2]
- [x] API-INV-015: `POST /inventory/transfers` — create transfer
- [x] API-INV-016: `PUT /inventory/transfers/:id/approve` — approve transfer
- [x] API-INV-017: `PUT /inventory/transfers/:id/complete` — complete transfer

#### Internal [P0]
- [x] API-INV-018: `POST /internal/stock/reserve` — reserve stock (service-to-service)

---

### A6. Marketplace Service (port 8008) — 14 tests

#### Connections [P1]
- [x] API-MKT-001: `GET /admin/marketplace/connections` — list connections
- [x] API-MKT-002: `GET /admin/marketplace/connections/active` — active connections
- [x] API-MKT-003: `POST /admin/marketplace/shopee/auth-url` — get Shopee auth URL
- [x] API-MKT-004: `DELETE /admin/marketplace/connections/:id` — disconnect

#### Product Sync [P1]
- [x] API-MKT-005: `GET /admin/marketplace/connections/:id/products` — mapped products
- [x] API-MKT-006: `POST /admin/marketplace/connections/:id/products/push` — push products
- [x] API-MKT-007: `POST /admin/marketplace/connections/:id/products/import` — import products
- [x] API-MKT-008: `POST /admin/marketplace/connections/:id/products/auto-match` — auto match SKU

#### Order Sync [P1]
- [x] API-MKT-009: `GET /admin/marketplace/connections/:id/orders` — marketplace orders
- [x] API-MKT-010: `POST /admin/marketplace/connections/:id/orders/sync` — sync orders

#### Inventory Sync [P1]
- [x] API-MKT-011: `POST /admin/marketplace/connections/:id/inventory/push` — push inventory
- [x] API-MKT-012: `POST /admin/marketplace/connections/:id/inventory/reconcile` — reconcile stock

#### Analytics [P2]
- [x] API-MKT-013: `GET /admin/marketplace/connections/:id/analytics` — marketplace analytics
- [x] API-MKT-014: `GET /admin/marketplace/connections/:id/analytics/top-products` — top products

---

### A7. Agent Service (port 8009) — 16 tests

#### Agent Admin CRUD [P1]
- [x] API-AGT-001: `GET /admin/agents` — list agents
- [x] API-AGT-002: `POST /admin/agents` — create agent
- [x] API-AGT-003: `GET /admin/agents/:id` — get agent
- [x] API-AGT-004: `PUT /admin/agents/:id` — update agent
- [x] API-AGT-005: `DELETE /admin/agents/:id` — delete agent
- [x] API-AGT-006: `GET /admin/agents/:id/stats` — agent statistics

#### Agent Portal [P1]
- [x] API-AGT-007: `GET /agent/profile` — get own profile (agent auth)
- [x] API-AGT-008: `GET /agent/dashboard` — dashboard metrics
- [x] API-AGT-009: `GET /agent/orders` — agent's orders
- [x] API-AGT-010: `POST /agent/orders` — create order for customer
- [x] API-AGT-011: `GET /agent/customers` — agent's customers
- [x] API-AGT-012: `POST /agent/customers` — register new customer
- [x] API-AGT-013: `GET /agent/commissions` — commission history

#### Commissions & Payouts [P1]
- [x] API-AGT-014: `POST /commissions` — create commission
- [x] API-AGT-015: `PUT /commissions/:id/approve` — approve commission
- [x] API-AGT-016: `POST /payouts` — create payout

---

### A8. Support Service (port 8010) — 14 tests

#### Public [P1]
- [x] API-SUP-001: `POST /support/contact` — submit contact form (no auth)
- [x] API-SUP-002: `GET /support/categories` — get support categories

#### Customer Tickets [P1]
- [x] API-SUP-003: `POST /support/tickets` — create ticket (auth required)
- [x] API-SUP-004: `GET /support/tickets` — list my tickets
- [x] API-SUP-005: `GET /support/tickets/:id` — get ticket detail
- [x] API-SUP-006: `POST /support/tickets/:id/messages` — add message
- [x] API-SUP-007: `POST /support/tickets/:id/rate` — rate ticket

#### Admin Support [P1]
- [x] API-SUP-008: `GET /admin/support/stats` — dashboard stats
- [x] API-SUP-009: `GET /admin/support/tickets` — list all tickets
- [x] API-SUP-010: `POST /admin/support/tickets/:id/reply` — reply to ticket
- [x] API-SUP-011: `PUT /admin/support/tickets/:id/assign` — assign ticket
- [x] API-SUP-012: `POST /admin/support/tickets/:id/close` — close ticket

#### Categories & Canned Responses [P2]
- [x] API-SUP-013: `POST /admin/support/categories` — create category
- [x] API-SUP-014: `POST /admin/support/canned-responses` — create canned response

---

### A9. Reporting Service (port 8007) — 12 tests

#### Sales Reports [P1]
- [x] API-RPT-001: `GET /reports/sales/summary` — sales summary
- [x] API-RPT-002: `GET /reports/sales/trends` — sales trends
- [x] API-RPT-003: `GET /reports/sales/top-products` — top products

#### Inventory Reports [P1]
- [x] API-RPT-004: `GET /reports/inventory/stock-levels` — stock levels
- [x] API-RPT-005: `GET /reports/inventory/low-stock` — low stock alerts

#### Order Reports [P1]
- [x] API-RPT-006: `GET /reports/orders/status-breakdown` — order status
- [x] API-RPT-007: `GET /reports/orders/fulfillment-metrics` — fulfillment metrics

#### Analytics [P2]
- [x] API-RPT-008: `GET /analytics/dashboard` — analytics dashboard
- [x] API-RPT-009: `GET /analytics/funnel` — conversion funnel

#### Export [P1]
- [x] API-RPT-010: `GET /reports/export/sales` — export sales CSV
- [x] API-RPT-011: `GET /reports/export/inventory` — export inventory CSV

#### Scheduled Reports [P2]
- [x] API-RPT-012: `POST /scheduled-reports` — create scheduled report

---

### A10. Cross-Service Integration — 12 tests

#### Full Purchase Flow [P0]
- [x] CROSS-001: Browse product → Add to cart → Checkout → Order created (catalog + order)
- [x] CROSS-002: Order created → Stock deducted (order + inventory)
- [x] CROSS-003: Order created → Payment processed → Status updated (order + payment)
- [x] CROSS-004: Order paid → Fulfillment → Delivered (order lifecycle)

#### Return Flow [P0]
- [x] CROSS-005: Initiate return → Approve → Receive → Refund (full return lifecycle)
- [x] CROSS-006: Return received → Stock restored (returns + inventory)

#### Auth Integration [P0]
- [x] CROSS-007: Login → Access all services with same JWT token
- [x] CROSS-008: Non-admin token rejected by admin endpoints across all services

#### Marketplace Flow [P1]
- [x] CROSS-009: Push product to Shopee → Verify mapping created
- [x] CROSS-010: Marketplace order sync → Internal order created

#### Agent Commission Flow [P1]
- [x] CROSS-011: Agent creates order → Order paid → Commission created
- [x] CROSS-012: Commission approved → Payout created → Payout paid

---

## B. Storefront UI E2E Tests (`frontend-storefront/e2e/`)

### Authentication [P0]
- [x] SF-AUTH-001: Register new customer account
- [x] SF-AUTH-002: Login with valid credentials
- [x] SF-AUTH-003: Login with invalid credentials shows error
- [x] SF-AUTH-004: Forgot password flow
- [x] SF-AUTH-005: Logout clears session

### Product Browsing [P0]
- [x] SF-BROWSE-001: Homepage loads with hero carousel + featured products
- [x] SF-BROWSE-002: Products listing page with pagination
- [x] SF-BROWSE-003: Filter products by category
- [x] SF-BROWSE-004: Search products and see results
- [x] SF-BROWSE-005: Category page displays products
- [x] SF-BROWSE-006: Collections page loads

### Product Detail [P0]
- [x] SF-PDP-001: Product detail page loads with images
- [x] SF-PDP-002: Variant selection updates price/availability
- [x] SF-PDP-003: Add to cart from PDP
- [x] SF-PDP-004: Quantity selector works
- [x] SF-PDP-005: Reviews section displays
- [x] SF-PDP-006: Related products / recommendations shown

### Cart [P0]
- [x] SF-CART-001: Add item to cart, cart indicator updates
- [x] SF-CART-002: Update item quantity in cart
- [x] SF-CART-003: Remove item from cart
- [x] SF-CART-004: Cart page shows correct totals
- [x] SF-CART-005: Apply coupon code
- [x] SF-CART-006: Cart persists after page refresh

### Checkout [P0]
- [x] SF-CHECKOUT-001: Navigate from cart to checkout
- [x] SF-CHECKOUT-002: Fill shipping address form
- [x] SF-CHECKOUT-003: Select shipping method and see rate
- [x] SF-CHECKOUT-004: Select payment method
- [x] SF-CHECKOUT-005: Place order and see confirmation page
- [x] SF-CHECKOUT-006: Guest checkout (no account)
- [x] SF-CHECKOUT-007: Authenticated checkout with saved address

### Account Management [P1]
- [x] SF-ACCOUNT-001: View profile page
- [x] SF-ACCOUNT-002: Update profile details
- [x] SF-ACCOUNT-003: View/add/edit addresses
- [x] SF-ACCOUNT-004: View order history
- [x] SF-ACCOUNT-005: View order detail with shipping timeline
- [x] SF-ACCOUNT-006: Measurements page (create/edit)

### Wishlist [P1]
- [x] SF-WISH-001: Add product to wishlist
- [x] SF-WISH-002: View wishlist page
- [x] SF-WISH-003: Remove from wishlist

### Returns [P1]
- [x] SF-RETURN-001: Initiate return from order detail
- [x] SF-RETURN-002: View return status
- [x] SF-RETURN-003: Cancel return request

### Support [P1]
- [x] SF-SUPPORT-001: Create support ticket
- [x] SF-SUPPORT-002: View ticket list
- [x] SF-SUPPORT-003: Add message to ticket

### Agent Portal (storefront) [P1]
- [x] SF-AGENT-001: Agent login
- [x] SF-AGENT-002: Agent dashboard loads with stats
- [x] SF-AGENT-003: Agent views customer list
- [x] SF-AGENT-004: Agent creates order for customer
- [x] SF-AGENT-005: Agent views commissions

### Flash Sales [P2]
- [x] SF-FLASH-001: View active flash sale page with countdown
- [x] SF-FLASH-002: Add flash sale item to cart

### Tailoring [P2]
- [x] SF-TAILOR-001: View tailoring order wizard
- [x] SF-TAILOR-002: Complete tailoring order flow

---

## C. Admin UI E2E Tests (`frontend-admin/e2e/`)

### C1. Existing Core Tests (262 tests) — All Written

| # | File | Tests | Status |
|---|------|-------|--------|
| 1 | `auth.spec.ts` | 58 | Written |
| 2 | `dashboard.spec.ts` | 32 | Written |
| 3 | `products.spec.ts` | 40 | Written |
| 4 | `categories.spec.ts` | 16 | Written |
| 5 | `orders.spec.ts` | 29 | Written |
| 6 | `inventory.spec.ts` | 18 | Written |
| 7 | `customers-cms-rbac.spec.ts` | 69 | Written |

---

### C2. Product Variants & Images — `product-variants-images.spec.ts` (35 tests) [P0]

#### Variant Creation (10)
- [x] VAR-001: Toggle variant section on product form
- [x] VAR-002: Add variant option (Size)
- [x] VAR-003: Add multiple values to variant option
- [x] VAR-004: Generate variant matrix from options
- [x] VAR-005: Display variant matrix with all combinations
- [x] VAR-006: Set price per variant
- [x] VAR-007: Set stock per variant
- [x] VAR-008: Set SKU per variant
- [x] VAR-009: Save product with variants successfully
- [x] VAR-010: Validate variant prices are positive

#### Variant Editing (7)
- [x] VAR-011: Load existing variants on edit page
- [x] VAR-012: Edit variant price
- [x] VAR-013: Edit variant stock
- [x] VAR-014: Add new variant option to existing product
- [x] VAR-015: Remove variant option
- [x] VAR-016: Delete individual variant
- [x] VAR-017: Save variant changes successfully

#### Product Images (10)
- [x] IMG-001: Display image upload zone
- [x] IMG-002: Upload single image via file input
- [x] IMG-003: Upload multiple images
- [x] IMG-004: Display uploaded image previews
- [x] IMG-005: Set featured image
- [x] IMG-006: Reorder images via drag-and-drop
- [x] IMG-007: Delete an image
- [x] IMG-008: Validate file type (reject non-images)
- [x] IMG-009: Display image alt text field
- [x] IMG-010: Open image lightbox on click

#### API Tests (8)
- [x] API-VAR-001: Create product variant via API
- [x] API-VAR-002: List product variants via API
- [x] API-VAR-003: Update product variant via API
- [x] API-VAR-004: Delete product variant via API
- [x] API-IMG-001: Upload product media via API
- [x] API-IMG-002: Reorder product media via API
- [x] API-IMG-003: Delete product media via API
- [x] API-IMG-004: Remove image background via API

---

### C3. Payment Verification — `payment-verification.spec.ts` (24 tests) [P0]

#### Payment Listing (7)
- [x] PAY-001: Display payments page
- [x] PAY-002: Display payments table with columns
- [x] PAY-003: Display pending payments count
- [x] PAY-004: Filter by status (pending/verified/rejected)
- [x] PAY-005: Search by order number or customer name
- [x] PAY-006: Display pagination
- [x] PAY-007: Sort by date

#### Payment Detail & Verification (10)
- [x] PAY-008: View payment receipt detail
- [x] PAY-009: Display receipt image
- [x] PAY-010: Display depositor information
- [x] PAY-011: Display bank and reference details
- [x] PAY-012: Verify (approve) a payment receipt
- [x] PAY-013: Show success toast after verification
- [x] PAY-014: Reject a payment receipt
- [x] PAY-015: Require rejection reason
- [x] PAY-016: Show rejected status after rejection
- [x] PAY-017: Navigate to linked order from payment

#### Edge Cases (3)
- [x] PAY-018: Handle missing receipt image gracefully
- [x] PAY-019: Prevent double-verification
- [x] PAY-020: Prevent action on already rejected payment

#### API Tests (4)
- [x] API-PAY-001: List payment receipts via API
- [x] API-PAY-002: Verify payment via API
- [x] API-PAY-003: Reject payment via API
- [x] API-PAY-004: Get pending payments count

---

### C4. Returns Processing — `returns.spec.ts` (30 tests) [P0]

#### Returns Listing (8)
- [x] RET-001: Display returns page
- [x] RET-002: Display returns metrics (total, pending, approved)
- [x] RET-003: Display returns table with columns
- [x] RET-004: Filter by status tab
- [x] RET-005: Search returns by order number
- [x] RET-006: Display source badge (website/shopee/tiktok)
- [x] RET-007: Display pagination
- [x] RET-008: Navigate to return detail

#### Return Detail (6)
- [x] RET-009: Display return detail page
- [x] RET-010: Display return items with product info
- [x] RET-011: Display return reason and type
- [x] RET-012: Display current status badge
- [x] RET-013: Display customer information
- [x] RET-014: Display return images/evidence

#### Return Processing (10)
- [x] RET-015: Approve a pending return
- [x] RET-016: Reject a return with reason
- [x] RET-017: Require rejection reason
- [x] RET-018: Mark return as shipped
- [x] RET-019: Mark return as received
- [x] RET-020: Process refund
- [x] RET-021: Process exchange
- [x] RET-022: Cancel a return
- [x] RET-023: Add admin notes
- [x] RET-024: Create return consignment label

#### Edge Cases (2)
- [x] RET-025: Show only allowed actions per status
- [x] RET-026: Prevent approving already approved return

#### API Tests (4)
- [x] API-RET-001: List returns via API
- [x] API-RET-002: Get return stats via API
- [x] API-RET-003: Approve return via API
- [x] API-RET-004: Reject return via API

---

### C5. Collections — `collections.spec.ts` (22 tests) [P1]

#### Collection Listing (6)
- [x] COL-001 to COL-006: List, filter, search, pagination, badges, sorting

#### Collection CRUD (10)
- [x] COL-007 to COL-016: Create, edit, delete, product assignment, image upload, SEO, status toggle

#### Auto Collections (2)
- [x] COL-017 to COL-018: Auto-collection rules, preview matching products

#### API Tests (4)
- [x] API-COL-001 to API-COL-004: List, create, update, delete via API

---

### C6. Support Tickets — `support-tickets.spec.ts` (28 tests) [P1]

#### Ticket Listing (9)
- [x] SUP-001 to SUP-009: List, filter by status/priority, search, pagination, badges, sorting

#### Ticket Detail (11)
- [x] SUP-010 to SUP-020: View detail, reply, assign, close, reopen, escalate, attachments, internal notes, timeline

#### Support Categories (3)
- [x] SUP-021 to SUP-023: List, create, edit categories

#### API Tests (5)
- [x] API-SUP-001 to API-SUP-005: List, create, reply, close, stats via API

---

### C7. Flash Sales — `flash-sales.spec.ts` (28 tests) [P1]

#### Flash Sale Listing (7)
- [x] FS-001 to FS-007: List, filter by status, search, pagination, countdown timer, badges

#### Flash Sale Creation (10)
- [x] FS-008 to FS-017: Create form, date picker, add products, set discounts, validate dates, publish

#### Flash Sale Detail & Items (7)
- [x] FS-018 to FS-024: View detail, manage items, adjust stock, activate/deactivate, delete

#### API Tests (4)
- [x] API-FS-001 to API-FS-004: List, create, update, delete via API

---

### C8. Agents & Commissions — `agents-commissions.spec.ts` (24 tests) [P1]

#### Agent Listing (5)
- [x] AGT-001 to AGT-005: List, filter, search, pagination, badges

#### Agent CRUD (10)
- [x] AGT-006 to AGT-015: Create, edit, delete, assign customers, set commission rate, view stats, activate/deactivate

#### Commissions (5)
- [x] COM-001 to COM-005: List, filter, approve, reject, create payout

#### API Tests (4)
- [x] API-AGT-001 to API-AGT-004: List, create, update, delete via API

---

### C9. Marketplace — `marketplace.spec.ts` (26 tests) [P1]

#### Connections (8)
- [x] MKT-001 to MKT-008: List connections, connect Shopee, view status, disconnect, reconnect, TikTok, Lazada

#### Product Sync (4)
- [x] MKT-009 to MKT-012: Map products, push products, import products, auto-match SKU

#### Category Mapping (2)
- [x] MKT-013 to MKT-014: Map categories, auto-suggest mapping

#### Orders (2)
- [x] MKT-015 to MKT-016: Sync orders, view marketplace orders

#### Analytics (2)
- [x] MKT-017 to MKT-018: View marketplace analytics, top products

#### Returns (3)
- [x] MKT-019 to MKT-021: Sync returns, process marketplace return, view return status

#### Settings (1)
- [x] MKT-022: Configure marketplace settings

#### API Tests (4)
- [x] API-MKT-001 to API-MKT-004: Connections, products, orders, analytics via API

---

### C10. Stock Transfers — `stock-transfers.spec.ts` (22 tests) [P1]

#### Transfer Listing (5)
- [x] STR-001 to STR-005: List, filter, search, pagination, status badges

#### Transfer Creation (7)
- [x] STR-006 to STR-012: Create form, select warehouse, add products, set quantities, validate, submit

#### Transfer Workflow (5)
- [x] STR-013 to STR-017: Approve, ship, receive, complete, cancel transfer

#### API Tests (5)
- [x] API-STR-001 to API-STR-005: List, create, approve, complete, cancel via API

---

### C11. Analytics & Reports — `analytics-reports.spec.ts` (20 tests) [P2]

#### Analytics Dashboard (7)
- [x] ANL-001 to ANL-007: Dashboard metrics, charts, date range, comparison, export, drill-down, real-time

#### Scheduled Reports (9)
- [x] SRPT-001 to SRPT-009: List, create, edit, delete, schedule, email delivery, template, preview, history

#### API Tests (4)
- [x] API-ANL-001 to API-ANL-003, API-SRPT-001: Dashboard, export, scheduled reports via API

---

### C12. Miscellaneous Features — `misc-features.spec.ts` (60 tests) [P2]

#### Newsletter (7)
- [x] NWS-001 to NWS-007: Subscribers list, filter, export, create campaign, send, schedule, unsubscribe

#### Sales Channels (7)
- [x] CHN-001 to CHN-007: List channels, create, edit, assign products, sync, deactivate, analytics

#### Reviews (8)
- [x] REV-001 to REV-008: List reviews, filter, approve, reject, reply, flag, bulk actions, analytics

#### Size Charts (8)
- [x] SCH-001 to SCH-008: List, create, edit, delete, assign to categories, preview, import, export

#### Tailoring (7)
- [x] TLR-001 to TLR-007: Tailoring orders list, detail, measurements, status, pricing, materials, completion

#### Looks (6)
- [x] LKS-001 to LKS-006: List looks, create, add products, set featured, edit, delete

#### Back-in-Stock (5)
- [x] BIS-001 to BIS-005: Subscribers list, notifications, settings, filter, analytics

#### Bulk Edit (5)
- [x] BLK-001 to BLK-005: Select products, edit prices, edit stock, edit status, confirm changes

#### MFA (6)
- [x] MFA-001 to MFA-006: Setup wizard, QR code scan, verify code, enable, disable, recovery codes

#### Shipping (7)
- [x] SHIP-001 to SHIP-007: Shipping zones, rates, methods, carriers, tracking, labels, settings

---

### C13. Additional Admin Specs (14 tests) [P1]

#### Agents — `agents.spec.ts` (3)
- [x] ADMIN-AGT-001: Navigate to agents page
- [x] ADMIN-AGT-002: Open create agent form
- [x] ADMIN-AGT-003: Navigate to commissions page

#### Support — `support.spec.ts` (4)
- [x] ADMIN-SUP-001: Navigate to support page
- [x] ADMIN-SUP-002: View ticket list with filters
- [x] ADMIN-SUP-003: Open ticket detail
- [x] ADMIN-SUP-007: Manage support categories

#### Reports — `reports.spec.ts` (3)
- [x] ADMIN-RPT-001: Navigate to reports page
- [x] ADMIN-RPT-002: View sales summary report
- [x] ADMIN-RPT-005: View analytics dashboard

#### Settings — `settings.spec.ts` (4)
- [x] ADMIN-SET-001: Navigate to settings page
- [x] ADMIN-SET-002: Shipping settings page loads
- [x] ADMIN-SET-003: Payment methods page loads
- [x] ADMIN-SET-004: Roles management page loads

---

## Test Execution Commands

```bash
# ── Backend API Tests ──
cd e2e-tests
npm install && npx playwright install
npx playwright test                          # Run all API tests
npx playwright test --grep "@P0"             # P0 tests only
npx playwright test tests/auth/              # Auth service only
npx playwright test tests/cross-service/     # Integration tests

# ── Admin UI Tests ──
cd frontend-admin
npx playwright test                          # Run all admin tests
npx playwright test --project=chromium       # Single browser (fast)
npx playwright test e2e/tests/returns.spec.ts    # Single file
npx playwright test --ui                     # Debug with UI mode
npx playwright show-report                   # View HTML report

# Run by priority
npx playwright test product-variants payment-verification returns  # P0
npx playwright test collections support-tickets flash-sales agents marketplace stock-transfers  # P1

# ── Storefront UI Tests ──
cd frontend-storefront
npx playwright test                          # Run all storefront tests
npx playwright test --project="Desktop Chrome"   # Desktop only
npx playwright test --project="Mobile Chrome"    # Mobile only
```

---

## Progress Summary

| Section | Total | Written | Status |
|---------|-------|---------|--------|
| **A. Backend API Tests** | | | |
| A1. Auth API | 28 | 28 | Written |
| A2. Catalog API | 40 | 40 | Written |
| A3. Order API | 35 | 35 | Written |
| A4. Customer API | 20 | 20 | Written |
| A5. Inventory API | 18 | 18 | Written |
| A6. Marketplace API | 14 | 14 | Written |
| A7. Agent API | 16 | 16 | Written |
| A8. Support API | 14 | 14 | Written |
| A9. Reporting API | 12 | 12 | Written |
| A10. Cross-Service | 12 | 12 | Written |
| **B. Storefront UI** | 52 | 52 | Written |
| **C. Admin UI** | | | |
| C1. Core (existing) | 262 | 262 | Written |
| C2. Variants & Images | 35 | 35 | Written |
| C3. Payment Verification | 24 | 24 | Written |
| C4. Returns | 30 | 30 | Written |
| C5. Collections | 22 | 22 | Written |
| C6. Support Tickets | 28 | 28 | Written |
| C7. Flash Sales | 28 | 28 | Written |
| C8. Agents & Commissions | 24 | 24 | Written |
| C9. Marketplace | 26 | 26 | Written |
| C10. Stock Transfers | 22 | 22 | Written |
| C11. Analytics & Reports | 20 | 20 | Written |
| C12. Misc Features | 60 | 60 | Written |
| C13. Additional Admin | 14 | 14 | Written |
| **TOTAL** | **~830** | **~830** | **All Written** |

---

## Spec Files Inventory

### `e2e-tests/tests/` — Backend API (17 files)
| File | Tests |
|------|-------|
| `auth/auth-login.spec.ts` | 15 |
| `auth/auth-rbac.spec.ts` | 13 |
| `catalog/catalog-products.spec.ts` | 12 |
| `catalog/catalog-categories.spec.ts` | 7 |
| `catalog/catalog-search.spec.ts` | 3 |
| `catalog/catalog-cms.spec.ts` | 7 |
| `order/order-cart.spec.ts` | 4 |
| `order/order-checkout.spec.ts` | 5 |
| `order/order-returns.spec.ts` | 4 |
| `customer/customer-profile.spec.ts` | 10 |
| `inventory/inventory-stock.spec.ts` | 7 |
| `marketplace/marketplace-connections.spec.ts` | 5 |
| `agent/agent-crud.spec.ts` | 10 |
| `support/support-tickets.spec.ts` | 8 |
| `reporting/reporting-sales.spec.ts` | 10 |
| `cross-service/purchase-flow.spec.ts` | 3 |
| `cross-service/return-flow.spec.ts` | 2 |

### `frontend-admin/e2e/tests/` — Admin UI (22 files)
| File | Tests |
|------|-------|
| `auth.spec.ts` | 58 |
| `dashboard.spec.ts` | 32 |
| `products.spec.ts` | 40 |
| `categories.spec.ts` | 16 |
| `orders.spec.ts` | 29 |
| `inventory.spec.ts` | 18 |
| `customers-cms-rbac.spec.ts` | 69 |
| `product-variants-images.spec.ts` | 35 |
| `payment-verification.spec.ts` | 24 |
| `returns.spec.ts` | 30 |
| `collections.spec.ts` | 22 |
| `support-tickets.spec.ts` | 28 |
| `flash-sales.spec.ts` | 28 |
| `agents-commissions.spec.ts` | 24 |
| `marketplace.spec.ts` | 26 |
| `stock-transfers.spec.ts` | 22 |
| `analytics-reports.spec.ts` | 20 |
| `misc-features.spec.ts` | 60 |
| `agents.spec.ts` | 3 |
| `support.spec.ts` | 4 |
| `reports.spec.ts` | 3 |
| `settings.spec.ts` | 4 |

### `frontend-storefront/e2e/tests/` — Storefront UI (6 files)
| File | Tests |
|------|-------|
| `auth.spec.ts` | 5 |
| `browse-products.spec.ts` | 6 |
| `product-detail.spec.ts` | 4 |
| `cart.spec.ts` | 2 |
| `checkout.spec.ts` | 2 |
| `account.spec.ts` | 7 |
