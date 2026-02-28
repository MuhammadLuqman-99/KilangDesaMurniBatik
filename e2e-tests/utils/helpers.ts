import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { testConfig } from '../config/test.config';

// ============================================================================
// STRICT ASSERTION HELPERS
// ============================================================================

/**
 * Assert exact HTTP status code. NEVER use arrays of acceptable codes.
 * For known bugs, use test.fixme() at the test level instead.
 */
export async function expectStatus(response: APIResponse, status: number, context?: string) {
    const msg = context
        ? `${context}: expected ${status}, got ${response.status()}`
        : `Expected status ${status}, got ${response.status()}`;
    expect(response.status(), msg).toBe(status);
}

/**
 * Assert response is successful (2xx) and return parsed JSON.
 */
export async function expectSuccess(response: APIResponse, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    const json = await response.json();
    if (json.success !== undefined) {
        expect(json.success).toBe(true);
    }
    return json;
}

/**
 * Assert response is an error with the expected status code.
 */
export async function expectError(response: APIResponse, expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
    const json = await response.json().catch(() => ({}));
    return json;
}

/**
 * Assert that an object has expected fields with correct types.
 * Types: 'string', 'number', 'boolean', 'object', 'array', 'uuid'
 */
export function assertShape(obj: any, shape: Record<string, string>, label = 'response') {
    expect(obj, `${label} should be an object`).toBeTruthy();
    for (const [key, expectedType] of Object.entries(shape)) {
        expect(obj, `${label} missing field: ${key}`).toHaveProperty(key);
        if (expectedType === 'array') {
            expect(Array.isArray(obj[key]), `${label}.${key} should be an array`).toBe(true);
        } else if (expectedType === 'uuid') {
            expect(typeof obj[key], `${label}.${key} should be a string (uuid)`).toBe('string');
            expect(obj[key].length, `${label}.${key} should look like a UUID`).toBeGreaterThan(0);
        } else {
            expect(typeof obj[key], `${label}.${key} should be ${expectedType}`).toBe(expectedType);
        }
    }
}

/**
 * Assert paginated response has correct meta structure.
 */
export function assertPagination(json: any, label = 'response') {
    expect(json, `${label} should have meta`).toHaveProperty('meta');
    const meta = json.meta;
    expect(typeof meta.page, `${label}.meta.page should be number`).toBe('number');
    expect(typeof meta.total, `${label}.meta.total should be number`).toBe('number');
    expect(typeof meta.total_pages, `${label}.meta.total_pages should be number`).toBe('number');
}

/**
 * Assert response is a non-empty array.
 */
export function assertNonEmptyArray(data: any, label = 'data') {
    expect(Array.isArray(data), `${label} should be an array`).toBe(true);
    expect(data.length, `${label} should not be empty`).toBeGreaterThan(0);
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

/**
 * Extract data from standard API response.
 * Handles both { data: ... } and { success: true, data: ... } formats.
 */
export function extractData<T = any>(json: any): T {
    if (json?.data !== undefined) return json.data as T;
    return json as T;
}

/**
 * Extract paginated items from API response.
 */
export function extractPaginatedItems<T = any>(json: any): { items: T[]; total: number } {
    const data = json?.data || json;
    if (Array.isArray(data)) {
        return { items: data, total: json?.meta?.total || data.length };
    }
    return {
        items: data?.items || [],
        total: data?.total || json?.meta?.total || 0,
    };
}

// ============================================================================
// PREREQUISITE HELPERS
// ============================================================================

/**
 * Fail-fast if a prerequisite value is null/undefined.
 * Use this instead of `if (!id) test.skip()` to catch upstream failures.
 */
export function requireValue<T>(value: T | null | undefined, message: string): T {
    if (value === null || value === undefined) {
        throw new Error(`Prerequisite failed: ${message}`);
    }
    return value;
}

// ============================================================================
// TEST DATA CLEANUP
// ============================================================================

/**
 * Tracks created test resources and cleans them up in reverse order.
 * Use in test.afterAll() to ensure test data is removed.
 */
export class TestDataCleaner {
    private items: Array<{ api: APIRequestContext; endpoint: string; label: string }> = [];

    /** Register a resource for cleanup */
    track(api: APIRequestContext, endpoint: string, label = endpoint) {
        this.items.push({ api, endpoint, label });
    }

    /** Delete all tracked resources in reverse order (LIFO) */
    async cleanAll() {
        const errors: string[] = [];
        for (const item of this.items.reverse()) {
            try {
                await item.api.delete(item.endpoint);
            } catch (e) {
                errors.push(`Failed to clean ${item.label}: ${e}`);
            }
        }
        this.items = [];
        if (errors.length > 0) {
            console.warn('[TestDataCleaner] Cleanup warnings:\n' + errors.join('\n'));
        }
    }
}

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate unique test data with e2e prefix.
 */
export function generateTestData(type: string) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const prefix = testConfig.testDataPrefix;

    switch (type) {
        case 'product':
            return {
                name: `${prefix}Product ${timestamp}`,
                slug: `${prefix}product-${timestamp}-${random}`,
                description: 'E2E test product - safe to delete',
                base_price: 99.90,
                status: 'active',
                sku: `${prefix}SKU-${timestamp}`,
            };
        case 'category':
            return {
                name: `${prefix}Category ${timestamp}`,
                slug: `${prefix}category-${timestamp}-${random}`,
                description: 'E2E test category',
            };
        case 'customer':
            return {
                name: `${prefix}Customer ${timestamp}`,
                email: `${prefix}customer-${timestamp}@test.com`,
                phone: `+601${timestamp.toString().slice(-8)}`,
            };
        case 'address':
            return {
                label: `${prefix}Address`,
                recipient_name: `${prefix}Recipient`,
                phone: '+60123456789',
                address_line1: '123 Test Street',
                city: 'Kuala Terengganu',
                state: 'Terengganu',
                postcode: '20000',
                country: 'MY',
            };
        case 'order':
            return {
                customer_name: `${prefix}Buyer`,
                customer_email: `${prefix}buyer-${timestamp}@test.com`,
                customer_phone: '+60123456789',
                shipping_address: {
                    recipient_name: `${prefix}Buyer`,
                    phone: '+60123456789',
                    address_line1: '456 Order Street',
                    city: 'Kuala Lumpur',
                    state: 'WP KL',
                    postcode: '50000',
                    country: 'MY',
                },
            };
        case 'agent':
            return {
                name: `${prefix}Agent ${timestamp}`,
                email: `${prefix}agent-${timestamp}@test.com`,
                phone: `+601${timestamp.toString().slice(-8)}`,
                commission_rate: 5,
            };
        case 'ticket':
            return {
                subject: `${prefix}Support Ticket ${timestamp}`,
                message: 'This is an E2E test ticket - safe to delete',
                category_id: '',
            };
        case 'banner':
            return {
                name: `${prefix}Banner ${timestamp}`,
                banner_type: 'hero',
                is_active: false, // safety: never activate test banners
                link_url: 'https://test.example.com',
            };
        default:
            return { name: `${prefix}${type}-${timestamp}` };
    }
}

/**
 * Wait for a short delay (use sparingly).
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
