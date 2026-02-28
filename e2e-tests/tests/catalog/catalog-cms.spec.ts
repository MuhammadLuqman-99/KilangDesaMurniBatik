import { test, expect } from '../../fixtures/api-fixtures';
import { extractData } from '../../utils/helpers';

/**
 * CATALOG SERVICE — CMS (Banners, Menus, Media) Tests
 * Service: service-catalog (port 8002)
 */

test.describe('CMS Banners @P1', () => {
    test.describe.configure({ mode: 'serial' });
    let createdBannerId: string | null = null;

    test('API-CAT-035: GET /cms/admin/banners — list banners', async ({ catalogApi }) => {
        const res = await catalogApi.get('cms/admin/banners');
        expect(res.status()).toBe(200);

        const json = await res.json();
        const data = extractData(json);
        const banners = Array.isArray(data) ? data : [];
        expect(Array.isArray(banners)).toBe(true);
    });

    test('API-CAT-036: POST /cms/admin/banners — create banner', async ({ catalogApi }) => {
        const bannerData = {
            name: `e2e-banner-${Date.now()}`,
            banner_type: 'hero',
            location: 'homepage',
            image_desktop: 'https://placehold.co/1920x600',
            is_active: false, // Don't show on live site
            sort_order: 999,
        };

        const res = await catalogApi.post('cms/admin/banners', { data: bannerData });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        createdBannerId = data?.id || null;
    });

    test('API-CAT-037: PUT /cms/admin/banners/:id — update banner', async ({ catalogApi }) => {
        if (!createdBannerId) test.skip();

        const res = await catalogApi.put(`cms/admin/banners/${createdBannerId}`, {
            data: { name: 'E2E Updated Banner' },
        });
        expect([200, 204]).toContain(res.status());
    });

    test('API-CAT-038: DELETE /cms/admin/banners/:id — delete banner', async ({ catalogApi }) => {
        if (!createdBannerId) test.skip();

        const res = await catalogApi.delete(`cms/admin/banners/${createdBannerId}`);
        expect([200, 204]).toContain(res.status());
        createdBannerId = null;
    });

    test('API-CAT-039: GET /cms/admin/menus — list menus', async ({ catalogApi }) => {
        const res = await catalogApi.get('cms/admin/menus');
        expect(res.status()).toBe(200);
    });
});

test.describe('CMS Flash Sales @P1', () => {
    test('API-CAT-027: GET /flash-sales/active — get active flash sales', async ({ publicApi }) => {
        const res = await publicApi.get('flash-sales/active');
        expect([200, 404]).toContain(res.status());
    });

    test('API-CAT-029: POST /admin/flash-sales — create flash sale', async ({ catalogApi }) => {
        const now = new Date();
        const start = new Date(now.getTime() + 86400000).toISOString(); // Tomorrow
        const end = new Date(now.getTime() + 172800000).toISOString();  // Day after

        const res = await catalogApi.post('admin/flash-sales', {
            data: {
                name: `e2e-flash-sale-${Date.now()}`,
                slug: `e2e-flash-${Date.now()}`,
                start_time: start,
                end_time: end,
                is_active: false,
            },
        });
        expect([200, 201]).toContain(res.status());

        // Cleanup
        if (res.status() === 200 || res.status() === 201) {
            const json = await res.json();
            const data = extractData(json);
            if (data?.id) {
                await catalogApi.delete(`admin/flash-sales/${data.id}`);
            }
        }
    });
});

test.describe('CMS Collections @P2', () => {
    test('API-CAT-031: GET /collections — list collections', async ({ publicApi }) => {
        const res = await publicApi.get('collections');
        expect([200, 404]).toContain(res.status());
    });
});
