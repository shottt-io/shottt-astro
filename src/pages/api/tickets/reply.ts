import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { tickets, vendorUsers, type DBTicketMessage } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { ticketId, message, attachmentUrl } = await request.json();

    if (!ticketId || !message) {
      return new Response(JSON.stringify({ success: false, message: 'اطلاعات ارسالی ناقص است' }), { status: 400 });
    }

    // 1. Fetch the ticket
    const ticketList = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, Number(ticketId)))
      .limit(1);

    if (ticketList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'تیکت یافت نشد' }), { status: 404 });
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
        return new Response(JSON.stringify({ success: false, message: 'شما دسترسی به این تیکت را ندارید' }), { status: 403 });
      }
    }

    // 3. Build new message object
    const newReply: DBTicketMessage = {
      senderId: session.userId,
      senderName: session.name,
      senderUsername: session.username,
      message,
      attachmentUrl: attachmentUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...ticket.messages, newReply];
    
    // 4. Update status: Super admin reply sets it to 'answered', vendor admin reply resets to 'open'
    const newStatus = session.username === 'super' ? 'answered' : 'open';

    await db
      .update(tickets)
      .set({
        messages: updatedMessages,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticket.id));

    return new Response(JSON.stringify({ success: true, messages: updatedMessages, status: newStatus }), { status: 200 });
  } catch (error: any) {
    console.error('Error replying to ticket:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطا در ثبت پاسخ' }), { status: 500 });
  }
};
