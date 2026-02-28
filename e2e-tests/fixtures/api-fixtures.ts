import { test as base, APIRequestContext } from '@playwright/test';
import { testConfig } from '../config/test.config';

/**
 * Service-specific API request contexts with authentication
 */
interface ApiFixtures {
    /** Authenticated API context for auth service */
    authApi: APIRequestContext;
    /** Authenticated API context for catalog service */
    catalogApi: APIRequestContext;
    /** Authenticated API context for order service */
    orderApi: APIRequestContext;
    /** Authenticated API context for customer service */
    customerApi: APIRequestContext;
    /** Authenticated API context for inventory service */
    inventoryApi: APIRequestContext;
    /** Authenticated API context for marketplace service */
    marketplaceApi: APIRequestContext;
    /** Authenticated API context for agent service */
    agentApi: APIRequestContext;
    /** Authenticated API context for support service */
    supportApi: APIRequestContext;
    /** Authenticated API context for reporting service */
    reportingApi: APIRequestContext;
    /** Unauthenticated API context (no token) */
    publicApi: APIRequestContext;
    /** Admin JWT access token */
    adminToken: string;
    /** Customer JWT access token */
    customerToken: string;
}

/** Login and get access token from auth service */
async function getToken(
    playwright: typeof base extends infer T ? T : never,
    email: string,
    password: string,
): Promise<string> {
    // Use a raw request context to login
    const ctx = await (playwright as any).request.newContext({
        baseURL: testConfig.services.auth.baseUrl,
    });

    const res = await ctx.post('/auth/login', {
        data: { email, password },
    });

    const json = await res.json();
    const data = json.data || json;
    const token = data.tokens?.access_token || data.access_token || data.token;
    await ctx.dispose();

    if (!token) {
        throw new Error(`Login failed for ${email}: ${JSON.stringify(json)}`);
    }
    return token;
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
            // Customer user may not exist yet — use empty token
            await use('');
        }
    },

    authApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.auth.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    catalogApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.catalog.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    orderApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.order.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    customerApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.customer.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    inventoryApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.inventory.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    marketplaceApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.marketplace.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    agentApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.agent.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    supportApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.support.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    reportingApi: async ({ playwright, adminToken }, use) => {
        const ctx = await createAuthContext(playwright, testConfig.services.reporting.baseUrl, adminToken);
        await use(ctx);
        await ctx.dispose();
    },

    publicApi: async ({ playwright }, use) => {
        const ctx = await playwright.request.newContext({
            baseURL: testConfig.services.catalog.baseUrl,
            extraHTTPHeaders: { 'Content-Type': 'application/json' },
        });
        await use(ctx);
        await ctx.dispose();
    },
});

export { expect } from '@playwright/test';
