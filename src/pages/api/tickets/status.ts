import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { tickets, vendorUsers } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { and, eq } from 'drizzle-orm';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { ticketId, status } = await request.json();

    if (!ticketId || !status) {
      return new Response(JSON.stringify({ success: false, message: 'اطلاعات ارسالی ناقص است' }), { status: 400 });
    }

    if (!['open', 'answered', 'closed'].includes(status)) {
      return new Response(JSON.stringify({ success: false, message: 'وضعیت نامعتبر است' }), { status: 400 });
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
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطا در بروزرسانی وضعیت تیکت' }), { status: 500 });
  }
};
