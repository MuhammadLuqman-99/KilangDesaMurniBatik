import { test as base, APIRequestContext } from '@playwright/test';
import { testConfig } from '../config/test.config';

/**
 * Service-specific API request contexts with authentication
 *
 * ROUTING NOTES (VPS):
 *   kilangdesamurnibatik.com       → public/customer routes (customer/*, cart/*, products, orders, etc.)
 *   admin.kilangdesamurnibatik.com → admin routes (admin/*, reports/*, analytics/*, cms/admin/*)
 *
 * Most test fixtures use the admin domain since E2E tests primarily test admin endpoints.
 * Customer-facing fixtures (customerApi, orderApi) use the storefront domain.
 */
interface ApiFixtures {
    /** Authenticated API context for auth service (public auth routes — storefront domain) */
    authApi: APIRequestContext;
    /** Authenticated API context for admin-only routes — admin domain */
    adminApi: APIRequestContext;
    /** Authenticated API context for catalog (admin domain — has both public + admin routes) */
    catalogApi: APIRequestContext;
    /** Authenticated API context for order service (admin domain — admin/orders) */
    orderApi: APIRequestContext;
    /** Authenticated API context for customer-facing routes (storefront domain — customer/*) */
    customerApi: APIRequestContext;
    /** Authenticated API context for inventory (admin domain — admin/inventory) */
    inventoryApi: APIRequestContext;
    /** Authenticated API context for marketplace (admin domain) */
    marketplaceApi: APIRequestContext;
    /** Authenticated API context for agent (admin domain — admin/agents) */
    agentApi: APIRequestContext;
    /** Authenticated API context for support (storefront domain — support/*) */
    supportApi: APIRequestContext;
    /** Authenticated API context for reporting (admin domain — reports/*) */
    reportingApi: APIRequestContext;
    /** Unauthenticated API context (storefront domain, no token) */
    publicApi: APIRequestContext;
    /** Admin JWT access token */
    adminToken: string;
    /** Customer JWT access token */
    customerToken: string;
}

/** Login and get access token from auth service (with retry for rate limiting) */
async function getToken(
    playwright: typeof base extends infer T ? T : never,
    email: string,
    password: string,
): Promise<string> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const ctx = await (playwright as any).request.newContext({
            baseURL: testConfig.services.auth.baseUrl,
        });

        const res = await ctx.post('auth/login', {
            data: { email, password },
        });

        const body = await res.text();
        await ctx.dispose();

        // If we got HTML back (rate limit / nginx error), retry after delay
        if (body.startsWith('<')) {
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 2000 * attempt));
                continue;
            }
            throw new Error(`Login for ${email} returned HTML after ${maxRetries} retries (rate limited?)`);
        }

        const json = JSON.parse(body);
        const data = json.data || json;
        const token = data.tokens?.access_token || data.access_token || data.token;

        if (!token) {
            throw new Error(`Login failed for ${email}: ${body}`);
        }
        return token;
    }
    throw new Error(`Login failed for ${email} after ${maxRetries} retries`);
}

/** Create an authenticated API context for a given service */
async function createAuthContext(
    playwright: any,
    baseURL: string,
    token: string,
): Promise<APIRequestContext> {
    return playwright.request.newContext({
        baseURL,
        extraHTTPHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
}

// Shorthand URLs
const storefrontApi = testConfig.services.auth.baseUrl;     // storefront gateway + /api/v1/
const adminApiUrl   = testConfig.adminApi.baseUrl;           // admin gateway + /api/v1/

export const test = base.extend<ApiFixtures>({
    adminToken: async ({ playwright }, use) => {
        const token = await getToken(
            playwright as any,
            testConfig.users.admin.email,
            testConfig.users.admin.password,
        );
        await use(token);
    },

    customerToken: async ({ playwright }, use) => {
        try {
            const token = await getToken(
                playwright as any,
                testConfig.users.customer.email,
                testConfig.users.customer.password,
            );
            await use(token);
        } catch {
            await use('');
        }
    },

    // Auth API — storefront domain (login, me, verify, 2fa)
    authApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, storefrontApi, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Admin API — admin domain (admin/users, admin/roles, admin/settings, etc.)
    adminApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Catalog API — admin domain (has both public products and admin/products)
    catalogApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Order API — admin domain (admin/orders, admin/shipping)
    orderApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Customer API — storefront domain (customer/*, cart/*)
    customerApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, storefrontApi, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Inventory API — admin domain (admin/inventory, admin/warehouses)
    inventoryApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Marketplace API — admin domain
    marketplaceApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Agent API — admin domain (admin/agents, agent/*)
    agentApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Support API — storefront domain (support/*)
    supportApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, storefrontApi, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Reporting API — admin domain (reports/*, analytics/*)
    reportingApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, adminApiUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    // Public API — storefront domain, no auth
    publicApi: async ({ playwright }, use) => {
        const ctx = await playwright.request.newContext({
            baseURL: storefrontApi,
            extraHTTPHeaders: { 'Content-Type': 'application/json' },
        });
        await use(ctx);
        await ctx.dispose();
    },
});

export { expect } from '@playwright/test';
