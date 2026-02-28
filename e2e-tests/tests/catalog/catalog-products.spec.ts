import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, expectSuccess, extractData, extractPaginatedItems, assertPagination, requireValue, generateTestData, TestDataCleaner } from '../../utils/helpers';

/**
 * CATALOG SERVICE — Product Tests
 * Service: service-catalog (port 8002)
 */

test.describe('Catalog Products - Public @P0', () => {
    test('API-CAT-001: GET /products — list products with pagination', async ({ publicApi }) => {
        const res = await publicApi.get('products?page=1&limit=10');
        await expectStatus(res, 200, 'List products');

        const json = await res.json();
        const { items } = extractPaginatedItems(json);
        expect(Array.isArray(items), 'Products should be an array').toBe(true);

        if (json.meta) {
            assertPagination(json, 'Products list');
        }
    });

    test('API-CAT-002: GET /products?category_id=X — filter by category', async ({ publicApi }) => {
        const catRes = await publicApi.get('categories');
        await expectStatus(catRes, 200, 'List categories');
        const catJson = await catRes.json();
        const categories = extractData(catJson);
        const catList = Array.isArray(categories) ? categories : categories.items || [];
        requireValue(catList[0], 'At least 1 category must exist to test category filter');

        const categoryId = catList[0].id;
        const res = await publicApi.get(`products?category_id=${categoryId}`);
        await expectStatus(res, 200, 'Filter products by category');
    });

    test('API-CAT-003: GET /products?sort=price_asc — sort by price', async ({ publicApi }) => {
        const res = await publicApi.get('products?sort=price_asc&limit=5');
        await expectStatus(res, 200, 'Sort products by price');
    });

    test('API-CAT-004: GET /products/:slug — get product by slug', async ({ publicApi }) => {
        const listRes = await publicApi.get('products?limit=1');
        await expectStatus(listRes, 200, 'List products for slug');
        const listJson = await listRes.json();
        const { items } = extractPaginatedItems(listJson);
        requireValue(items[0], 'At least 1 product must exist to test by slug');

        const slug = items[0].slug;
        const res = await publicApi.get(`products/${slug}`);
        await expectStatus(res, 200, `Get product by slug: ${slug}`);

        const json = await res.json();
        const product = extractData(json);
        expect(product.slug || product.handle).toBe(slug);
    });

    test('API-CAT-005: GET /products/:slug — returns 404 for nonexistent slug', async ({ publicApi }) => {
        const res = await publicApi.get('products/nonexistent-product-slug-99999');
        await expectStatus(res, 404, 'Nonexistent product slug');
    });

    test('API-CAT-006: GET /products/:slug/availability — variant availability', async ({ publicApi }) => {
        const listRes = await publicApi.get('products?limit=1');
        const listJson = await listRes.json();
        const { items } = extractPaginatedItems(listJson);
        requireValue(items[0], 'At least 1 product must exist to check availability');

        const slug = items[0].slug;
        const res = await publicApi.get(`products/${slug}/availability`);
        await expectStatus(res, 200, 'Product availability');
    });
});

test.describe('Catalog Products - Admin @P1', () => {
    test.describe.configure({ mode: 'serial' });

    const cleaner = new TestDataCleaner();
    let createdProductId: string | null = null;

    // BUG-006: Product creation via API returns 500
    test.fixme('API-CAT-014: POST /admin/products — create product @BUG-006', async ({ catalogApi }) => {
        const productData = generateTestData('product');

        const catRes = await catalogApi.get('categories');
        const catJson = await catRes.json();
        const categories = extractData(catJson);
        const catList = Array.isArray(categories) ? categories : categories.items || [];
        const categoryId = catList.length > 0 ? catList[0].id : undefined;

        const res = await catalogApi.post('admin/products', {
            data: {
                ...productData,
                product_type: 'physical',
                category_id: categoryId,
            },
        });

        expect([200, 201]).toContain(res.status());
        const json = await res.json();
        const data = extractData(json);
        createdProductId = requireValue(data?.id, 'Product creation must return an id');
        cleaner.track(catalogApi, `admin/products/${createdProductId}`, 'test product');
    });

    test.fixme('API-CAT-015: PUT /admin/products/:id — update product @BUG-006', async ({ catalogApi }) => {
        requireValue(createdProductId, 'Product must be created first (blocked by BUG-006)');
        const res = await catalogApi.put(`admin/products/${createdProductId}`, {
            data: { name: 'E2E Updated Product Name' },
        });
        await expectStatus(res, 200, 'Update product');
    });

    test.fixme('API-CAT-017: PATCH /admin/products/:id/status — change status @BUG-006', async ({ catalogApi }) => {
        requireValue(createdProductId, 'Product must be created first (blocked by BUG-006)');
        const res = await catalogApi.patch(`admin/products/${createdProductId}/status`, {
            data: { status: 'draft' },
        });
        await expectStatus(res, 200, 'Change product status');
    });

    test.fixme('API-CAT-016: DELETE /admin/products/:id — soft delete product @BUG-006', async ({ catalogApi }) => {
        requireValue(createdProductId, 'Product must be created first (blocked by BUG-006)');
        const res = await catalogApi.delete(`admin/products/${createdProductId}`);
        expect([200, 204]).toContain(res.status());
    });

    test('API-CAT-023: GET /admin/products — admin product list', async ({ catalogApi }) => {
        const res = await catalogApi.get('admin/products');
        await expectStatus(res, 200, 'Admin product list');
    });

    test('API-CAT-023b: GET /admin/products/stats — product stats', async ({ catalogApi }) => {
        const res = await catalogApi.get('admin/products/stats');
        await expectStatus(res, 200, 'Product stats');
    });
});
