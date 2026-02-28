import { test, expect } from '../../fixtures/api-fixtures';
import { extractData, generateTestData } from '../../utils/helpers';

/**
 * ORDER SERVICE — Checkout & Order Tests
 * Service: service-order (port 8003)
 */

test.describe('Checkout & Orders @P0', () => {
    test('API-ORD-011: GET /orders — list customer orders (auth required)', async ({ orderApi }) => {
        const res = await orderApi.get('/orders');
        expect([200]).toContain(res.status());
    });

    test('API-ORD-015: GET /shipping/methods — get shipping methods', async ({ orderApi }) => {
        const res = await orderApi.get('/shipping/methods');
        expect([200]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        const methods = Array.isArray(data) ? data : data.methods || [];
        expect(Array.isArray(methods)).toBe(true);
    });

    test('API-ORD-016: POST /shipping/rates — calculate shipping rates', async ({ orderApi }) => {
        const res = await orderApi.post('/shipping/rates', {
            data: {
                state: 'Terengganu',
                postal_code: '20000',
                items: [{ quantity: 1 }],
            },
        });
        expect([200, 400]).toContain(res.status());
    });
});

test.describe('Admin Orders @P1', () => {
    test('API-ORD-025: GET /admin/orders — list all orders (admin)', async ({ orderApi }) => {
        const res = await orderApi.get('/admin/orders');
        expect([200]).toContain(res.status());
    });

    test('API-ORD-026: GET /admin/orders/stats — order statistics', async ({ orderApi }) => {
        const res = await orderApi.get('/admin/orders/stats');
        expect([200]).toContain(res.status());
    });

    test('API-ORD-027: GET /admin/orders/:id — get order detail', async ({ orderApi }) => {
        // List orders first
        const listRes = await orderApi.get('/admin/orders?limit=1');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const orders = Array.isArray(data) ? data : data.items || data.orders || [];

        if (orders.length > 0) {
            const orderId = orders[0].id;
            const res = await orderApi.get(`/admin/orders/${orderId}`);
            expect(res.status()).toBe(200);
        }
    });
});
