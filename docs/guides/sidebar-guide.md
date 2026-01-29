# Dynamic Sidebar Implementation Guide

## Overview

The admin sidebar now dynamically filters menu items based on user permissions using the RBAC system.

## Files Created/Updated

### 1. Navigation Configuration
**File**: `src/lib/config/navigation.ts`

Defines the complete menu structure with permissions:

```typescript
export const navigationMenu: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    // No permission = visible to all
  },
  {
    title: 'Products',
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_VIEW,
    children: [
      {
        title: 'All Products',
        href: '/products',
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_VIEW,
      },
      // ... more children
    ],
  },
];
```

### 2. Updated Sidebar Component
**File**: `src/components/layout/Sidebar.tsx`

Features:
- ✅ Permission-based filtering
- ✅ Auto-expand active parent menus
- ✅ Lucide React icons
- ✅ Recursive child menu filtering
- ✅ Active state highlighting
- ✅ Permission count display

## How It Works

### Permission Filtering

The sidebar uses `filterMenuByPermissions()` function which:
1. Checks each menu item's permission requirement
2. Filters out items user cannot access
3. Recursively filters child items
4. Removes parent items with no visible children

### Auto-Expand

When a child menu item is active, its parent automatically expands:
```typescript
useEffect(() => {
  const activeParents = filteredMenu
    .filter(item => item.children && isMenuItemActive(item, pathname))
    .map(item => item.title);
  
  setExpandedItems(prev => [...new Set([...prev, ...activeParents])]);
}, [pathname, filteredMenu]);
```

## Testing Different Roles

### STAFF_ORDERS Role
**Visible Menu Items:**
- Dashboard
- Orders
- Customers (limited)

**Hidden:**
- Products
- Inventory
- Reports
- etc.

### STAFF_PRODUCTS Role
**Visible:**
- Dashboard
- Products (with children)
  - All Products
  - Categories
  - Add Product
- Inventory (with children)

**Hidden:**
- Orders
- Customers
- Reports
- Agents
- etc.

### MANAGER Role
**Visible:**
- Dashboard
- Orders
- Products (full access)
- Inventory
- Customers
- Reports (most items)

**Hidden:**
- Agents
- Commissions (limited)
- Users Management
- Settings (limited)

### SUPER_ADMIN Role
**Visible:** ALL menu items

## Menu Structure Reference

```
Dashboard (all)
Orders (orders.view)
Products (products.view)
  ├── All Products (products.view)
  ├── Categories (categories.view)
  └── Add Product (products.create)
Inventory (inventory.view)
  ├── Stock Overview (inventory.view)
  ├── Warehouses (inventory.view)
  └── Stock Transfers (inventory.transfer)
Customers (customers.view)
Reports (reports.view)
  ├── Dashboard (reports.view)
  ├── Sales Reports (reports.sales)
  ├── Inventory Reports (reports.inventory)
  └── Financial Reports (reports.financial)
Agents (agents.view)
  ├── All Agents (agents.view)
  ├── Teams (teams.view)
  └── Commissions (commissions.view)
Content (cms.view)
  ├── Dashboard (cms.view)
  ├── Site Settings (cms.update)
  ├── Banners (cms.view)
  ├── Menus (cms.view)
  ├── Homepage (cms.update)
  └── Media Library (cms.view)
Settings (settings.view)
Users (users.view)
```

## Adding New Menu Items

To add a new menu item:

1. Open `src/lib/config/navigation.ts`
2. Add your item to the `navigationMenu` array:

```typescript
{
  title: 'My New Feature',
  href: '/my-feature',
  icon: YourIcon, // Import from lucide-react
  permission: PERMISSIONS.YOUR_PERMISSION, // Optional
}
```

3. For nested items:

```typescript
{
  title: 'Parent Menu',
  icon: ParentIcon,
  permission: PERMISSIONS.PARENT_VIEW,
  children: [
    {
      title: 'Child 1',
      href: '/parent/child1',
      icon: ChildIcon,
      permission: PERMISSIONS.CHILD_VIEW,
    },
  ],
}
```

## Key Features

### 1. Smart Filtering
- Only shows menu items user has permission to access
- Automatically hides parent items if all children are hidden
- Shows parent items if they have their own href, even without visible children

### 2. Visual Feedback
- Active items highlighted in blue
- Hover effects on all items
- Smooth expand/collapse animations
- Chevron rotation indicator

### 3. Performance
- Uses `useMemo` to cache filtered menu
- Only re-filters when permissions change
- Efficient active state checking

### 4. Accessibility
- Keyboard navigation support
- Proper ARIA attributes
- Focus management

## Customization

### Change Colors

Edit the Tailwind classes in `Sidebar.tsx`:
```typescript
// Active item
'bg-blue-600 text-white'

// Hover state
'hover:bg-gray-800 text-gray-300'
```

### Change Icons

Replace Lucide icons in `navigation.ts`:
```typescript
import { YourIcon } from 'lucide-react';

{
  icon: YourIcon,
}
```

### Add Badges

Add notification badges to menu items:
```typescript
<span className="flex items-center gap-3">
  <Icon className="w-5 h-5" />
  <span className="font-medium">{item.title}</span>
  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
    3
  </span>
</span>
```
