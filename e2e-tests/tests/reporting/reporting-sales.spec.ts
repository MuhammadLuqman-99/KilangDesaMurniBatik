import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus } from '../../utils/helpers';

/**
 * REPORTING SERVICE — Sales, Inventory, Order Reports & Analytics Tests
 * Service: service-reporting (port 8007)
 *
 * Known issues (BUG-005):
 *   - /reports/sales/trends may return 400
 *   - /reports/inventory/stock-levels may return 502
 *   - Some analytics endpoints may return 404
 */

test.describe('Sales Reports @P1', () => {
    test('API-RPT-001: GET /reports/sales/summary — sales summary', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/sales/summary');
        await expectStatus(res, 200, 'Sales summary');
    });

    // BUG-005: trends endpoint may need specific query params
    test.fixme('API-RPT-002: GET /reports/sales/trends — sales trends @BUG-005', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/sales/trends?period=30d');
        await expectStatus(res, 200, 'Sales trends');
    });

    test('API-RPT-003: GET /reports/sales/top-products — top products', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/sales/top-products');
        await expectStatus(res, 200, 'Top products');
    });
});

test.describe('Inventory Reports @P1', () => {
    // BUG-005: stock-levels crashes the reporting service
    test.fixme('API-RPT-004: GET /reports/inventory/stock-levels — stock levels @BUG-005', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/inventory/stock-levels', { timeout: 20000 });
        await expectStatus(res, 200, 'Stock levels');
    });

    test('API-RPT-005: GET /reports/inventory/low-stock — low stock alerts', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/inventory/low-stock');
        await expectStatus(res, 200, 'Low stock alerts');
    });
});

test.describe('Order Reports @P1', () => {
    test('API-RPT-006: GET /reports/orders/status-breakdown — order status', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/orders/status-breakdown');
        await expectStatus(res, 200, 'Order status breakdown');
    });

    test('API-RPT-007: GET /reports/orders/fulfillment-metrics — fulfillment metrics', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/orders/fulfillment-metrics');
        await expectStatus(res, 200, 'Fulfillment metrics');
    });
});

test.describe('Admin Analytics @P1', () => {
    test('API-RPT-008: GET /admin/analytics/overview — analytics overview', async ({ reportingApi }) => {
        const res = await reportingApi.get('admin/analytics/overview');
        await expectStatus(res, 200, 'Analytics overview');
    });

    test('API-RPT-008b: GET /admin/analytics/sales — analytics sales', async ({ reportingApi }) => {
        const res = await reportingApi.get('admin/analytics/sales');
        await expectStatus(res, 200, 'Analytics sales');
    });
});

test.describe('Export @P1', () => {
    // BUG-005: export may need specific query params
    test.fixme('API-RPT-010: GET /reports/export/sales — export sales @BUG-005', async ({ reportingApi }) => {
        const res = await reportingApi.get('reports/export/sales');
        expect([200, 202]).toContain(res.status());
    });
});
