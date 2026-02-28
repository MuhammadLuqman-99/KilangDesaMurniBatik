import { defineConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.test file
const envFile = path.resolve(__dirname, '.env.test');
if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
    }
}

/**
 * Playwright configuration for API E2E Tests
 * These tests run against the backend services directly (no browser needed)
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 3,
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
