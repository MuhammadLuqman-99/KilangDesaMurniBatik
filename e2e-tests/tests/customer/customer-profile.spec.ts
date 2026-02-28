import { test, expect } from '../../fixtures/api-fixtures';
import { extractData } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * CUSTOMER SERVICE — Profile & Address Tests
 * Service: service-customer (port 8004)
 */

test.describe('Customer Profile @P0', () => {
    test('API-CUS-001: GET /customer/profile — get own profile', async ({ customerApi }) => {
        const res = await customerApi.get('customer/profile');
        expect([200, 404]).toContain(res.status());
    });

    test('API-CUS-003: GET /customer/profile — returns 401 without auth', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.customer.baseUrl,
        });
        const res = await ctx.get('customer/profile');
        expect(res.status()).toBe(401);
        await ctx.dispose();
    });
});

test.describe('Customer Addresses @P0', () => {
    test.describe.configure({ mode: 'serial' });
    let createdAddressId: string | null = null;

    test('API-CUS-004: GET /customer/addresses — list addresses', async ({ customerApi }) => {
        const res = await customerApi.get('customer/addresses');
        expect([200]).toContain(res.status());
    });

    test('API-CUS-005: POST /customer/addresses — create address', async ({ customerApi }) => {
        const res = await customerApi.post('customer/addresses', {
            data: {
                label: 'E2E Test Address',
                recipient_name: 'E2E Test User',
                phone: '+60123456789',
                address_line1: '123 Test Street',
                city: 'Kuala Terengganu',
                state: 'Terengganu',
                postcode: '20000',
                country: 'MY',
            },
        });
        expect([200, 201]).toContain(res.status());

        if (res.status() === 200 || res.status() === 201) {
            const json = await res.json();
            const data = json.address || json.data || json;
            createdAddressId = data?.id || null;
        }
    });

    test('API-CUS-006: PUT /customer/addresses/:id — update address', async ({ customerApi }) => {
        if (!createdAddressId) test.skip();

        const res = await customerApi.put(`customer/addresses/${createdAddressId}`, {
            data: { label: 'E2E Updated Address' },
        });
        expect([200, 204]).toContain(res.status());
    });

    test('API-CUS-007: DELETE /customer/addresses/:id — delete address', async ({ customerApi }) => {
        if (!createdAddressId) test.skip();

        const res = await customerApi.delete(`customer/addresses/${createdAddressId}`);
        expect([200, 204]).toContain(res.status());
        createdAddressId = null;
    });
});

test.describe('Customer Wishlist @P1', () => {
    test('API-CUS-009: GET /customer/wishlist — list wishlist', async ({ customerApi }) => {
        const res = await customerApi.get('customer/wishlist');
        expect([200]).toContain(res.status());
    });

    test('API-CUS-012: GET /customer/wishlist/check/:productId — check if wishlisted', async ({ customerApi }) => {
        const res = await customerApi.get('customer/wishlist/check/nonexistent-id');
        // 400 = invalid UUID format for product ID
        expect([200, 400, 404]).toContain(res.status());
    });
});

test.describe('Customer Admin @P1', () => {
    test('API-CUS-018: GET /admin/customers — list customers', async ({ adminApi }) => {
        const res = await adminApi.get('admin/customers');
        expect([200]).toContain(res.status());
    });

    test('API-CUS-020: GET /admin/customers/stats — customer stats', async ({ adminApi }) => {
        const res = await adminApi.get('admin/customers/stats');
        expect([200]).toContain(res.status());
    });
});
