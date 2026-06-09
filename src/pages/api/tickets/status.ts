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
    const { ticketId, status } = await request.json();

    if (!ticketId || !status) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    if (!['open', 'answered', 'closed'].includes(status)) {
      return new Response(JSON.stringify({ success: false, message: t('invalidStatus') }), { status: 400 });
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

    // 2. Authorization check
    if (session.username !== 'super') {
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
    }

    // 3. Update status
    await db
      .update(tickets)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticket.id));

    return new Response(JSON.stringify({ success: true, status }), { status: 200 });
  } catch (error: any) {
    console.error('Error changing ticket status:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('errorTicketStatusUpdate') }), { status: 500 });
  }
};
