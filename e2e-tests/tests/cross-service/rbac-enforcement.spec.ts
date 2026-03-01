import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus } from '../../utils/helpers';

/**
 * CROSS-SERVICE — RBAC Enforcement Tests
 *
 * Verifies that role-based access control works correctly across ALL services:
 * - Customer token CANNOT access admin routes (uses admin domain)
 * - Unauthenticated requests CANNOT access protected routes
 * - Admin token CAN access admin routes
 * - Customer token CAN access customer routes
 *
 * NOTE: customerOnAdminApi = customer token on admin domain (correct for RBAC testing)
 *       customerApi = customer token on storefront domain (for customer routes)
 */

test.describe('RBAC: Customer Cannot Access Admin Routes @P0', () => {
    test('RBAC-001: Customer -> GET /admin/products returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/products');
        expect([401, 403], 'Customer should not access admin products').toContain(res.status());
    });

    test('RBAC-002: Customer -> GET /admin/orders returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/orders');
        expect([401, 403], 'Customer should not access admin orders').toContain(res.status());
    });

    test('RBAC-003: Customer -> GET /admin/customers returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/customers');
        expect([401, 403], 'Customer should not access admin customers').toContain(res.status());
    });

    test('RBAC-004: Customer -> GET /admin/users returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/users');
        expect([401, 403], 'Customer should not access admin users').toContain(res.status());
    });

    test('RBAC-005: Customer -> GET /admin/roles returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/roles');
        expect([401, 403], 'Customer should not access admin roles').toContain(res.status());
    });

    test('RBAC-006: Customer -> GET /admin/settings returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/settings');
        expect([401, 403], 'Customer should not access admin settings').toContain(res.status());
    });
});

test.describe('RBAC: Unauthenticated Cannot Access Protected Routes @P0', () => {
    test('RBAC-010: No token -> GET /customer/profile returns 401', async ({ publicApi }) => {
        const res = await publicApi.get('customer/profile');
        await expectStatus(res, 401, 'Unauthenticated customer/profile');
    });

    test('RBAC-011: No token -> GET /orders returns 401', async ({ publicApi }) => {
        const res = await publicApi.get('orders');
        await expectStatus(res, 401, 'Unauthenticated orders');
    });

    test('RBAC-012: No token -> GET /admin/orders returns 401', async ({ publicAdminApi }) => {
        const res = await publicAdminApi.get('admin/orders');
        await expectStatus(res, 401, 'Unauthenticated admin/orders');
    });

    test('RBAC-013: No token -> GET /admin/users returns 401', async ({ publicAdminApi }) => {
        const res = await publicAdminApi.get('admin/users');
        await expectStatus(res, 401, 'Unauthenticated admin/users');
    });
});

test.describe('RBAC: Customer Can Access Customer Routes @P0', () => {
    test('RBAC-020: Customer -> GET /customer/profile returns 200', async ({ customerApi }) => {
        const res = await customerApi.get('customer/profile');
        await expectStatus(res, 200, 'Customer can access profile');
    });

    test('RBAC-021: Customer -> GET /customer/addresses returns 200', async ({ customerApi }) => {
        const res = await customerApi.get('customer/addresses');
        await expectStatus(res, 200, 'Customer can access addresses');
    });

    test('RBAC-022: Customer -> GET /customer/wishlist returns 200', async ({ customerApi }) => {
        const res = await customerApi.get('customer/wishlist');
        await expectStatus(res, 200, 'Customer can access wishlist');
    });
});
