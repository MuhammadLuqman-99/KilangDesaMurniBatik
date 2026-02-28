/**
 * E2E API Test Configuration
 * Defines all service endpoints, credentials, and test data conventions
 */
export const testConfig = {
    // Backend service base URLs
    services: {
        auth:        { baseUrl: process.env.AUTH_URL        || 'http://localhost:8001/api/v1' },
        catalog:     { baseUrl: process.env.CATALOG_URL     || 'http://localhost:8002/api/v1' },
        order:       { baseUrl: process.env.ORDER_URL       || 'http://localhost:8003/api/v1' },
        customer:    { baseUrl: process.env.CUSTOMER_URL    || 'http://localhost:8004/api/v1' },
        inventory:   { baseUrl: process.env.INVENTORY_URL   || 'http://localhost:8005/api/v1' },
        reporting:   { baseUrl: process.env.REPORTING_URL   || 'http://localhost:8007/api/v1' },
        marketplace: { baseUrl: process.env.MARKETPLACE_URL || 'http://localhost:8008/api/v1' },
        agent:       { baseUrl: process.env.AGENT_URL       || 'http://localhost:8009/api/v1' },
        support:     { baseUrl: process.env.SUPPORT_URL     || 'http://localhost:8010/api/v1' },
    },

    // Test user credentials (must exist in DB via seed)
    users: {
        admin: {
            email: process.env.TEST_ADMIN_EMAIL || 'e2e-admin@desamurnibatik.com',
            password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#',
        },
        staff: {
            email: process.env.TEST_STAFF_EMAIL || 'e2e-staff@desamurnibatik.com',
            password: process.env.TEST_STAFF_PASSWORD || 'Admin123!@#',
        },
        customer: {
            email: process.env.TEST_CUSTOMER_EMAIL || 'e2e-customer@desamurnibatik.com',
            password: process.env.TEST_CUSTOMER_PASSWORD || 'Customer123!@#',
        },
        agent: {
            email: process.env.TEST_AGENT_EMAIL || 'e2e-agent@desamurnibatik.com',
            password: process.env.TEST_AGENT_PASSWORD || 'Agent123!@#',
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
