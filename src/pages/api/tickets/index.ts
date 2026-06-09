import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { tickets, vendorUsers, type DBTicketMessage } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { and, eq } from 'drizzle-orm';
import { useTranslations } from '../../../utils/i18n';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const { vendorId, title, message, attachmentUrl } = await request.json();

    if (!vendorId || !title || !message) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    // Authorization check: Must be Super Admin or a user linked to the vendor
    if (session.username !== 'super') {
      const access = await db
        .select()
        .from(vendorUsers)
        .where(
          and(
            eq(vendorUsers.userId, session.userId),
            eq(vendorUsers.vendorId, Number(vendorId))
          )
        )
        .limit(1);

      if (access.length === 0) {
        return new Response(JSON.stringify({ success: false, message: t('noAccessToVendor') }), { status: 403 });
      }
    }

    // Build the initial message
    const initialMessage: DBTicketMessage = {
      senderId: session.userId,
      senderName: session.name,
      senderUsername: session.username,
      message,
      attachmentUrl: attachmentUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    // Insert ticket
    const inserted = await db
      .insert(tickets)
      .values({
        vendorId: Number(vendorId),
        userId: session.userId,
        title,
        status: 'open',
        messages: [initialMessage],
        seenByVendor: true,
        seenBySuper: false,
      })
      .returning({ id: tickets.id });

    return new Response(JSON.stringify({ success: true, ticketId: inserted[0].id }), { status: 200 });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('errorSaving') }), { status: 500 });
  }
};

