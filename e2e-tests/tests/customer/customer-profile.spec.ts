import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, expectError, extractData, requireValue, generateTestData, TestDataCleaner } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * CUSTOMER SERVICE — Profile, Addresses, Wishlist Tests
 * Service: service-customer (port 8004)
 *
 * IMPORTANT: customerApi now correctly uses CUSTOMER token (not admin token).
 * This verifies actual customer-role access.
 */

test.describe('Customer Profile @P0', () => {
    test('API-CUS-001: GET /customer/profile — get own profile with customer token', async ({ customerApi }) => {
        const res = await customerApi.get('customer/profile');
        await expectStatus(res, 200, 'Customer profile');

        const json = await res.json();
        // Response may be { data: {...} } or { profile: {...} } or flat
        const profile = json.data?.user || json.data || json.profile || json;
        expect(profile.email, 'Profile should contain email').toBeTruthy();
    });

    test('API-CUS-003: GET /customer/profile — returns 401 without auth', async ({ publicApi }) => {
        const res = await publicApi.get('customer/profile');
        await expectError(res, 401);
    });

    // RBAC: customer cannot access admin routes (must use admin domain)
    test('API-CUS-RBAC-001: GET /admin/customers — customer token returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/customers');
        expect([401, 403], 'Customer should not access admin routes').toContain(res.status());
    });
});

test.describe('Customer Addresses @P0', () => {
    test.describe.configure({ mode: 'serial' });

    const cleaner = new TestDataCleaner();
    let createdAddressId: string | null = null;

    test.afterAll(async () => {
        await cleaner.cleanAll();
    });

    test('API-CUS-004: GET /customer/addresses — list addresses', async ({ customerApi }) => {
        const res = await customerApi.get('customer/addresses');
        await expectStatus(res, 200, 'List addresses');
    });

    test('API-CUS-005: POST /customer/addresses — create address', async ({ customerApi }) => {
        const addressData = generateTestData('address');

        const res = await customerApi.post('customer/addresses', { data: addressData });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = json.address || json.data || json;
        createdAddressId = requireValue(data?.id, 'Address creation must return an id');
        cleaner.track(customerApi, `customer/addresses/${createdAddressId}`, 'test address');
    });

    test('API-CUS-006: PUT /customer/addresses/:id — update address', async ({ customerApi }) => {
        requireValue(createdAddressId, 'Address must be created first');

        const res = await customerApi.put(`customer/addresses/${createdAddressId}`, {
            data: { label: 'E2E Updated Address' },
        });
        expect([200, 204]).toContain(res.status());
    });

    test('API-CUS-007: DELETE /customer/addresses/:id — delete address', async ({ customerApi }) => {
        requireValue(createdAddressId, 'Address must be created first');

        const res = await customerApi.delete(`customer/addresses/${createdAddressId}`);
        expect([200, 204]).toContain(res.status());
        createdAddressId = null;
    });
});

test.describe('Customer Wishlist @P1', () => {
    test('API-CUS-009: GET /customer/wishlist — list wishlist', async ({ customerApi }) => {
        const res = await customerApi.get('customer/wishlist');
        await expectStatus(res, 200, 'List wishlist');
    });

    test('API-CUS-010: GET /customer/wishlist/count — wishlist count', async ({ customerApi }) => {
        const res = await customerApi.get('customer/wishlist/count');
        await expectStatus(res, 200, 'Wishlist count');
    });
});

test.describe('Customer Admin @P1', () => {
    test('API-CUS-018: GET /admin/customers — list customers', async ({ adminApi }) => {
        const res = await adminApi.get('admin/customers');
        await expectStatus(res, 200, 'Admin list customers');
    });

    test('API-CUS-020: GET /admin/customers/stats — customer stats', async ({ adminApi }) => {
        const res = await adminApi.get('admin/customers/stats');
        await expectStatus(res, 200, 'Customer stats');
    });

    test('API-CUS-021: GET /admin/customers/tags — customer tags', async ({ adminApi }) => {
        const res = await adminApi.get('admin/customers/tags');
        await expectStatus(res, 200, 'Customer tags');
    });
});
