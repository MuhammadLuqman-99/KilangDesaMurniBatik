# RBAC API Documentation

Complete Role-Based Access Control (RBAC) system built with Go and Gin framework.

## Architecture

```
service-auth/
├── internal/
│   ├── models/
│   │   ├── user.go              # Existing user model
│   │   └── rbac.go              # Role, Permission, UserRole, RolePermission ✨ NEW
│   ├── repository/
│   │   └── rbac_repository.go   # RBAC data access layer ✨ NEW
│   ├── services/
│   │   └── rbac_service.go      # RBAC business logic ✨ NEW
│   ├── handlers/
│   │   └── rbac_handler.go      # RBAC HTTP handlers ✨ NEW
│   ├── middleware/
│   │   └── rbac.go              # Permission & role middleware ✨ NEW
│   └── routes/
│       └── rbac.go              # Route registration ✨ NEW
```

## API Endpoints

### Authentication

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/auth/me` | Authenticated | Get current user with roles[] and permissions[] |

### User Management

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/admin/users` | `users.view` | List all users (paginated) |
| GET | `/api/v1/admin/users/:id` | `users.view` | Get single user with roles |
| POST | `/api/v1/admin/users` | `users.create` | Create new user |
| PUT | `/api/v1/admin/users/:id` | `users.update` | Update user |
| DELETE | `/api/v1/admin/users/:id` | `users.delete` | Delete user (soft delete) |

### Role Management

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/admin/roles` | `roles.view` | List all roles |
| GET | `/api/v1/admin/roles/:id` | `roles.view` | Get single role with permissions |
| POST | `/api/v1/admin/roles` | `roles.create` | Create new role |
| PUT | `/api/v1/admin/roles/:id` | `roles.update` | Update role |
| DELETE | `/api/v1/admin/roles/:id` | `roles.delete` | Delete role (system roles protected) |

### Permission Management

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/admin/permissions` | `roles.view` OR `roles.create` OR `roles.update` | List all permissions grouped by module |

## Models

### Role
```go
type Role struct {
    ID          uuid.UUID  // Primary key
    Name        string     // Unique name (e.g., "MANAGER")
    DisplayName string     // Human-readable name
    Description string     // Optional description
    IsSystem    bool       // System roles cannot be deleted
    IsActive    bool       // Active status
    UserCount   int        // Number of users with this role
    CreatedAt   time.Time
    UpdatedAt   time.Time
    
    Permissions []Permission // Many-to-many
}
```

### Permission
```go
type Permission struct {
    ID          uuid.UUID
    Name        string  // Unique name (e.g., "products.view")
    Module      string  // Module name (e.g., "products")
    Action      string  // Action name (e.g., "view")
    Description string  // Optional description
    CreatedAt   time.Time
    
    Roles []Role  // Many-to-many
}
```

### UserWithRoles
```go
type UserWithRoles struct {
    User                    // Embedded user
    Roles       []Role      // User's assigned roles
    Permissions []string    // Flattened unique permissions
}
```

## Middleware Functions

### RequirePermission
Check if user has a specific permission:
```go
rbacMiddleware.RequirePermission("orders.view")
```

### RequireAnyPermission
Check if user has ANY of the specified permissions:
```go
rbacMiddleware.RequireAnyPermission([]string{"orders.view", "orders.update"})
```

### RequireAllPermissions
Check if user has ALL of the specified permissions:
```go
rbacMiddleware.RequireAllPermissions([]string{"orders.view", "orders.update"})
```

### RequireRole
Check if user has a specific role:
```go
rbacMiddleware.RequireRole("MANAGER")
```

### RequireAnyRole
Check if user has ANY of the specified roles:
```go
rbacMiddleware.RequireAnyRole([]string{"MANAGER", "ADMIN"})
```

## Request/Response Examples

### Get Current User (with roles & permissions)
```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "roles": [
        {
            "id": "223e4567-e89b-12d3-a456-426614174000",
            "name": "MANAGER",
            "display_name": "Manager",
            "description": "Can manage orders, products, and view reports",
            "is_system": true,
            "is_active": true
        }
    ],
    "permissions": [
        "products.view",
        "products.create",
        "products.update",
        "orders.view",
        "orders.create",
        "orders.update",
        "orders.cancel",
        "customers.view",
        "customers.update",
        "inventory.view",
        "inventory.update",
        "reports.view",
        "reports.export"
    ]
}
```

