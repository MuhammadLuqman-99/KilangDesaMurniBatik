import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, extractPaginatedItems, requireValue } from '../../utils/helpers';

/**
 * INVENTORY SERVICE — Stock & Warehouse Tests
 * Service: service-inventory (port 8005)
 */

test.describe('Inventory Availability - Public @P0', () => {
    test('API-INV-001: GET /inventory/availability/:product_id — check product', async ({ inventoryApi, catalogApi }) => {
        const prodRes = await catalogApi.get('products?limit=1');
        await expectStatus(prodRes, 200, 'List products');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);
        requireValue(items[0], 'At least 1 product must exist to check availability');

        const productId = items[0].id;
        const res = await inventoryApi.get(`inventory/availability/${productId}`);
        await expectStatus(res, 200, `Availability for product ${productId}`);
    });

    // BUG-007: Bulk availability endpoint has wrong payload format
    test.fixme('API-INV-003: POST /inventory/availability/bulk — bulk check @BUG-007', async ({ inventoryApi, catalogApi }) => {
        const prodRes = await catalogApi.get('products?limit=3');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);
        requireValue(items[0], 'At least 1 product must exist for bulk check');

        const productIds = items.map((p: any) => p.id);
        const res = await inventoryApi.post('inventory/availability/bulk', {
            data: { product_ids: productIds },
        });
        await expectStatus(res, 200, 'Bulk availability');
    });
});

test.describe('Inventory Stock Admin @P1', () => {
    test('API-INV-004: GET /inventory/stock — list stock items', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('inventory/stock');
        await expectStatus(res, 200, 'List stock');
    });

    test('API-INV-005: GET /inventory/stock/low — low stock items', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('inventory/stock/low');
        await expectStatus(res, 200, 'Low stock items');
    });

    test('API-INV-006: GET /inventory/movements — stock movements', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('inventory/movements');
        await expectStatus(res, 200, 'Stock movements');
    });

    // RBAC: customer cannot access inventory
    test('API-INV-RBAC-001: GET /inventory/stock — customer token returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('inventory/stock');
        expect([401, 403], 'Customer should not access inventory').toContain(res.status());
    });
});

test.describe('Inventory Warehouses @P1', () => {
    test('API-INV-011: GET /inventory/warehouses — list warehouses', async ({ inventoryApi }) => {
        const res = await inventoryApi.get('inventory/warehouses');
        await expectStatus(res, 200, 'List warehouses');

        const json = await res.json();
        const data = extractData(json);
        const warehouses = Array.isArray(data) ? data : data.items || [];
        expect(Array.isArray(warehouses), 'Warehouses should be an array').toBe(true);
    });
});
