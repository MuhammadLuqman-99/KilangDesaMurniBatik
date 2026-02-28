import { test, expect } from '../../fixtures/api-fixtures';
import { extractData } from '../../utils/helpers';

/**
 * MARKETPLACE SERVICE — Connections & Product Sync Tests
 * Service: service-marketplace (port 8008)
 */

test.describe('Marketplace Connections @P1', () => {
    test('API-MKT-001: GET /admin/marketplace/connections — list connections', async ({ marketplaceApi }) => {
        const res = await marketplaceApi.get('admin/marketplace/connections');
        expect([200]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        const connections = data?.connections || (Array.isArray(data) ? data : []);
        expect(Array.isArray(connections)).toBe(true);
    });

    test('API-MKT-002: GET /admin/marketplace/connections/active — active connections', async ({ marketplaceApi }) => {
        const res = await marketplaceApi.get('admin/marketplace/connections/active');
        expect([200]).toContain(res.status());
    });

    test('API-MKT-003: POST /admin/marketplace/shopee/auth-url — get Shopee auth URL', async ({ marketplaceApi }) => {
        const res = await marketplaceApi.post('admin/marketplace/shopee/auth-url');
        // May return URL or error if Shopee not configured
        expect([200, 400, 500]).toContain(res.status());
    });
});

test.describe('Marketplace Product Sync @P1', () => {
    test('API-MKT-005: GET /connections/:id/products — mapped products', async ({ marketplaceApi }) => {
        // Get active connections first
        const connRes = await marketplaceApi.get('admin/marketplace/connections');
        const connJson = await connRes.json();
        const data = extractData(connJson);
        const connections = data?.connections || (Array.isArray(data) ? data : []);

        if (connections.length > 0) {
            const connId = connections[0].id;
            const res = await marketplaceApi.get(`admin/marketplace/connections/${connId}/products`);
            expect([200]).toContain(res.status());
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
            expect([200]).toContain(res.status());
        }
    });
});

test.describe('Marketplace Analytics @P2', () => {
    test('API-MKT-013: GET /connections/:id/analytics — marketplace analytics', async ({ marketplaceApi }) => {
        const connRes = await marketplaceApi.get('admin/marketplace/connections');
        const connJson = await connRes.json();
        const data = extractData(connJson);
        const connections = data?.connections || (Array.isArray(data) ? data : []);

        if (connections.length > 0) {
            const connId = connections[0].id;
            const res = await marketplaceApi.get(`admin/marketplace/connections/${connId}/analytics`);
            expect([200]).toContain(res.status());
        }
    });
});
