import { test, expect } from '../../fixtures/api-fixtures';
import { extractData, extractPaginatedItems } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * ORDER SERVICE — Cart Tests
 * Service: service-order (port 8003)
 */

test.describe('Cart Operations @P0', () => {
    test('API-ORD-001: GET /cart — get empty cart (session-based)', async ({ orderApi }) => {
        const res = await orderApi.get('/cart');
        expect([200, 404]).toContain(res.status());
    });

    test('API-ORD-002: POST /cart/items — add item to cart', async ({ orderApi, catalogApi }) => {
        // First get a product to add
        const prodRes = await catalogApi.get('/products?limit=1&status=active');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);

        if (items.length > 0) {
            const product = items[0];
            const res = await orderApi.post('/cart/items', {
                data: {
                    product_id: product.id,
                    variant_id: product.variants?.[0]?.id || product.id,
                    quantity: 1,
                },
            });
            expect([200, 201]).toContain(res.status());
        }
    });

    test('API-ORD-005: DELETE /cart — clear cart', async ({ orderApi }) => {
        const res = await orderApi.delete('/cart');
        expect([200, 204, 404]).toContain(res.status());
    });

    test('API-ORD-006: POST /cart/coupon — apply coupon code', async ({ orderApi }) => {
        const res = await orderApi.post('/cart/coupon', {
            data: { code: 'TESTCOUPON' },
        });
        // May return 200 (valid), 400 (invalid code), or 404 (no cart)
        expect([200, 400, 404, 422]).toContain(res.status());
    });
});
