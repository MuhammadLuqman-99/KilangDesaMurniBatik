import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, requireValue, generateTestData, TestDataCleaner } from '../../utils/helpers';

/**
 * AGENT SERVICE — Agent CRUD & Commission Tests
 * Service: service-agent (port 8010)
 *
 * agentApi = admin token on admin domain (for admin/agents/* management)
 * agentPortalApi = agent token on storefront domain (for agent/* portal routes)
 */

test.describe('Agent Admin CRUD @P1', () => {
    test.describe.configure({ mode: 'serial' });

    const cleaner = new TestDataCleaner();
    let createdAgentId: string | null = null;

    test.afterAll(async () => {
        await cleaner.cleanAll();
    });

    test('API-AGT-001: GET /admin/agents — list agents', async ({ agentApi }) => {
        const res = await agentApi.get('agents');
        await expectStatus(res, 200, 'List agents');

        const json = await res.json();
        const data = extractData(json);
        const agents = Array.isArray(data) ? data : data.items || data.agents || [];
        expect(Array.isArray(agents), 'Agents should be an array').toBe(true);
    });

    test('API-AGT-002: POST /admin/agents — create agent', async ({ agentApi }) => {
        const agentData = generateTestData('agent');

        const res = await agentApi.post('agents', {
            data: {
                ...agentData,
                password: 'AgentTest1234',
                status: 'active',
            },
        });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        createdAgentId = requireValue(data?.id, 'Agent creation must return an id');
        cleaner.track(agentApi, `agents/${createdAgentId}`, 'test agent');
    });

    test('API-AGT-003: GET /admin/agents/:id — get agent detail', async ({ agentApi }) => {
        requireValue(createdAgentId, 'Agent must be created first');

        const res = await agentApi.get(`agents/${createdAgentId}`);
        await expectStatus(res, 200, 'Agent detail');
    });

    test('API-AGT-004: PUT /admin/agents/:id — update agent', async ({ agentApi }) => {
        requireValue(createdAgentId, 'Agent must be created first');

        const res = await agentApi.put(`agents/${createdAgentId}`, {
            data: { name: 'E2E Updated Agent' },
        });
        expect([200, 204]).toContain(res.status());
    });

    test('API-AGT-005: DELETE /admin/agents/:id — delete agent', async ({ agentApi }) => {
        requireValue(createdAgentId, 'Agent must be created first');

        const res = await agentApi.delete(`agents/${createdAgentId}`);
        expect([200, 204]).toContain(res.status());
        createdAgentId = null;
    });
});

test.describe('Agent Portal @P1', () => {
    // BUG-009: Agent portal routes return 401 with agent token
    test.fixme('API-AGT-008: GET /agent/dashboard — agent dashboard @BUG-009', async ({ agentPortalApi }) => {
        const res = await agentPortalApi.get('agent/dashboard');
        await expectStatus(res, 200, 'Agent dashboard');
    });

    test.fixme('API-AGT-011: GET /agent/customers — agent customers @BUG-009', async ({ agentPortalApi }) => {
        const res = await agentPortalApi.get('agent/customers', { timeout: 30000 });
        await expectStatus(res, 200, 'Agent customers');
    });

    test.fixme('API-AGT-013: GET /agent/commissions — commission history @BUG-009', async ({ agentPortalApi }) => {
        const res = await agentPortalApi.get('agent/commissions');
        await expectStatus(res, 200, 'Agent commissions');
    });

    test.fixme('API-AGT-014: GET /agent/performance — agent performance @BUG-009', async ({ agentPortalApi }) => {
        const res = await agentPortalApi.get('agent/performance');
        await expectStatus(res, 200, 'Agent performance');
    });
});

test.describe('Admin Commissions @P1', () => {
    test('API-AGT-015: GET /admin/commissions — list all commissions', async ({ agentApi }) => {
        const res = await agentApi.get('admin/commissions');
        await expectStatus(res, 200, 'Admin commissions');
    });
});
