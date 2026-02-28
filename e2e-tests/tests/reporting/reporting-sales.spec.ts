import { test, expect } from '../../fixtures/api-fixtures';

/**
 * REPORTING SERVICE — Sales & Analytics Tests
 * Service: service-reporting (port 8007)
 */

test.describe('Sales Reports @P1', () => {
    test('API-RPT-001: GET /reports/sales/summary — sales summary', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/sales/summary');
        expect([200]).toContain(res.status());
    });

    test('API-RPT-002: GET /reports/sales/trends — sales trends', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/sales/trends?period=30d');
        expect([200]).toContain(res.status());
    });

    test('API-RPT-003: GET /reports/sales/top-products — top products', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/sales/top-products');
        expect([200]).toContain(res.status());
    });
});

test.describe('Inventory Reports @P1', () => {
    test('API-RPT-004: GET /reports/inventory/stock-levels — stock levels', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/inventory/stock-levels');
        expect([200]).toContain(res.status());
    });

    test('API-RPT-005: GET /reports/inventory/low-stock — low stock alerts', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/inventory/low-stock');
        expect([200]).toContain(res.status());
    });
});

test.describe('Order Reports @P1', () => {
    test('API-RPT-006: GET /reports/orders/status-breakdown — order status', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/orders/status-breakdown');
        expect([200]).toContain(res.status());
    });

    test('API-RPT-007: GET /reports/orders/fulfillment-metrics — fulfillment metrics', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/orders/fulfillment-metrics');
        expect([200]).toContain(res.status());
    });
});

test.describe('Analytics @P2', () => {
    test('API-RPT-008: GET /analytics/dashboard — analytics dashboard', async ({ reportingApi }) => {
        const res = await reportingApi.get('/analytics/dashboard');
        expect([200]).toContain(res.status());
    });

    test('API-RPT-009: GET /analytics/funnel — conversion funnel', async ({ reportingApi }) => {
        const res = await reportingApi.get('/analytics/funnel');
        expect([200]).toContain(res.status());
    });
});

test.describe('Export @P1', () => {
    test('API-RPT-010: GET /reports/export/sales — export sales CSV', async ({ reportingApi }) => {
        const res = await reportingApi.get('/reports/export/sales');
        expect([200, 202]).toContain(res.status());
    });
});
