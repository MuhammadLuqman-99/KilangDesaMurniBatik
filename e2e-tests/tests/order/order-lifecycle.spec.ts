import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, requireValue } from '../../utils/helpers';

/**
 * ORDER SERVICE — Order Lifecycle Tests
 * Service: service-order (port 8003)
 *
 * Tests admin-side order management: list, detail, status transitions, notes, timeline
 */

test.describe('Order Lifecycle - Admin @P1', () => {
    test('API-ORD-LIFE-001: GET /admin/orders — list with pagination', async ({ orderApi }) => {
        const res = await orderApi.get('admin/orders?page=1&limit=5');
        await expectStatus(res, 200, 'Admin orders list');
    });

    test('API-ORD-LIFE-002: GET /admin/orders/stats — order stats', async ({ orderApi }) => {
        const res = await orderApi.get('admin/orders/stats');
        await expectStatus(res, 200, 'Order stats');

        const json = await res.json();
        const data = extractData(json);
        expect(data, 'Stats should return data').toBeTruthy();
    });

    test('API-ORD-LIFE-003: GET /admin/orders/:id/timeline — order timeline', async ({ orderApi }) => {
        const listRes = await orderApi.get('admin/orders?limit=1');
        await expectStatus(listRes, 200, 'List orders');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const orders = Array.isArray(data) ? data : data.items || data.orders || [];

        if (orders.length > 0) {
            const orderId = orders[0].id;
            const res = await orderApi.get(`admin/orders/${orderId}/timeline`);
            await expectStatus(res, 200, `Order timeline ${orderId}`);
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No orders exist in system' });
        }
    });

    test('API-ORD-LIFE-004: GET /admin/orders/:id/notes — order notes', async ({ orderApi }) => {
        const listRes = await orderApi.get('admin/orders?limit=1');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const orders = Array.isArray(data) ? data : data.items || data.orders || [];

        if (orders.length > 0) {
            const orderId = orders[0].id;
            const res = await orderApi.get(`admin/orders/${orderId}/notes`);
            await expectStatus(res, 200, `Order notes ${orderId}`);
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No orders exist in system' });
        }
    });

    test('API-ORD-LIFE-005: GET /admin/orders/:id/transactions — order transactions', async ({ orderApi }) => {
        const listRes = await orderApi.get('admin/orders?limit=1');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const orders = Array.isArray(data) ? data : data.items || data.orders || [];

        if (orders.length > 0) {
            const orderId = orders[0].id;
            const res = await orderApi.get(`admin/orders/${orderId}/transactions`);
            await expectStatus(res, 200, `Order transactions ${orderId}`);
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No orders exist in system' });
        }
    });

    test('API-ORD-LIFE-006: GET /admin/orders/export — export orders', async ({ orderApi }) => {
        const res = await orderApi.get('admin/orders/export?format=csv');
        expect([200, 202]).toContain(res.status());
    });
});
