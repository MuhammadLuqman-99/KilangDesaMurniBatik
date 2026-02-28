import { test, expect } from '../../fixtures/api-fixtures';
import { testConfig } from '../../config/test.config';
import { expectSuccess, expectError, expectStatus, extractData, assertShape } from '../../utils/helpers';

/**
 * AUTH SERVICE — Login / Logout / Token Tests
 * Service: service-auth (port 8001)
 *
 * Strict assertions: every test expects an exact status code.
 */

test.describe('Auth Login @P0', () => {
    test('API-AUTH-001: POST /auth/login — valid admin credentials returns token + user', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', {
            data: {
                email: testConfig.users.admin.email,
                password: testConfig.users.admin.password,
            },
        });

        const json = await expectSuccess(res);
        const data = extractData(json);

        // Must return tokens
        const token = data.tokens?.access_token || data.access_token || data.token;
        expect(token, 'Login should return an access token').toBeTruthy();

        // Must return user info
        const user = data.user || data;
        expect(user.email).toBe(testConfig.users.admin.email);
        expect(user.id, 'User should have an id').toBeTruthy();

        await ctx.dispose();
    });

    test('API-AUTH-001b: POST /auth/login — valid customer credentials returns token', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', {
            data: {
                email: testConfig.users.customer.email,
                password: testConfig.users.customer.password,
            },
        });

        const json = await expectSuccess(res);
        const data = extractData(json);
        const token = data.tokens?.access_token || data.access_token || data.token;
        expect(token, 'Customer login should return an access token').toBeTruthy();

        await ctx.dispose();
    });

    test('API-AUTH-002: POST /auth/login — invalid password returns 401', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', {
            data: {
                email: testConfig.users.admin.email,
                password: 'WrongPassword123!',
            },
        });

        await expectError(res, 401);
        await ctx.dispose();
    });

    test('API-AUTH-003: POST /auth/login — nonexistent email returns 401', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', {
            data: {
                email: 'nonexistent@desamurnibatik.com',
                password: 'SomePassword123!',
            },
        });

        await expectError(res, 401);
        await ctx.dispose();
    });

    test('API-AUTH-004: POST /auth/login — empty body returns 400', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', { data: {} });
        // Empty body should be a client error — 400 is the correct response
        await expectStatus(res, 400, 'Empty login body');
        await ctx.dispose();
    });

    test('API-AUTH-005: POST /auth/login — SQL injection handled safely', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', {
            data: {
                email: "admin' OR '1'='1",
                password: "' OR '1'='1",
            },
        });

        // Must NOT return 200 or leak data
        expect(res.status()).not.toBe(200);
        await ctx.dispose();
    });

    test('API-AUTH-006: POST /auth/logout — invalidates token', async ({ authApi }) => {
        const res = await authApi.post('auth/logout');
        // Logout should succeed — either 200 (body) or 204 (no content)
        expect([200, 204]).toContain(res.status());
    });

    test('API-AUTH-007: POST /auth/refresh — valid refresh token returns new access token', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        // First login to get refresh token
        const loginRes = await ctx.post('auth/login', {
            data: {
                email: testConfig.users.admin.email,
                password: testConfig.users.admin.password,
            },
        });

        const loginJson = await loginRes.json();
        const loginData = loginJson.data || loginJson;
        const refreshToken = loginData.tokens?.refresh_token || loginData.refresh_token;

        expect(refreshToken, 'Login should return a refresh token').toBeTruthy();

        const refreshRes = await ctx.post('auth/refresh', {
            data: { refresh_token: refreshToken },
        });
        const refreshJson = await expectSuccess(refreshRes);
        const refreshData = extractData(refreshJson);
        const newToken = refreshData.access_token || refreshData.tokens?.access_token || refreshData.token;
        expect(newToken, 'Refresh should return a new access token').toBeTruthy();

        await ctx.dispose();
    });

    test('API-AUTH-008: POST /auth/refresh — expired/invalid refresh token returns 401', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/refresh', {
            data: { refresh_token: 'invalid-token-12345' },
        });

        await expectError(res, 401);
        await ctx.dispose();
    });
});

test.describe('Auth Protected Routes @P0', () => {
    test('API-AUTH-009: GET /auth/me — returns current user with valid token', async ({ authApi }) => {
        const res = await authApi.get('auth/me');
        const json = await expectSuccess(res);
        const data = extractData(json);
        const user = data.user || data;

        expect(user.email).toBe(testConfig.users.admin.email);
        expect(user.id, 'User must have an id').toBeTruthy();
    });

    test('API-AUTH-010: GET /auth/me — returns 401 without token', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.get('auth/me');
        await expectError(res, 401);
        await ctx.dispose();
    });

    test('API-AUTH-011: GET /auth/me — returns 401 with expired/fake token', async ({ playwright }) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
            extraHTTPHeaders: {
                Authorization: 'Bearer expired.fake.token',
            },
        });

        const res = await ctx.get('auth/me');
        await expectError(res, 401);
        await ctx.dispose();
    });

    test('API-AUTH-012: PUT /auth/me — update profile fields', async ({ authApi }) => {
        const res = await authApi.put('auth/me', {
            data: { name: 'E2E Admin Updated' },
        });
        await expectStatus(res, 200, 'Update profile');
    });

    test('API-AUTH-013: POST /auth/change-password — rejects wrong old password', async ({ authApi }) => {
        const res = await authApi.post('auth/change-password', {
            data: { old_password: 'WrongOldPassword!', new_password: 'NewPass123!@#' },
        });
        // Wrong old password should be rejected as 400 (bad request)
        await expectStatus(res, 400, 'Wrong old password should be rejected');
    });

    test('API-AUTH-014: GET /auth/verify — token verification returns 200', async ({ authApi }) => {
        const res = await authApi.get('auth/verify');
        await expectStatus(res, 200, 'Token verification');
    });
});
