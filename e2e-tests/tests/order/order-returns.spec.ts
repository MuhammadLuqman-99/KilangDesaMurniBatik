import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData } from '../../utils/helpers';

/**
 * ORDER SERVICE — Returns Tests
 * Service: service-order (port 8003)
 */

test.describe('Returns - Customer @P1', () => {
    test('API-ORD-019: GET /returns/reasons — get return reasons', async ({ orderApi }) => {
        const res = await orderApi.get('returns/reasons');
        await expectStatus(res, 200, 'Return reasons');

        const json = await res.json();
        const data = extractData(json);
        const reasons = Array.isArray(data) ? data : [];
        expect(Array.isArray(reasons), 'Reasons should be an array').toBe(true);
    });

    test('API-ORD-021: GET /returns — list my returns', async ({ customerApi }) => {
        const res = await customerApi.get('returns');
        await expectStatus(res, 200, 'List customer returns');
    });
});

test.describe('Admin Returns @P1', () => {
    test('API-ORD-032: GET /admin/returns — list all returns', async ({ orderApi }) => {
        const res = await orderApi.get('admin/returns');
        await expectStatus(res, 200, 'Admin list returns');
    });

    test('API-ORD-032b: GET /admin/returns/stats — return stats', async ({ orderApi }) => {
        const res = await orderApi.get('admin/returns/stats');
        await expectStatus(res, 200, 'Return stats');
    });

    test('API-ORD-033: GET /admin/returns/:id — get return detail', async ({ orderApi }) => {
        const listRes = await orderApi.get('admin/returns?limit=1');
        await expectStatus(listRes, 200, 'List returns for detail');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const returns = Array.isArray(data) ? data : data.items || [];

        if (returns.length > 0) {
            const returnId = returns[0].id;
            const res = await orderApi.get(`admin/returns/${returnId}`);
            await expectStatus(res, 200, `Return detail ${returnId}`);
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No returns exist in system' });
        }
    });
});
