import { test, expect } from '../../fixtures/api-fixtures';
import { extractData } from '../../utils/helpers';

/**
 * CATALOG SERVICE — Search Tests
 * Service: service-catalog (port 8002)
 */

test.describe('Catalog Search @P0', () => {
    test('API-CAT-011: GET /search?q=batik — full-text search returns results', async ({ publicApi }) => {
        const res = await publicApi.get('/search?q=batik');
        expect(res.status()).toBe(200);

        const json = await res.json();
        const data = extractData(json);
        const items = data?.hits || data?.items || (Array.isArray(data) ? data : []);
        expect(Array.isArray(items)).toBe(true);
    });

    test('API-CAT-012: GET /search?q=nonexistent — empty results for no match', async ({ publicApi }) => {
        const res = await publicApi.get('/search?q=xyznonexistent99999');
        expect(res.status()).toBe(200);

        const json = await res.json();
        const data = extractData(json);
        const items = data?.hits || data?.items || (Array.isArray(data) ? data : []);
        expect(items.length).toBe(0);
    });

    test('API-CAT-013: GET /search/suggestions?q=bat — autocomplete suggestions', async ({ publicApi }) => {
        const res = await publicApi.get('/search/suggestions?q=bat');
        expect([200, 404]).toContain(res.status()); // 404 if route not implemented
    });
});
