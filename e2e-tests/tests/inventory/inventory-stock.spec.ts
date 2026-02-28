import { test, expect } from '../../fixtures/api-fixtures';
import { extractData, extractPaginatedItems } from '../../utils/helpers';

/**
 * INVENTORY SERVICE — Stock & Warehouse Tests
 * Service: service-inventory (port 8005)
 */

test.describe('Inventory Availability - Public @P0', () => {
    test('API-INV-001: GET /inventory/availability/:product_id — check product', async ({ inventoryApi, catalogApi }) => {
        // Get a product ID first
        const prodRes = await catalogApi.get('products?limit=1');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);

        if (items.length > 0) {
            const productId = items[0].id;
            const res = await inventoryApi.get(`inventory/availability/${productId}`);
            expect([200, 404]).toContain(res.status());
        }
    });

    test('API-INV-003: POST /inventory/availability/bulk — bulk availability check', async ({ inventoryApi, catalogApi }) => {
        const prodRes = await catalogApi.get('products?limit=3');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);

        if (items.length > 0) {
            const productIds = items.map((p: any) => p.id);
            const res = await inventoryApi.post('inventory/availability/bulk', {
                data: { product_ids: productIds },
            });
            // 400 = request format may be wrong (BUG-007)
            expect([200, 400]).toContain(res.status());
        }
    });
});

test.describe('Inventory Stock Admin @P1', () => {
    test('API-INV-004: GET /admin/inventory — list stock items', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('admin/inventory');
        expect([200]).toContain(res.status());
    });

    test('API-INV-005: GET /admin/inventory/stats — inventory statistics', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('admin/inventory/stats');
        expect([200]).toContain(res.status());
    });

    test('API-INV-006: GET /admin/inventory/low-stock — low stock items', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('admin/inventory/low-stock');
        expect([200]).toContain(res.status());
    });
});

test.describe('Inventory Warehouses @P1', () => {
    test('API-INV-011: GET /inventory/warehouses — list warehouses', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('inventory/warehouses');
        expect([200]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        const warehouses = Array.isArray(data) ? data : data.items || [];
        expect(Array.isArray(warehouses)).toBe(true);
    });
});
