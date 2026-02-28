import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData } from '../../utils/helpers';

/**
 * CROSS-SERVICE — Return Flow Integration Tests
 * Tests the complete return lifecycle across order + inventory
 */

test.describe('Return Flow @P0', () => {
    test('CROSS-005: Return lifecycle — list reasons -> list returns -> detail', async ({ orderApi }) => {
        // Step 1: Get return reasons
        const reasonsRes = await orderApi.get('returns/reasons');
        await expectStatus(reasonsRes, 200, 'Return reasons');

        const reasonsJson = await reasonsRes.json();
        const reasons = extractData(reasonsJson);
        expect(Array.isArray(reasons), 'Reasons should be an array').toBe(true);

        // Step 2: List admin returns
        const returnsRes = await orderApi.get('admin/returns');
        await expectStatus(returnsRes, 200, 'Admin returns list');

        // Step 3: If returns exist, verify detail
        const returnsJson = await returnsRes.json();
        const returnsData = extractData(returnsJson);
        const returnsList = Array.isArray(returnsData) ? returnsData : returnsData.items || [];

        if (returnsList.length > 0) {
            const returnId = returnsList[0].id;
            const detailRes = await orderApi.get(`admin/returns/${returnId}`);
            await expectStatus(detailRes, 200, `Return detail ${returnId}`);
        }
    });
});

test.describe('Agent Commission Flow @P1', () => {
    test('CROSS-011: Agent admin — list agents -> list commissions', async ({ agentApi }) => {
        // Step 1: List agents (admin view)
        const agentsRes = await agentApi.get('agents');
        await expectStatus(agentsRes, 200, 'List agents');

        const agentsJson = await agentsRes.json();
        const agentsData = extractData(agentsJson);
        const agents = Array.isArray(agentsData) ? agentsData : agentsData.items || [];

        // Step 2: List all commissions (admin view)
        const commissionsRes = await agentApi.get('admin/commissions');
        await expectStatus(commissionsRes, 200, 'Admin commissions');
    });
});
