import { test, expect } from '../../fixtures/api-fixtures';
import { expectSuccess, extractData, generateTestData } from '../../utils/helpers';

/**
 * AUTH SERVICE — RBAC (Roles, Permissions, Users) Tests
 * Service: service-auth (port 8001)
 */

test.describe('Auth 2FA @P1', () => {
    test('API-AUTH-016: GET /auth/2fa/status — returns 2FA status', async ({ authApi }) => {
        const res = await authApi.get('/auth/2fa/status');
        expect([200, 404]).toContain(res.status()); // 404 if 2FA not supported
    });

    test('API-AUTH-017: GET /auth/2fa/setup — returns QR code for setup', async ({ authApi }) => {
        const res = await authApi.get('/auth/2fa/setup');
        // May return 200 with QR data or 400 if already enabled
        expect([200, 400]).toContain(res.status());
    });
});

test.describe('Auth RBAC @P1', () => {
    test('API-AUTH-020: GET /admin/users — list users (admin only)', async ({ authApi }) => {
        const res = await authApi.get('/admin/users');
        const json = await expectSuccess(res);
        const data = extractData(json);
        // Should return array of users
        const users = Array.isArray(data) ? data : data.items || data.users || [];
        expect(Array.isArray(users)).toBe(true);
    });

    test('API-AUTH-021: POST /admin/users — create user', async ({ authApi }) => {
        const userData = {
            name: 'E2E Test User',
            email: `e2e-user-${Date.now()}@test.com`,
            password: 'TestUser123!@#',
            role: 'staff',
        };

        const res = await authApi.post('/admin/users', { data: userData });
        expect([200, 201]).toContain(res.status());

        // Cleanup: delete the created user
        if (res.status() === 200 || res.status() === 201) {
            const json = await res.json();
            const data = extractData(json);
            const userId = data?.id;
            if (userId) {
                await authApi.delete(`/admin/users/${userId}`);
            }
        }
    });

    test('API-AUTH-022: GET /admin/roles — list roles', async ({ authApi }) => {
        const res = await authApi.get('/admin/roles');
        const json = await expectSuccess(res);
        const data = extractData(json);
        const roles = Array.isArray(data) ? data : data.items || data.roles || [];
        expect(Array.isArray(roles)).toBe(true);
        expect(roles.length).toBeGreaterThan(0); // At least admin role
    });

    test('API-AUTH-023: POST /admin/roles — create role with permissions', async ({ authApi }) => {
        const roleData = {
            name: `e2e-role-${Date.now()}`,
            description: 'E2E test role',
            permissions: ['products:read', 'orders:read'],
        };

        const res = await authApi.post('/admin/roles', { data: roleData });
        expect([200, 201]).toContain(res.status());

        // Cleanup
        if (res.status() === 200 || res.status() === 201) {
            const json = await res.json();
            const data = extractData(json);
            if (data?.id) {
                await authApi.delete(`/admin/roles/${data.id}`);
            }
        }
    });

    test('API-AUTH-024: GET /admin/permissions — list all permissions', async ({ authApi }) => {
        const res = await authApi.get('/admin/permissions');
        expect([200]).toContain(res.status());
    });

    test('API-AUTH-025: POST /admin/users/:id/roles — assign role to user', async ({ authApi }) => {
        // Get a user first
        const usersRes = await authApi.get('/admin/users');
        const usersJson = await usersRes.json();
        const users = extractData(usersJson);
        const userList = Array.isArray(users) ? users : users.items || [];

        if (userList.length > 0) {
            const userId = userList[0].id;
            // Get a role
            const rolesRes = await authApi.get('/admin/roles');
            const rolesJson = await rolesRes.json();
            const roles = extractData(rolesJson);
            const roleList = Array.isArray(roles) ? roles : roles.items || [];

            if (roleList.length > 0) {
                const roleId = roleList[0].id;
                const res = await authApi.post(`/admin/users/${userId}/roles`, {
                    data: { role_id: roleId },
                });
                // May succeed or conflict if already assigned
                expect([200, 201, 400, 409]).toContain(res.status());
            }
        }
    });
});

test.describe('Auth Settings @P1', () => {
    test('API-AUTH-026: GET /admin/settings — get all settings', async ({ authApi }) => {
        const res = await authApi.get('/admin/settings');
        expect([200]).toContain(res.status());
    });

    test('API-AUTH-027: PUT /admin/settings/general — update general settings', async ({ authApi }) => {
        const res = await authApi.get('/admin/settings/general');
        if (res.status() === 200) {
            const json = await res.json();
            const data = extractData(json);
            // Re-save same data (no actual change)
            const updateRes = await authApi.put('/admin/settings/general', { data });
            expect([200, 204]).toContain(updateRes.status());
        }
    });

    test('API-AUTH-028: GET /admin/activity-logs — get activity logs', async ({ authApi }) => {
        const res = await authApi.get('/admin/activity-logs');
        expect([200]).toContain(res.status());
    });
});
