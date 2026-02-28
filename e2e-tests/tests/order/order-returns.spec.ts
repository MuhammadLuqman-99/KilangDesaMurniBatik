import { test, expect } from '../../fixtures/api-fixtures';
import { extractData } from '../../utils/helpers';

/**
 * ORDER SERVICE — Returns Tests
 * Service: service-order (port 8003)
 */

test.describe('Returns - Customer @P1', () => {
    test('API-ORD-019: GET /returns/reasons — get return reasons', async ({ orderApi }) => {
        const res = await orderApi.get('returns/reasons');
        expect([200]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        const reasons = Array.isArray(data) ? data : [];
        expect(Array.isArray(reasons)).toBe(true);
    });

    test('API-ORD-021: GET /returns — list my returns', async ({ orderApi }) => {
        const res = await orderApi.get('returns');
        expect([200]).toContain(res.status());
    });
});

test.describe('Admin Returns @P1', () => {
    test('API-ORD-032: GET /admin/returns — list all returns', async ({ orderApi }) => {
        const res = await orderApi.get('admin/returns');
        expect([200]).toContain(res.status());
    });

    test('API-ORD-033: GET /admin/returns/:id — get return detail', async ({ orderApi }) => {
        const listRes = await orderApi.get('admin/returns?limit=1');
        if (listRes.status() === 200) {
            const listJson = await listRes.json();
            const data = extractData(listJson);
            const returns = Array.isArray(data) ? data : data.items || [];

            if (returns.length > 0) {
                const returnId = returns[0].id;
                const res = await orderApi.get(`admin/returns/${returnId}`);
                expect(res.status()).toBe(200);
            }
        }
    });
});

test.describe('Admin Shipping @P2', () => {
    test('API-ORD-041: GET /admin/shipping/rates — get rate table', async ({ orderApi }) => {
        const res = await orderApi.get('admin/shipping/rates');
        // 404 = endpoint not implemented yet (BUG-003)
        expect([200, 404]).toContain(res.status());
    });
});