### List Users
```http
GET /api/v1/admin/users?page=1&limit=20&search=john
Authorization: Bearer {token}
```

**Response:**
```json
{
    "data": [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "status": "active",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
}
```

### Create User
```http
POST /api/v1/admin/users
Authorization: Bearer {token}
Content-Type: application/json

{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "0123456789",
    "status": "active",
    "role_ids": [
        "223e4567-e89b-12d3-a456-426614174000"
    ]
}
```

**Response:**
```json
{
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "0123456789",
    "status": "active",
    "created_at": "2024-12-03T10:00:00Z",
    "updated_at": "2024-12-03T10:00:00Z"
}
```

### Update User
```http
PUT /api/v1/admin/users/323e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {token}
Content-Type: application/json

{
    "first_name": "Jane Updated",
    "status": "suspended",
    "role_ids": [
        "223e4567-e89b-12d3-a456-426614174000",
        "333e4567-e89b-12d3-a456-426614174000"
    ]
}
```

### Create Role
```http
POST /api/v1/admin/roles
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "SALES_MANAGER",
    "display_name": "Sales Manager",
    "description": "Can manage orders and customers",
    "is_active": true,
    "permission_ids": [
        "p11e4567-e89b-12d3-a456-426614174000",
        "p22e4567-e89b-12d3-a456-426614174000",
        "p33e4567-e89b-12d3-a456-426614174000"
    ]
}
```

**Response:**
```json
{
    "id": "423e4567-e89b-12d3-a456-426614174000",
    "name": "SALES_MANAGER",
    "display_name": "Sales Manager",
    "description": "Can manage orders and customers",
    "is_system": false,
    "is_active": true,
    "user_count": 0,
    "created_at": "2024-12-03T10:00:00Z",
    "updated_at": "2024-12-03T10:00:00Z"
}
```

### Get Role with Permissions
```http
GET /api/v1/admin/roles/423e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {token}
```

**Response:**
```json
{
    "id": "423e4567-e89b-12d3-a456-426614174000",
    "name": "SALES_MANAGER",
    "display_name": "Sales Manager",
    "description": "Can manage orders and customers",
    "is_system": false,
    "is_active": true,
    "user_count": 5,
    "permissions": [
        {
            "id": "p11e4567-e89b-12d3-a456-426614174000",
            "name": "orders.view",
            "module": "orders",
            "action": "view",
            "description": "View orders"
        },
        {
            "id": "p22e4567-e89b-12d3-a456-426614174000",
            "name": "orders.create",
            "module": "orders",
            "action": "create",
            "description": "Create orders"
        }
    ]
}
```

### Get All Permissions (Grouped)
```http
GET /api/v1/admin/permissions
Authorization: Bearer {token}
```

**Response:**
```json
{
    "data": [
        {
            "module": "products",
            "permissions": [
                {
                    "id": "p01e4567-e89b-12d3-a456-426614174000",
                    "name": "products.view",
                    "module": "products",
                    "action": "view",
                    "description": "View products"
                },
                {
                    "id": "p02e4567-e89b-12d3-a456-426614174000",
                    "name": "products.create",
                    "module": "products",
                    "action": "create",
                    "description": "Create products"
                }
            ]
        },
        {
            "module": "orders",
            "permissions": [
                {
                    "id": "p11e4567-e89b-12d3-a456-426614174000",
                    "name": "orders.view",
                    "module": "orders",
                    "action": "view",
                    "description": "View orders"
                }
            ]
        }
    ]
}
```

## Error Responses

### Unauthorized (401)
```json
{
    "error": "Unauthorized"
}
```

### Forbidden (403)
```json
{
    "error": "Forbidden - Missing required permission: orders.update"
}
```

or

```json
{
    "error": "Forbidden - Missing required role: MANAGER"
}
```

### Not Found (404)
```json
{
    "error": "User not found"
}
```

### Bad Request (400)
```json
{
    "error": "Invalid user ID"
}
```

## Usage in Routes

