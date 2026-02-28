import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractPaginatedItems, requireValue } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * CROSS-SERVICE — Full Purchase Flow Integration Tests
 * Tests the complete buyer journey across catalog, order, inventory services
 */

test.describe('Full Purchase Flow @P0', () => {
    // Depends on BUG-002 (cart returns 500) being fixed
    test.fixme('CROSS-001: Browse product -> Add to cart -> Verify cart @BUG-002', async ({
        publicApi,
        customerApi,
    }) => {
        // Step 1: Get a product from catalog
        const prodRes = await publicApi.get('products?limit=1&status=active');
        await expectStatus(prodRes, 200, 'List products');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);
        requireValue(items[0], 'At least 1 product must exist');

        const product = items[0];

        // Step 2: Add to cart
        const cartRes = await customerApi.post('cart/items', {
            data: {
                product_id: product.id,
                variant_id: product.variants?.[0]?.id || product.id,
                quantity: 1,
            },
        });
        expect([200, 201]).toContain(cartRes.status());

        // Step 3: Verify cart has the item
        const getCartRes = await customerApi.get('cart');
        await expectStatus(getCartRes, 200, 'Get cart after add');
    });

    test('CROSS-007: Admin JWT token accepted by all services', async ({
        adminToken,
        playwright,
    }) => {
        const services = [
            { name: 'catalog', url: testConfig.adminApi.baseUrl, endpoint: 'products?limit=1' },
            { name: 'order', url: testConfig.adminApi.baseUrl, endpoint: 'admin/orders?limit=1' },
            { name: 'customer', url: testConfig.adminApi.baseUrl, endpoint: 'admin/customers?limit=1' },
        ];

        for (const svc of services) {
            const ctx = await playwright.request.newContext({
                baseURL: svc.url,
                extraHTTPHeaders: {
                    Authorization: `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const res = await ctx.get(svc.endpoint);
            expect(res.status(), `${svc.name} should accept admin token`).toBe(200);
            await ctx.dispose();
        }
    });

    test('CROSS-008: Unauthenticated request rejected by admin endpoints', async ({ playwright }) => {
        const adminBaseUrl = testConfig.adminApi.baseUrl;
        const endpoints = [
            'admin/orders',
            'admin/customers',
        ];

        for (const path of endpoints) {
            const ctx = await playwright.request.newContext({ baseURL: adminBaseUrl });
            const res = await ctx.get(path);
            expect(res.status(), `${path} should reject without auth`).toBe(401);
            await ctx.dispose();
        }
    });

    // Customer token should access customer routes but not admin routes
    test('CROSS-009: Customer token accepted by customer endpoints, rejected by admin', async ({
        customerToken,
        playwright,
    }) => {
        const storefrontUrl = testConfig.services.auth.baseUrl;
        const adminUrl = testConfig.adminApi.baseUrl;

        // Should work: customer route
        const custCtx = await playwright.request.newContext({
            baseURL: storefrontUrl,
            extraHTTPHeaders: {
                Authorization: `Bearer ${customerToken}`,
                'Content-Type': 'application/json',
            },
        });
        const custRes = await custCtx.get('customer/profile');
        await expectStatus(custRes, 200, 'Customer profile with customer token');
        await custCtx.dispose();

        // Should fail: admin route
        const adminCtx = await playwright.request.newContext({
            baseURL: adminUrl,
            extraHTTPHeaders: {
                Authorization: `Bearer ${customerToken}`,
                'Content-Type': 'application/json',
            },
        });
        const adminRes = await adminCtx.get('admin/orders');
        expect([401, 403], 'Customer token on admin route').toContain(adminRes.status());
        await adminCtx.dispose();
    });
});
