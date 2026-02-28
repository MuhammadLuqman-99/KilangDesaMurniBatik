import { test, expect } from '../../fixtures/api-fixtures';
import { expectStatus, extractData, requireValue, generateTestData } from '../../utils/helpers';
import { testConfig } from '../../config/test.config';

/**
 * SUPPORT SERVICE — Ticket Tests
 * Service: service-support (port 8009)
 *
 * BUG-004: All support ticket operations return 500
 * BUG-011: Contact form returns 400
 */

test.describe('Support - Public @P1', () => {
    // BUG-011: Contact form returns 400
    test.fixme('API-SUP-001: POST /support/contact — submit contact form @BUG-011', async ({ publicApi }) => {
        const res = await publicApi.post('support/contact', {
            data: {
                name: 'E2E Test Contact',
                email: 'e2e-contact@test.com',
                subject: 'E2E Test Contact Form',
                message: 'This is an automated test message - safe to ignore',
            },
        });
        expect([200, 201]).toContain(res.status());
    });

    test('API-SUP-002: GET /support/categories — get support categories', async ({ publicApi }) => {
        const res = await publicApi.get('support/categories');
        await expectStatus(res, 200, 'Support categories');
    });
});

test.describe('Support - Customer Tickets @P1', () => {
    test.describe.configure({ mode: 'serial' });
    let createdTicketId: string | null = null;

    // BUG-004: All ticket operations return 500
    test.fixme('API-SUP-003: POST /support/tickets — create ticket @BUG-004', async ({ supportApi }) => {
        const ticketData = generateTestData('ticket');

        const res = await supportApi.post('support/tickets', {
            data: {
                subject: ticketData.subject,
                message: ticketData.message,
                category: 'general',
            },
        });
        expect([200, 201]).toContain(res.status());

        const json = await res.json();
        const data = extractData(json);
        createdTicketId = requireValue(data?.id, 'Ticket creation must return an id');
    });

    test.fixme('API-SUP-004: GET /support/tickets — list my tickets @BUG-004', async ({ supportApi }) => {
        const res = await supportApi.get('support/tickets');
        await expectStatus(res, 200, 'List tickets');
    });

    test.fixme('API-SUP-005: GET /support/tickets/:id — get ticket detail @BUG-004', async ({ supportApi }) => {
        requireValue(createdTicketId, 'Ticket must be created first (blocked by BUG-004)');
        const res = await supportApi.get(`support/tickets/${createdTicketId}`);
        await expectStatus(res, 200, 'Ticket detail');
    });

    test.fixme('API-SUP-006: POST /support/tickets/:id/messages — add message @BUG-004', async ({ supportApi }) => {
        requireValue(createdTicketId, 'Ticket must be created first (blocked by BUG-004)');
        const res = await supportApi.post(`support/tickets/${createdTicketId}/messages`, {
            data: { message: 'E2E follow-up message' },
        });
        expect([200, 201]).toContain(res.status());
    });
});

test.describe('Support - Admin @P1', () => {
    // BUG-004: Admin support endpoints also return 500
    test.fixme('API-SUP-008: GET /admin/support/stats — dashboard stats @BUG-004', async ({ adminApi }) => {
        const res = await adminApi.get('admin/support/stats');
        await expectStatus(res, 200, 'Support stats');
    });

    test.fixme('API-SUP-009: GET /admin/support/tickets — list all tickets @BUG-004', async ({ adminApi }) => {
        const res = await adminApi.get('admin/support/tickets');
        await expectStatus(res, 200, 'Admin list tickets');
    });
});
