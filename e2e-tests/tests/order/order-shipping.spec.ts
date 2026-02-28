import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData } from '../../utils/helpers';

/**
 * ORDER SERVICE — Shipping Tests
 * Service: service-order (port 8003)
 *
 * BUG-003: POST /shipping/rates endpoint not implemented (404)
 */

test.describe('Shipping - Public @P1', () => {
    test('API-SHIP-001: GET /shipping/methods — list shipping methods', async ({ customerApi }) => {
        const res = await customerApi.get('shipping/methods');
        await expectStatus(res, 200, 'Shipping methods');

        const json = await res.json();
        const data = extractData(json);
        const methods = Array.isArray(data) ? data : data.methods || [];
        expect(Array.isArray(methods), 'Shipping methods should be an array').toBe(true);
    });

    // BUG-003: shipping/rates not implemented
    test.fixme('API-SHIP-002: POST /shipping/rates — calculate rates @BUG-003', async ({ customerApi }) => {
        const res = await customerApi.post('shipping/rates', {
            data: {
                state: 'Terengganu',
                postal_code: '20000',
                items: [{ quantity: 1, weight: 500 }],
            },
        });
        await expectStatus(res, 200, 'Shipping rates');
    });
});

test.describe('Shipping - RBAC @P1', () => {
    test('API-SHIP-RBAC-001: No token -> GET /shipping/methods', async ({ publicApi }) => {
        const res = await publicApi.get('shipping/methods');
        // Shipping methods may be public or require auth
        expect([200, 401]).toContain(res.status());
    });
});