### Example 1: Single Permission
```go
r.GET("/api/v1/orders", 
    authMiddleware,
    rbacMiddleware.RequirePermission("orders.view"),
    orderHandler.GetOrders,
)
```

### Example 2: Any Permission
```go
r.PUT("/api/v1/orders/:id", 
    authMiddleware,
    rbacMiddleware.RequireAnyPermission([]string{"orders.update", "orders.admin"}),
    orderHandler.UpdateOrder,
)
```

### Example 3: All Permissions
```go
r.DELETE("/api/v1/orders/:id", 
    authMiddleware,
    rbacMiddleware.RequireAllPermissions([]string{"orders.view", "orders.delete"}),
    orderHandler.DeleteOrder,
)
```

### Example 4: Role-Based
```go
r.GET("/api/v1/admin/reports", 
    authMiddleware,
    rbacMiddleware.RequireRole("MANAGER"),
    reportHandler.GetReports,
)
```

## Database Schema

### Tables Created
- `auth.roles` - Stores all roles
- `auth.permissions` - Stores all permissions
- `auth.user_roles` - Many-to-many: users ↔ roles
- `auth.role_permissions` - Many-to-many: roles ↔ permissions

### Relationships
```
users (1) ──→ (N) user_roles (N) ──→ (1) roles
roles (1) ──→ (N) role_permissions (N) ──→ (1) permissions
```

### Permission Lookup Query
```sql
-- Get all permissions for a user
SELECT DISTINCT p.name
FROM auth.permissions p
INNER JOIN auth.role_permissions rp ON p.id = rp.permission_id
INNER JOIN auth.user_roles ur ON rp.role_id = ur.role_id
WHERE ur.user_id = ?
```

## Integration Example

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/niaga-platform/service-auth/internal/database"
    "github.com/niaga-platform/service-auth/internal/handlers"
    "github.com/niaga-platform/service-auth/internal/middleware"
    "github.com/niaga-platform/service-auth/internal/repository"
    "github.com/niaga-platform/service-auth/internal/routes"
    "github.com/niaga-platform/service-auth/internal/services"
)

func main() {
    // Initialize database
    db := database.Connect()
    
    // Initialize RBAC
    rbacRepo := repository.NewRBACRepository(db)
    rbacService := services.NewRBACService(rbacRepo)
    rbacHandler := handlers.NewRBACHandler(rbacService)
    rbacMiddleware := middleware.NewRBACMiddleware(rbacService)
    
    // Auth middleware (existing)
    authMiddleware := middleware.AuthMiddleware()
    
    // Create Gin router
    r := gin.Default()
    
    // Register RBAC routes
    routes.RegisterRBACRoutes(r, rbacHandler, rbacMiddleware, authMiddleware)
    
    // Example: Protect specific endpoints
    r.GET("/api/v1/products", 
        authMiddleware,
        rbacMiddleware.RequirePermission("products.view"),
        productHandler.GetProducts,
    )
    
    // Start server
    r.Run(":8080")
}
```

## Security Features

1. **Permission-Based Access**: Fine-grained control per endpoint
2. **Role-Based Access**: Group permissions into roles
3. **System Role Protection**: Cannot delete/modify system roles
4. **Audit Trail**: Track who assigned roles/permissions
5. **Soft Deletes**: Users and roles use soft deletes
6. **Password Hashing**: Bcrypt for user passwords

## Default Permissions (from migrations)

### Products Module
- `products.view`
- `products.create`
- `products.update`
- `products.delete`

### Orders Module
- `orders.view`
- `orders.create`
- `orders.update`
- `orders.cancel`

### Users Module
- `users.view`
- `users.create`
- `users.update`
- `users.delete`

### Roles Module
- `roles.view`
- `roles.create`
- `roles.update`
- `roles.delete`

**Total**: 37 permissions across 11 modules (see database migrations)

## Default Roles (from migrations)

1. **SUPER_ADMIN** - Full system access (all permissions)
2. **MANAGER** - Operations management
3. **STAFF_ORDERS** - Order processing only
4. **STAFF_PRODUCTS** - Product & inventory
5. **ACCOUNTANT** - Financial reports

---

**Status**: ✅ **Production Ready**  
**Endpoints**: 12 RBAC endpoints  
**Middleware**: 5 middleware functions  
**Database**: GORM with PostgreSQL
