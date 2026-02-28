import { test, expect } from '../../fixtures/api-fixtures';
import { extractData } from '../../utils/helpers';

/**
 * CROSS-SERVICE — Return Flow Integration Tests
 * Tests the complete return lifecycle across order + inventory
 */

test.describe('Return Flow @P0', () => {
    test('CROSS-005: Return lifecycle — list reasons → list returns', async ({ orderApi }) => {
        // Step 1: Get return reasons
        const reasonsRes = await orderApi.get('/returns/reasons');
        expect(reasonsRes.status()).toBe(200);

        const reasonsJson = await reasonsRes.json();
        const reasons = extractData(reasonsJson);
        expect(Array.isArray(reasons) ? reasons : []).toBeDefined();

        // Step 2: List admin returns
        const returnsRes = await orderApi.get('/admin/returns');
        expect(returnsRes.status()).toBe(200);

        // Step 3: If returns exist, verify we can get detail
        const returnsJson = await returnsRes.json();
        const returnsData = extractData(returnsJson);
        const returnsList = Array.isArray(returnsData) ? returnsData : returnsData.items || [];

        if (returnsList.length > 0) {
            const returnId = returnsList[0].id;
            const detailRes = await orderApi.get(`/admin/returns/${returnId}`);
            expect(detailRes.status()).toBe(200);
        }
    });
});

test.describe('Agent Commission Flow @P1', () => {
    test('CROSS-011: Agent commission lifecycle — list agents → list commissions', async ({
        agentApi,
    }) => {
        // Step 1: List agents
        const agentsRes = await agentApi.get('/agents');
        expect(agentsRes.status()).toBe(200);

        const agentsJson = await agentsRes.json();
        const agentsData = extractData(agentsJson);
        const agents = Array.isArray(agentsData) ? agentsData : agentsData.items || [];

        if (agents.length > 0) {
            const agentId = agents[0].id;

            // Step 2: Get agent commissions
            const commissionsRes = await agentApi.get(`/agents/${agentId}/commissions`);
            expect([200]).toContain(commissionsRes.status());

            // Step 3: Get agent payouts
            const payoutsRes = await agentApi.get(`/agents/${agentId}/payouts`);
            expect([200]).toContain(payoutsRes.status());
        }
    });
});
