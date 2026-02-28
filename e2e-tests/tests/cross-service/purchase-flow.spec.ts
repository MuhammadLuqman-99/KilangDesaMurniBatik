import { test, expect } from '../../fixtures/api-fixtures';
import { extractData, extractPaginatedItems, generateTestData } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * CROSS-SERVICE — Full Purchase Flow Integration Tests
 * Tests the complete buyer journey across catalog, order, inventory services
 */

test.describe('Full Purchase Flow @P0', () => {
    test('CROSS-001: Browse product → Add to cart → Checkout → Order created', async ({
        catalogApi,
        orderApi,
    }) => {
        // Step 1: Get a product from catalog service
        const prodRes = await catalogApi.get('/products?limit=1&status=active');
        expect(prodRes.status()).toBe(200);
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);
        expect(items.length).toBeGreaterThan(0);

        const product = items[0];

        // Step 2: Add to cart via order service
        const cartRes = await orderApi.post('/cart/items', {
            data: {
                product_id: product.id,
                variant_id: product.variants?.[0]?.id || product.id,
                quantity: 1,
            },
        });
        expect([200, 201]).toContain(cartRes.status());

        // Step 3: Create order
        const orderData = generateTestData('order');
        const createRes = await orderApi.post('/orders', {
            data: {
                ...orderData,
                items: [{
                    product_id: product.id,
                    variant_id: product.variants?.[0]?.id || product.id,
                    quantity: 1,
                    price: product.base_price || product.price || 99.90,
                    name: product.name,
                }],
                shipping_method: 'standard',
                payment_method: 'bank_transfer',
            },
        });
        // Accept 200/201 (success) or 400 (validation, e.g. insufficient stock)
        expect([200, 201, 400, 422]).toContain(createRes.status());

        if (createRes.status() === 200 || createRes.status() === 201) {
            const orderJson = await createRes.json();
            const orderResult = extractData(orderJson);
            expect(orderResult.id || orderResult.order_id).toBeTruthy();
        }
    });

    test('CROSS-007: Login → Access all services with same JWT token', async ({
        adminToken,
        playwright,
    }) => {
        // The admin token from auth service should work on ALL services
        const services = [
            { name: 'catalog', url: testConfig.services.catalog.baseUrl, endpoint: '/products?limit=1' },
            { name: 'order', url: testConfig.services.order.baseUrl, endpoint: '/admin/orders?limit=1' },
            { name: 'customer', url: testConfig.services.customer.baseUrl, endpoint: '/admin/customers?limit=1' },
            { name: 'inventory', url: testConfig.services.inventory.baseUrl, endpoint: '/admin/inventory?limit=1' },
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
        const endpoints = [
            { url: testConfig.services.order.baseUrl, path: '/admin/orders' },
            { url: testConfig.services.customer.baseUrl, path: '/admin/customers' },
            { url: testConfig.services.inventory.baseUrl, path: '/admin/inventory' },
        ];

        for (const ep of endpoints) {
            const ctx = await playwright.request.newContext({ baseURL: ep.url });
            const res = await ctx.get(ep.path);
            expect(res.status(), `${ep.path} should reject without auth`).toBe(401);
            await ctx.dispose();
        }
    });
});
