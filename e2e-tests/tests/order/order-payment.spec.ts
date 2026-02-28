import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData } from '../../utils/helpers';

/**
 * ORDER SERVICE — Payment Tests
 * Service: service-order (port 8003)
 *
 * Tests payment endpoint availability and RBAC.
 * NOTE: We do NOT test actual payment processing to avoid creating real transactions.
 */

test.describe('Payment - Validation @P1', () => {
    test('API-PAY-001: POST /payment/process — invalid order returns error', async ({ customerApi }) => {
        const res = await customerApi.post('payment/process', {
            data: {
                order_id: 'nonexistent-order-id-99999',
                payment_method: 'bank_transfer',
            },
        });
        // Should reject invalid order — 400, 404, or 422
        expect([400, 404, 422]).toContain(res.status());
    });

    test('API-PAY-002: POST /payment/process — empty body returns 400', async ({ customerApi }) => {
        const res = await customerApi.post('payment/process', {
            data: {},
        });
        expect([400, 422]).toContain(res.status());
    });
});

test.describe('Payment - RBAC @P1', () => {
    test('API-PAY-RBAC-001: No token -> POST /payment/process returns 401', async ({ publicApi }) => {
        const res = await publicApi.post('payment/process', {
            data: { order_id: 'test', payment_method: 'bank_transfer' },
        });
        // Payment should require authentication
        expect([401, 400]).toContain(res.status());
    });
});

test.describe('Payment - Curlec Integration @P2', () => {
    test('API-PAY-003: POST /payment/curlec/initiate — missing order returns error', async ({ customerApi }) => {
        const res = await customerApi.post('payment/curlec/initiate', {
            data: { order_id: 'nonexistent-id' },
        });
        // Should reject — 400, 404, or 422
        expect([400, 404, 422]).toContain(res.status());
    });
});
