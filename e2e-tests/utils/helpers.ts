import { APIResponse, expect } from '@playwright/test';
import { testConfig } from '../config/test.config';

/**
 * Assert that an API response is successful (2xx)
 */
export async function expectSuccess(response: APIResponse, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    const json = await response.json();
    // Most endpoints wrap in { success: true, data: ... }
    if (json.success !== undefined) {
        expect(json.success).toBe(true);
    }
    return json;
}

/**
 * Assert that an API response is an error with expected status
 */
export async function expectError(response: APIResponse, expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
    const json = await response.json().catch(() => ({}));
    return json;
}

/**
 * Extract data from standard API response
 * Handles both { data: ... } and { success: true, data: ... } formats
 */
export function extractData<T = any>(json: any): T {
    if (json?.data !== undefined) return json.data as T;
    return json as T;
}

/**
 * Extract paginated items from API response
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

/**
 * Generate unique test data with e2e prefix
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
        default:
            return { name: `${prefix}${type}-${timestamp}` };
    }
}

/**
 * Wait for a short delay (use sparingly)
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
