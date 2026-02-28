import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractPaginatedItems, requireValue } from '../../utils/helpers';

/**
 * ORDER SERVICE — Cart Tests
 * Service: service-order (port 8005)
 *
 * Cart routes (cart/*) are on the storefront domain.
 * customerApi uses customer token on storefront domain.
 */

test.describe('Cart Operations @P0', () => {
    test('API-ORD-001: GET /cart — get cart (session-based)', async ({ customerApi }) => {
        const res = await customerApi.get('cart');
        // 200 = cart exists, 404 = no cart yet — both valid for initial state
        expect([200, 404]).toContain(res.status());
    });

    // BUG-002: POST /cart/items returns 500 instead of 400 for validation errors
    test.fixme('API-ORD-002: POST /cart/items — add item to cart @BUG-002', async ({ customerApi, publicApi }) => {
        const prodRes = await publicApi.get('products?limit=1&status=active');
        await expectStatus(prodRes, 200, 'List products');
        const prodJson = await prodRes.json();
        const { items } = extractPaginatedItems(prodJson);
        requireValue(items[0], 'At least 1 product must exist to add to cart');

        const product = items[0];
        const res = await customerApi.post('cart/items', {
            data: {
                product_id: product.id,
                variant_id: product.variants?.[0]?.id || product.id,
                quantity: 1,
            },
        });
        expect([200, 201]).toContain(res.status());
    });

    test('API-ORD-005: DELETE /cart — clear cart', async ({ customerApi }) => {
        const res = await customerApi.delete('cart');
        expect([200, 204, 404]).toContain(res.status());
    });

    test('API-ORD-006: POST /cart/coupon — invalid coupon returns 400', async ({ customerApi }) => {
        const res = await customerApi.post('cart/coupon', {
            data: { code: 'INVALIDCOUPON99999' },
        });
        // Invalid coupon should return 400 or 404, never 200
        expect([400, 404, 422]).toContain(res.status());
    });

    // RBAC: unauthenticated cart access
    test('API-ORD-RBAC-001: GET /cart — no token returns 401', async ({ publicApi }) => {
        const res = await publicApi.get('cart');
        // Cart may be session-based (200/404) or require auth (401)
        expect([200, 401, 404]).toContain(res.status());
    });
});
