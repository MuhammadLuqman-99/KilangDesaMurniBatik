import { test, expect } from '../../fixtures/api-fixtures';
import { expectSuccess, expectError, expectStatus, extractData, assertShape, requireValue, TestDataCleaner } from '../../utils/helpers';

/**
 * AUTH SERVICE — RBAC (Roles, Permissions, Users) + Settings + 2FA Tests
 * Service: service-auth (port 8001)
 *
 * NOTE: /admin/* routes go through admin.kilangdesamurnibatik.com
 *       /auth/*  routes go through kilangdesamurnibatik.com
 */

const cleaner = new TestDataCleaner();

test.describe('Auth 2FA @P1', () => {
    test('API-AUTH-016: GET /auth/2fa/status — returns 2FA status', async ({ authApi }) => {
        // Retry once if rate limited (503)
        let res = await authApi.get('auth/2fa/status');
        if (res.status() === 503) {
            await new Promise(r => setTimeout(r, 2000));
            res = await authApi.get('auth/2fa/status');
        }
        await expectStatus(res, 200, '2FA status');
        const json = await res.json();
        const data = extractData(json);
        expect(data).toBeTruthy();
    });

    test('API-AUTH-017: GET /auth/2fa/setup — returns QR code for setup', async ({ authApi }) => {
        let res = await authApi.get('auth/2fa/setup');
        // Retry once if rate limited (503)
        if (res.status() === 503) {
            await new Promise(r => setTimeout(r, 2000));
            res = await authApi.get('auth/2fa/setup');
        }
        // 200 if not yet enabled, 400 if already enabled — both are valid behaviors
        expect([200, 400]).toContain(res.status());
    });
});

test.describe('Auth RBAC — Users @P0', () => {
    test('API-AUTH-020: GET /admin/users — list users returns array', async ({ adminApi }) => {
        const res = await adminApi.get('admin/users');
        const json = await expectSuccess(res);
        const data = extractData(json);
        const users = Array.isArray(data) ? data : data.items || data.users || [];
        expect(Array.isArray(users), 'Users should be an array').toBe(true);
        expect(users.length, 'Should have at least 1 user (admin)').toBeGreaterThan(0);
    });

    test('API-AUTH-021: POST /admin/users — create and delete user', async ({ adminApi }) => {
        const userData = {
            name: 'E2E Test User',
            email: `e2e-user-${Date.now()}@test.com`,
            password: 'TestUser123!@#',
            role: 'staff',
        };

        const res = await adminApi.post('admin/users', { data: userData });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        const userId = data?.id;
        expect(userId, 'Created user must have an id').toBeTruthy();

        // Cleanup
        if (userId) {
            await adminApi.delete(`admin/users/${userId}`);
        }
    });

    test.fixme('API-AUTH-025: POST /admin/users/:id/roles — assign role to user @BUG-019', async ({ adminApi }) => {
        // Get a user
        const usersRes = await adminApi.get('admin/users');
        const usersJson = await usersRes.json();
        const users = extractData(usersJson);
        const userList = Array.isArray(users) ? users : users.items || [];
        requireValue(userList[0], 'At least 1 user must exist to test role assignment');
        const userId = userList[0].id;

        // Get a role
        const rolesRes = await adminApi.get('admin/roles');
        const rolesJson = await rolesRes.json();
        const roles = extractData(rolesJson);
        const roleList = Array.isArray(roles) ? roles : roles.items || [];
        requireValue(roleList[0], 'At least 1 role must exist to test role assignment');
        const roleId = roleList[0].id;

        const res = await adminApi.post(`admin/users/${userId}/roles`, {
            data: { roleId: roleId },
        });
        // 200/201 = assigned, 409 = already assigned — both are valid
        expect([200, 201, 409]).toContain(res.status());
    });

    // RBAC enforcement: customer cannot access admin users (must use admin domain)
    test('API-AUTH-RBAC-001: GET /admin/users — customer token returns 401/403', async ({ customerOnAdminApi }) => {
        const res = await customerOnAdminApi.get('admin/users');
        expect([401, 403]).toContain(res.status());
    });

    // RBAC enforcement: unauthenticated cannot access admin users (must use admin domain)
    test('API-AUTH-RBAC-002: GET /admin/users — no token returns 401', async ({ publicAdminApi }) => {
        const res = await publicAdminApi.get('admin/users');
        await expectStatus(res, 401, 'Unauthenticated admin/users');
    });
});

test.describe('Auth RBAC — Roles @P0', () => {
    test('API-AUTH-022: GET /admin/roles — list roles', async ({ adminApi }) => {
        const res = await adminApi.get('admin/roles');
        const json = await expectSuccess(res);
        const data = extractData(json);
        const roles = Array.isArray(data) ? data : data.items || data.roles || [];
        expect(Array.isArray(roles), 'Roles should be an array').toBe(true);
        expect(roles.length, 'Should have at least 1 role (admin)').toBeGreaterThan(0);
    });

    test('API-AUTH-023: POST /admin/roles — create role with permissions', async ({ adminApi }) => {
        const roleData = {
            name: `e2e-role-${Date.now()}`,
            description: 'E2E test role',
            permissions: ['products:read', 'orders:read'],
        };

        const res = await adminApi.post('admin/roles', { data: roleData });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        expect(data?.id, 'Created role must have an id').toBeTruthy();

        // Cleanup
        if (data?.id) {
            await adminApi.delete(`admin/roles/${data.id}`);
        }
    });

    test('API-AUTH-024: GET /admin/permissions — list all permissions', async ({ adminApi }) => {
        const res = await adminApi.get('admin/permissions');
        await expectStatus(res, 200, 'List permissions');
    });

    test('API-AUTH-024b: GET /admin/roles/stats — role stats', async ({ adminApi }) => {
        const res = await adminApi.get('admin/roles/stats');
        await expectStatus(res, 200, 'Role stats');
    });
});

test.describe('Auth Settings @P1', () => {
    test('API-AUTH-026: GET /admin/settings — get all settings', async ({ adminApi }) => {
        const res = await adminApi.get('admin/settings');
        await expectStatus(res, 200, 'Get all settings');
    });

    test('API-AUTH-027: GET /admin/settings/general — get general settings', async ({ adminApi }) => {
        const res = await adminApi.get('admin/settings/general');
        await expectStatus(res, 200, 'Get general settings');
    });

    test('API-AUTH-028: GET /admin/activity-logs — get activity logs', async ({ adminApi }) => {
        const res = await adminApi.get('admin/activity-logs');
        await expectStatus(res, 200, 'Get activity logs');
    });

    test('API-AUTH-028b: GET /admin/activity-logs/stats — activity log stats', async ({ adminApi }) => {
        const res = await adminApi.get('admin/activity-logs/stats');
        await expectStatus(res, 200, 'Activity log stats');
    });
});
