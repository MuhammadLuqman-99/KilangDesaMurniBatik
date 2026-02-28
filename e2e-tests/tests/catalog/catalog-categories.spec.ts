import { test, expect } from '../../fixtures/api-fixtures';
import { expectSuccess, extractData, generateTestData } from '../../utils/helpers';

/**
 * CATALOG SERVICE — Category Tests
 * Service: service-catalog (port 8002)
 */

test.describe('Catalog Categories - Public @P0', () => {
    test('API-CAT-007: GET /categories — list all categories', async ({ publicApi }) => {
        const res = await publicApi.get('categories');
        expect(res.status()).toBe(200);

        const json = await res.json();
        const data = extractData(json);
        const categories = Array.isArray(data) ? data : data.items || [];
        expect(Array.isArray(categories)).toBe(true);
    });

    test('API-CAT-008: GET /categories/featured — featured categories', async ({ publicApi }) => {
        const res = await publicApi.get('categories/featured');
        expect([200, 404]).toContain(res.status());
    });

    test('API-CAT-009: GET /categories/:slug — get category by slug', async ({ publicApi }) => {
        const listRes = await publicApi.get('categories');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const categories = Array.isArray(data) ? data : data.items || [];

        if (categories.length > 0) {
            const slug = categories[0].slug;
            const res = await publicApi.get(`categories/${slug}`);
            expect(res.status()).toBe(200);
        }
    });

    test('API-CAT-010: GET /categories/:slug/products — category products with pagination', async ({ publicApi }) => {
        const listRes = await publicApi.get('categories');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const categories = Array.isArray(data) ? data : data.items || [];

        if (categories.length > 0) {
            const slug = categories[0].slug;
            const res = await publicApi.get(`categories/${slug}/products?page=1&limit=5`);
            expect(res.status()).toBe(200);
        }
    });
});

test.describe('Catalog Categories - Admin @P1', () => {
    test.describe.configure({ mode: 'serial' });
    let createdCategoryId: string | null = null;

    test('API-CAT-024: POST /admin/categories — create category', async ({ catalogApi }) => {
        const categoryData = generateTestData('category');

        const res = await catalogApi.post('admin/categories', { data: categoryData });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        createdCategoryId = data?.id || null;
    });

    test('API-CAT-025: PUT /admin/categories/:id — update category', async ({ catalogApi }) => {
        if (!createdCategoryId) test.skip();

        const res = await catalogApi.put(`admin/categories/${createdCategoryId}`, {
            data: { name: 'E2E Updated Category' },
        });
        expect([200, 204]).toContain(res.status());
    });

    test('API-CAT-026: DELETE /admin/categories/:id — delete category', async ({ catalogApi }) => {
        if (!createdCategoryId) test.skip();

        const res = await catalogApi.delete(`admin/categories/${createdCategoryId}`);
        expect([200, 204]).toContain(res.status());
        createdCategoryId = null;
    });
});
