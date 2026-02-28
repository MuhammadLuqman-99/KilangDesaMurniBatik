import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, requireValue, generateTestData, TestDataCleaner } from '../../utils/helpers';

/**
 * CATALOG SERVICE — Category Tests
 * Service: service-catalog (port 8002)
 */

test.describe('Catalog Categories - Public @P0', () => {
    test('API-CAT-007: GET /categories — list all categories', async ({ publicApi }) => {
        const res = await publicApi.get('categories');
        await expectStatus(res, 200, 'List categories');

        const json = await res.json();
        const data = extractData(json);
        const categories = Array.isArray(data) ? data : data.items || [];
        expect(Array.isArray(categories), 'Categories should be an array').toBe(true);
    });

    test('API-CAT-008: GET /categories/featured — featured categories', async ({ publicApi }) => {
        const res = await publicApi.get('categories/featured');
        await expectStatus(res, 200, 'Featured categories');
    });

    test('API-CAT-009: GET /categories/:slug — get category by slug', async ({ publicApi }) => {
        const listRes = await publicApi.get('categories');
        await expectStatus(listRes, 200, 'List categories for slug');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const categories = Array.isArray(data) ? data : data.items || [];
        requireValue(categories[0], 'At least 1 category must exist');

        const slug = categories[0].slug;
        const res = await publicApi.get(`categories/${slug}`);
        await expectStatus(res, 200, `Get category by slug: ${slug}`);
    });

    test('API-CAT-010: GET /categories/:slug/products — category products', async ({ publicApi }) => {
        const listRes = await publicApi.get('categories');
        const listJson = await listRes.json();
        const data = extractData(listJson);
        const categories = Array.isArray(data) ? data : data.items || [];
        requireValue(categories[0], 'At least 1 category must exist');

        const slug = categories[0].slug;
        const res = await publicApi.get(`categories/${slug}/products?page=1&limit=5`);
        await expectStatus(res, 200, 'Category products');
    });
});

test.describe('Catalog Categories - Admin @P1', () => {
    test.describe.configure({ mode: 'serial' });

    const cleaner = new TestDataCleaner();
    let createdCategoryId: string | null = null;

    test.afterAll(async () => {
        await cleaner.cleanAll();
    });

    test('API-CAT-024: POST /admin/categories — create category', async ({ catalogApi }) => {
        const categoryData = generateTestData('category');

        const res = await catalogApi.post('admin/categories', { data: categoryData });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        createdCategoryId = requireValue(data?.id, 'Category creation must return an id');
        cleaner.track(catalogApi, `admin/categories/${createdCategoryId}`, 'test category');
    });

    test('API-CAT-025: PUT /admin/categories/:id — update category', async ({ catalogApi }) => {
        requireValue(createdCategoryId, 'Category must be created first');

        const res = await catalogApi.put(`admin/categories/${createdCategoryId}`, {
            data: { name: 'E2E Updated Category' },
        });
        expect([200, 204]).toContain(res.status());
    });

    test('API-CAT-026: DELETE /admin/categories/:id — delete category', async ({ catalogApi }) => {
        requireValue(createdCategoryId, 'Category must be created first');

        const res = await catalogApi.delete(`admin/categories/${createdCategoryId}`);
        expect([200, 204]).toContain(res.status());
        createdCategoryId = null;
    });

    test('API-CAT-024b: GET /admin/categories — admin category list', async ({ catalogApi }) => {
        const res = await catalogApi.get('admin/categories');
        await expectStatus(res, 200, 'Admin category list');
    });
});
