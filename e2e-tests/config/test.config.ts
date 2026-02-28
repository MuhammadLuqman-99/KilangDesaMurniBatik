/**
 * E2E API Test Configuration
 * Defines all service endpoints, credentials, and test data conventions
 *
 * Two gateway URLs are used:
 *   - API_GATEWAY_URL  → storefront domain (public/customer routes)
 *   - API_ADMIN_URL    → admin subdomain  (all /admin/* routes)
 *
 * On VPS:
 *   API_GATEWAY_URL=https://kilangdesamurnibatik.com
 *   API_ADMIN_URL=https://admin.kilangdesamurnibatik.com
 *
 * Locally (all routes on same port):
 *   Both default to http://localhost:80
 */

const gw    = process.env.API_GATEWAY_URL || 'http://localhost:80';
const admin = process.env.API_ADMIN_URL   || gw;

export const testConfig = {
    gatewayUrl: gw,
    adminUrl: admin,

    // Service base URLs
    // IMPORTANT: trailing slash required so relative paths resolve correctly
    // Public/customer routes go through storefront gateway
    // Admin routes go through admin gateway
    services: {
        auth:        { baseUrl: gw    + '/api/v1/' },
        catalog:     { baseUrl: gw    + '/api/v1/' },
        order:       { baseUrl: gw    + '/api/v1/' },
        customer:    { baseUrl: gw    + '/api/v1/' },
        inventory:   { baseUrl: gw    + '/api/v1/' },
        reporting:   { baseUrl: admin + '/api/v1/' },
        marketplace: { baseUrl: admin + '/api/v1/' },
        agent:       { baseUrl: gw    + '/api/v1/' },
        support:     { baseUrl: gw    + '/api/v1/' },
    },

    // Admin API base URL (for /admin/* routes like users, roles, settings)
    adminApi: { baseUrl: admin + '/api/v1/' },

    // Test user credentials (must exist in DB)
    users: {
        admin: {
            email: process.env.TEST_ADMIN_EMAIL || 'admin@kilang.com',
            password: process.env.TEST_ADMIN_PASSWORD || 'admin1234',
        },
        staff: {
            email: process.env.TEST_STAFF_EMAIL || 'e2e-staff@desamurnibatik.com',
            password: process.env.TEST_STAFF_PASSWORD || 'Admin123!@#',
        },
        customer: {
            email: process.env.TEST_CUSTOMER_EMAIL || 'customer@kilang.com',
            password: process.env.TEST_CUSTOMER_PASSWORD || 'Desamurni@7457',
        },
        agent: {
            email: process.env.TEST_AGENT_EMAIL || 'nora@agentdm.com',
            password: process.env.TEST_AGENT_PASSWORD || 'Desamurni@7457',
        },
    },

    // Timeouts
    timeouts: {
        short: 5_000,
        medium: 10_000,
        long: 30_000,
    },

    // Test data conventions
    testDataPrefix: 'e2e-',
};
