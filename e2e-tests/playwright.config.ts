import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for API E2E Tests
 * These tests run against the backend services directly (no browser needed)
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
    ],

    use: {
        // No baseURL — each test uses service-specific URLs from testConfig
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
        },
        // Generous timeout for API calls
        actionTimeout: 15000,
    },

    // No browser projects needed — API tests only use APIRequestContext
    projects: [
        {
            name: 'api',
            testMatch: /.*\.spec\.ts/,
        },
    ],
});
