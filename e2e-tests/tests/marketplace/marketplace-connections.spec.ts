import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, requireValue } from '../../utils/helpers';

/**
 * MARKETPLACE SERVICE — Connections, Product Sync, Orders Tests
 * Service: service-marketplace (port 8010)
 */

test.describe('Marketplace Connections @P1', () => {
    test('API-MKT-001: GET /admin/marketplace/connections — list connections', async ({ marketplaceApi }) => {
        const res = await marketplaceApi.get('admin/marketplace/connections');
        await expectStatus(res, 200, 'List connections');

        const json = await res.json();
        const data = extractData(json);
        const connections = data?.connections || (Array.isArray(data) ? data : []);
        expect(Array.isArray(connections), 'Connections should be an array').toBe(true);
    });

    test('API-MKT-002: GET /admin/marketplace/connections/active — active connections', async ({ marketplaceApi }) => {
        const res = await marketplaceApi.get('admin/marketplace/connections/active');
        await expectStatus(res, 200, 'Active connections');
    });

    test('API-MKT-003: POST /admin/marketplace/shopee/auth-url — Shopee auth URL', async ({ marketplaceApi }) => {
        const res = await marketplaceApi.post('admin/marketplace/shopee/auth-url');
        // 200 if configured, 400 if not configured — both are valid
        expect([200, 400]).toContain(res.status());
    });

    // RBAC: customer cannot access marketplace
    test('API-MKT-RBAC-001: GET /admin/marketplace/connections — customer returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/marketplace/connections');
        expect([401, 403], 'Customer should not access marketplace').toContain(res.status());
    });
});

test.describe('Marketplace Product Sync @P1', () => {
    test('API-MKT-005: GET /connections/:id/products — mapped products', async ({ marketplaceApi }) => {
        const connRes = await marketplaceApi.get('admin/marketplace/connections');
        const connJson = await connRes.json();
        const data = extractData(connJson);
        const connections = data?.connections || (Array.isArray(data) ? data : []);

        if (connections.length > 0) {
            const connId = connections[0].id;
            const res = await marketplaceApi.get(`admin/marketplace/connections/${connId}/products`);
            await expectStatus(res, 200, 'Mapped products');
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No marketplace connections exist' });
        }
    });
});

test.describe('Marketplace Orders @P1', () => {
    test('API-MKT-009: GET /connections/:id/orders — marketplace orders', async ({ marketplaceApi }) => {
        const connRes = await marketplaceApi.get('admin/marketplace/connections');
        const connJson = await connRes.json();
        const data = extractData(connJson);
        const connections = data?.connections || (Array.isArray(data) ? data : []);

        if (connections.length > 0) {
            const connId = connections[0].id;
            const res = await marketplaceApi.get(`admin/marketplace/connections/${connId}/orders`);
            await expectStatus(res, 200, 'Marketplace orders');
        } else {
            test.info().annotations.push({ type: 'skip-reason', description: 'No marketplace connections exist' });
        }
    });
});
