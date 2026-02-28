import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * CROSS-SERVICE — RBAC Enforcement Tests
 *
 * Verifies that role-based access control works correctly across ALL services:
 * - Customer token CANNOT access admin routes
 * - Unauthenticated requests CANNOT access protected routes
 * - Admin token CAN access admin routes
 * - Customer token CAN access customer routes
 */

test.describe('RBAC: Customer Cannot Access Admin Routes @P0', () => {
    test('RBAC-001: Customer -> GET /admin/products returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/products');
        expect([401, 403], 'Customer should not access admin products').toContain(res.status());
    });

    test('RBAC-002: Customer -> GET /admin/orders returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/orders');
        expect([401, 403], 'Customer should not access admin orders').toContain(res.status());
    });

    test('RBAC-003: Customer -> GET /admin/customers returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/customers');
        expect([401, 403], 'Customer should not access admin customers').toContain(res.status());
    });

    test('RBAC-004: Customer -> GET /admin/users returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/users');
        expect([401, 403], 'Customer should not access admin users').toContain(res.status());
    });

    test('RBAC-005: Customer -> GET /admin/roles returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/roles');
        expect([401, 403], 'Customer should not access admin roles').toContain(res.status());
    });

    test('RBAC-006: Customer -> GET /admin/settings returns 401/403', async ({ customerApi }) => {
        const res = await customerApi.get('admin/settings');
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

    test('RBAC-012: No token -> GET /admin/orders returns 401', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.adminApi.baseUrl,
        });
        const res = await ctx.get('admin/orders');
        await expectStatus(res, 401, 'Unauthenticated admin/orders');
        await ctx.dispose();
    });

    test('RBAC-013: No token -> GET /admin/users returns 401', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.adminApi.baseUrl,
        });
        const res = await ctx.get('admin/users');
        await expectStatus(res, 401, 'Unauthenticated admin/users');
        await ctx.dispose();
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
