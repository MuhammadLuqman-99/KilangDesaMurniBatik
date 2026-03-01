import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, requireValue } from '../../utils/helpers';

/**
 * ORDER SERVICE — Checkout & Order Tests
 * Service: service-order (port 8003)
 */

test.describe('Checkout - Customer @P0', () => {
    test('API-ORD-011: GET /orders — list customer orders', async ({ customerApi }) => {
        const res = await customerApi.get('orders');
        await expectStatus(res, 200, 'List customer orders');
    });

    test('API-ORD-011b: GET /orders/stats — customer order stats', async ({ customerApi }) => {
        const res = await customerApi.get('orders/stats');
        await expectStatus(res, 200, 'Customer order stats');
    });

    test('API-ORD-015: GET /shipping/methods — get shipping methods', async ({ customerApi }) => {
        const res = await customerApi.get('shipping/methods');
        await expectStatus(res, 200, 'Shipping methods');

        const json = await res.json();
        const data = extractData(json);
        const methods = Array.isArray(data) ? data : data.methods || [];
        expect(Array.isArray(methods), 'Shipping methods should be an array').toBe(true);
    });

    // BUG-003: POST /shipping/rates endpoint not implemented
    test.fixme('API-ORD-016: POST /shipping/rates — calculate shipping rates @BUG-003', async ({ customerApi }) => {
        const res = await customerApi.post('shipping/rates', {
            data: {
                state: 'Terengganu',
                postal_code: '20000',
                items: [{ quantity: 1 }],
            },
        });
        await expectStatus(res, 200, 'Shipping rates');
    });
});

test.describe('Admin Orders @P1', () => {
    test('API-ORD-025: GET /admin/orders — list all orders', async ({ orderApi }) => {
        const res = await orderApi.get('admin/orders');
        await expectStatus(res, 200, 'Admin list orders');
    });

    test('API-ORD-026: GET /admin/orders/stats — order statistics', async ({ orderApi }) => {
        const res = await orderApi.get('admin/orders/stats');
        await expectStatus(res, 200, 'Order stats');
    });

    test('API-ORD-027: GET /admin/orders/:id — get order detail', async ({ orderApi }) => {
        const listRes = await orderApi.get('admin/orders?limit=1');
        await expectStatus(listRes, 200, 'List orders for detail');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const orders = Array.isArray(data) ? data : data.items || data.orders || [];

        if (orders.length > 0) {
            const orderId = orders[0].id;
            const res = await orderApi.get(`admin/orders/${orderId}`);
            await expectStatus(res, 200, `Order detail ${orderId}`);
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No orders exist in system' });
        }
    });

    // RBAC: customer cannot access admin orders (must use admin domain)
    test('API-ORD-RBAC-001: GET /admin/orders — customer token returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/orders');
        expect([401, 403], 'Customer should not access admin orders').toContain(res.status());
    });
});
