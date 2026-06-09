import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { tickets, vendorUsers } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { and, eq } from 'drizzle-orm';
import { useTranslations } from '../../../utils/i18n';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return new Response(JSON.stringify({ success: false, message: t('ticketIdRequired') }), { status: 400 });
    }

    // 1. Fetch the ticket
    const ticketList = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, Number(ticketId)))
      .limit(1);

    if (ticketList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('ticketNotFound') }), { status: 404 });
    }

    const ticket = ticketList[0];

    // 2. Perform role-based updates and authorization check
    if (session.username === 'super') {
      // Super Admin: mark as seen by super
      await db
        .update(tickets)
        .set({ seenBySuper: true })
        .where(eq(tickets.id, ticket.id));
    } else {
      // Vendor Admin: verify access first
      const access = await db
        .select()
        .from(vendorUsers)
        .where(
          and(
            eq(vendorUsers.userId, session.userId),
            eq(vendorUsers.vendorId, ticket.vendorId)
          )
        )
        .limit(1);

      if (access.length === 0) {
        return new Response(JSON.stringify({ success: false, message: t('noAccessToTicket') }), { status: 403 });
      }

      // Mark as seen by vendor
      await db
        .update(tickets)
        .set({ seenByVendor: true })
        .where(eq(tickets.id, ticket.id));
    }

    return new Response(JSON.stringify({ success: true, message: t('ticketSeenSuccess') }), { status: 200 });
  } catch (error: any) {
    console.error('Error marking ticket as seen:', error);
    return new Response(JSON.stringify({ success: false, message: t('serverError') }), { status: 500 });
  }
};
