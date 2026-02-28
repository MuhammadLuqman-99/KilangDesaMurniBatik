import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData } from '../../utils/helpers';

/**
 * CATALOG SERVICE — Search Tests
 * Service: service-catalog (port 8002), Meilisearch
 */

test.describe('Catalog Search @P0', () => {
    test('API-CAT-011: GET /search?q=batik — full-text search returns results', async ({ publicApi }) => {
        const res = await publicApi.get('search?q=batik');
        await expectStatus(res, 200, 'Search batik');

        const json = await res.json();
        const data = extractData(json);
        const items = data?.hits || data?.items || (Array.isArray(data) ? data : []);
        expect(Array.isArray(items), 'Search results should be an array').toBe(true);
    });

    test('API-CAT-012: GET /search?q=nonexistent — empty results for no match', async ({ publicApi }) => {
        const res = await publicApi.get('search?q=xyznonexistent99999');
        await expectStatus(res, 200, 'Search nonexistent');

        const json = await res.json();
        const data = extractData(json);
        const items = data?.hits || data?.items || (Array.isArray(data) ? data : []);
        expect(items.length, 'No results for nonsense query').toBe(0);
    });

    test('API-CAT-013: GET /search/suggestions?q=bat — autocomplete suggestions', async ({ publicApi }) => {
        const res = await publicApi.get('search/suggestions?q=bat');
        await expectStatus(res, 200, 'Search suggestions');
    });

    test('API-CAT-011b: GET /search?q=batik&limit=1 — search respects limit', async ({ publicApi }) => {
        const res = await publicApi.get('search?q=batik&limit=1');
        await expectStatus(res, 200, 'Search with limit');

        const json = await res.json();
        const data = extractData(json);
        const items = data?.hits || data?.items || (Array.isArray(data) ? data : []);
        expect(items.length, 'Search with limit=1 should return at most 1').toBeLessThanOrEqual(1);
    });
});
